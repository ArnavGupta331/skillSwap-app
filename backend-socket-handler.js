const jwt = require('jsonwebtoken');
const db = require('../config/database');

module.exports = (io) => {
    // Middleware to authenticate socket connections
    io.use(async (socket, next) => {
        try {
            const token = socket.handshake.auth.token;
            if (!token) {
                return next(new Error('Authentication error'));
            }

            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // Verify user exists and is active
            const [users] = await db.execute(
                'SELECT id, username, full_name, profile_image FROM users WHERE id = ? AND is_active = TRUE',
                [decoded.userId]
            );

            if (users.length === 0) {
                return next(new Error('Authentication error'));
            }

            socket.user = users[0];
            next();
        } catch (error) {
            next(new Error('Authentication error'));
        }
    });

    io.on('connection', (socket) => {
        console.log(`User ${socket.user.username} connected`);

        // Join user to their personal room for notifications
        socket.join(`user_${socket.user.id}`);

        // Join trade rooms for active trades
        socket.on('join_trade', async (tradeId) => {
            try {
                // Verify user is part of this trade
                const [trades] = await db.execute(
                    'SELECT id FROM trades WHERE id = ? AND (requester_id = ? OR provider_id = ?)',
                    [tradeId, socket.user.id, socket.user.id]
                );

                if (trades.length > 0) {
                    socket.join(`trade_${tradeId}`);
                    socket.emit('joined_trade', { tradeId });
                }
            } catch (error) {
                socket.emit('error', { message: 'Failed to join trade room' });
            }
        });

        // Handle sending messages
        socket.on('send_message', async (data) => {
            try {
                const { tradeId, content, messageType = 'text' } = data;

                // Verify user is part of this trade
                const [trades] = await db.execute(
                    'SELECT requester_id, provider_id FROM trades WHERE id = ? AND (requester_id = ? OR provider_id = ?)',
                    [tradeId, socket.user.id, socket.user.id]
                );

                if (trades.length === 0) {
                    return socket.emit('error', { message: 'Unauthorized' });
                }

                const trade = trades[0];
                const receiverId = trade.requester_id === socket.user.id ? trade.provider_id : trade.requester_id;

                // Save message to database
                const [result] = await db.execute(
                    'INSERT INTO messages (trade_id, sender_id, receiver_id, content, message_type) VALUES (?, ?, ?, ?, ?)',
                    [tradeId, socket.user.id, receiverId, content, messageType]
                );

                const message = {
                    id: result.insertId,
                    tradeId,
                    senderId: socket.user.id,
                    receiverId,
                    content,
                    messageType,
                    timestamp: new Date().toISOString(),
                    sender: {
                        username: socket.user.username,
                        fullName: socket.user.full_name,
                        profileImage: socket.user.profile_image
                    }
                };

                // Send message to trade room
                io.to(`trade_${tradeId}`).emit('new_message', message);

                // Send notification to receiver if not in trade room
                io.to(`user_${receiverId}`).emit('message_notification', {
                    tradeId,
                    senderName: socket.user.full_name,
                    preview: content.substring(0, 50)
                });

            } catch (error) {
                console.error('Send message error:', error);
                socket.emit('error', { message: 'Failed to send message' });
            }
        });

        // Handle typing indicators
        socket.on('typing_start', (data) => {
            socket.to(`trade_${data.tradeId}`).emit('user_typing', {
                userId: socket.user.id,
                username: socket.user.username
            });
        });

        socket.on('typing_stop', (data) => {
            socket.to(`trade_${data.tradeId}`).emit('user_stop_typing', {
                userId: socket.user.id
            });
        });

        // Handle marking messages as read
        socket.on('mark_messages_read', async (data) => {
            try {
                const { tradeId } = data;

                await db.execute(
                    'UPDATE messages SET read_status = TRUE WHERE trade_id = ? AND receiver_id = ?',
                    [tradeId, socket.user.id]
                );

                socket.emit('messages_marked_read', { tradeId });
            } catch (error) {
                socket.emit('error', { message: 'Failed to mark messages as read' });
            }
        });

        // Handle trade status updates
        socket.on('update_trade_status', async (data) => {
            try {
                const { tradeId, status, notes = '' } = data;

                // Verify user is part of this trade and can update status
                const [trades] = await db.execute(
                    'SELECT requester_id, provider_id, status as current_status FROM trades WHERE id = ? AND (requester_id = ? OR provider_id = ?)',
                    [tradeId, socket.user.id, socket.user.id]
                );

                if (trades.length === 0) {
                    return socket.emit('error', { message: 'Unauthorized' });
                }

                const trade = trades[0];
                let canUpdate = false;

                // Business logic for status updates
                if (status === 'accepted' && trade.current_status === 'pending') {
                    canUpdate = trade.provider_id === socket.user.id;
                } else if (status === 'rejected' && trade.current_status === 'pending') {
                    canUpdate = trade.provider_id === socket.user.id;
                } else if (status === 'in_progress' && trade.current_status === 'accepted') {
                    canUpdate = true;
                } else if (status === 'completed' && trade.current_status === 'in_progress') {
                    canUpdate = true;
                }

                if (!canUpdate) {
                    return socket.emit('error', { message: 'Cannot update trade status' });
                }

                // Update trade status
                const updateData = [status, notes, tradeId];
                let updateQuery = 'UPDATE trades SET status = ?, notes = ? WHERE id = ?';

                if (status === 'completed') {
                    updateQuery = 'UPDATE trades SET status = ?, notes = ?, completed_at = NOW() WHERE id = ?';
                }

                await db.execute(updateQuery, updateData);

                // Notify both users
                const receiverId = trade.requester_id === socket.user.id ? trade.provider_id : trade.requester_id;

                const statusUpdate = {
                    tradeId,
                    status,
                    notes,
                    updatedBy: socket.user.full_name,
                    timestamp: new Date().toISOString()
                };

                io.to(`trade_${tradeId}`).emit('trade_status_updated', statusUpdate);
                io.to(`user_${receiverId}`).emit('trade_notification', {
                    type: 'status_update',
                    tradeId,
                    message: `Trade status updated to ${status}`
                });

            } catch (error) {
                console.error('Update trade status error:', error);
                socket.emit('error', { message: 'Failed to update trade status' });
            }
        });

        socket.on('disconnect', () => {
            console.log(`User ${socket.user.username} disconnected`);
        });
    });
};
