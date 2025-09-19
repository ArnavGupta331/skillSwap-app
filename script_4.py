# Create skills API routes
skills_routes = '''const express = require('express');
const { body, validationResult, query } = require('express-validator');
const db = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

/**
 * @swagger
 * /skills/search:
 *   get:
 *     summary: Search skills with filters
 *     tags: [Skills]
 *     parameters:
 *       - in: query
 *         name: q
 *         schema:
 *           type: string
 *         description: Search query
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Skill category filter
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [offering, seeking]
 *         description: Filter by skill type
 *       - in: query
 *         name: level
 *         schema:
 *           type: string
 *           enum: [beginner, intermediate, expert]
 *         description: Filter by proficiency level
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *         description: Items per page
 *     responses:
 *       200:
 *         description: Skills retrieved successfully
 */
router.get('/search', [
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 100 }),
    query('type').optional().isIn(['offering', 'seeking']),
    query('level').optional().isIn(['beginner', 'intermediate', 'expert'])
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const {
            q = '',
            category = '',
            type = '',
            level = '',
            page = 1,
            limit = 20
        } = req.query;

        const offset = (page - 1) * limit;
        let whereConditions = ['us.is_active = TRUE', 'u.is_active = TRUE'];
        let params = [];

        if (q) {
            whereConditions.push('(s.name LIKE ? OR s.description LIKE ?)');
            params.push(`%${q}%`, `%${q}%`);
        }

        if (category) {
            whereConditions.push('s.category = ?');
            params.push(category);
        }

        if (type) {
            whereConditions.push('us.skill_type = ?');
            params.push(type);
        }

        if (level) {
            whereConditions.push('us.proficiency_level = ?');
            params.push(level);
        }

        const whereClause = whereConditions.length > 0 ? 'WHERE ' + whereConditions.join(' AND ') : '';

        const [skills] = await db.execute(`
            SELECT 
                us.id as user_skill_id,
                s.id as skill_id,
                s.name as skill_name,
                s.category,
                s.description as skill_description,
                us.skill_type,
                us.proficiency_level,
                us.description as user_description,
                u.id as user_id,
                u.username,
                u.full_name,
                u.profile_image,
                u.location,
                AVG(r.rating) as user_rating,
                COUNT(DISTINCT t1.id) + COUNT(DISTINCT t2.id) as total_trades
            FROM user_skills us
            JOIN skills s ON us.skill_id = s.id
            JOIN users u ON us.user_id = u.id
            LEFT JOIN trades t1 ON u.id = t1.requester_id AND t1.status = 'completed'
            LEFT JOIN trades t2 ON u.id = t2.provider_id AND t2.status = 'completed'
            LEFT JOIN reviews r ON u.id = r.reviewee_id
            ${whereClause}
            GROUP BY us.id, s.id, u.id
            ORDER BY total_trades DESC, user_rating DESC
            LIMIT ? OFFSET ?
        `, [...params, parseInt(limit), offset]);

        // Get total count for pagination
        const [countResult] = await db.execute(`
            SELECT COUNT(DISTINCT us.id) as total
            FROM user_skills us
            JOIN skills s ON us.skill_id = s.id
            JOIN users u ON us.user_id = u.id
            ${whereClause}
        `, params);

        const totalItems = countResult[0].total;
        const totalPages = Math.ceil(totalItems / limit);

        res.json({
            skills,
            pagination: {
                currentPage: parseInt(page),
                totalPages,
                totalItems,
                hasNextPage: page < totalPages,
                hasPrevPage: page > 1
            }
        });
    } catch (error) {
        console.error('Skills search error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

/**
 * @swagger
 * /skills/categories:
 *   get:
 *     summary: Get all skill categories
 *     tags: [Skills]
 *     responses:
 *       200:
 *         description: Categories retrieved successfully
 */
router.get('/categories', async (req, res) => {
    try {
        const [categories] = await db.execute(`
            SELECT 
                s.category,
                COUNT(*) as skill_count,
                COUNT(DISTINCT us.user_id) as user_count
            FROM skills s
            LEFT JOIN user_skills us ON s.id = us.skill_id AND us.is_active = TRUE
            WHERE s.is_active = TRUE
            GROUP BY s.category
            ORDER BY skill_count DESC
        `);

        res.json({ categories });
    } catch (error) {
        console.error('Categories error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

/**
 * @swagger
 * /skills:
 *   post:
 *     summary: Add a skill to user profile
 *     tags: [Skills]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - skillName
 *               - category
 *               - skillType
 *               - proficiencyLevel
 *             properties:
 *               skillName:
 *                 type: string
 *               category:
 *                 type: string
 *               skillType:
 *                 type: string
 *                 enum: [offering, seeking]
 *               proficiencyLevel:
 *                 type: string
 *                 enum: [beginner, intermediate, expert]
 *               description:
 *                 type: string
 *     responses:
 *       201:
 *         description: Skill added successfully
 *       400:
 *         description: Validation error or skill already exists
 */
router.post('/', authenticateToken, [
    body('skillName').trim().isLength({ min: 2, max: 100 }),
    body('category').trim().isLength({ min: 2, max: 50 }),
    body('skillType').isIn(['offering', 'seeking']),
    body('proficiencyLevel').isIn(['beginner', 'intermediate', 'expert']),
    body('description').optional().trim().isLength({ max: 1000 })
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { skillName, category, skillType, proficiencyLevel, description = '' } = req.body;

        // Check if skill exists, if not create it
        let [skills] = await db.execute('SELECT id FROM skills WHERE name = ?', [skillName]);
        
        let skillId;
        if (skills.length === 0) {
            const [skillResult] = await db.execute(
                'INSERT INTO skills (name, category, description) VALUES (?, ?, ?)',
                [skillName, category, description]
            );
            skillId = skillResult.insertId;
        } else {
            skillId = skills[0].id;
        }

        // Check if user already has this skill with the same type
        const [existingUserSkills] = await db.execute(
            'SELECT id FROM user_skills WHERE user_id = ? AND skill_id = ? AND skill_type = ?',
            [req.user.id, skillId, skillType]
        );

        if (existingUserSkills.length > 0) {
            return res.status(400).json({ error: 'You already have this skill in your profile' });
        }

        // Add skill to user profile
        const [result] = await db.execute(
            'INSERT INTO user_skills (user_id, skill_id, skill_type, proficiency_level, description) VALUES (?, ?, ?, ?, ?)',
            [req.user.id, skillId, skillType, proficiencyLevel, description]
        );

        res.status(201).json({
            message: 'Skill added successfully',
            userSkillId: result.insertId
        });
    } catch (error) {
        console.error('Add skill error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

/**
 * @swagger
 * /skills/{id}:
 *   get:
 *     summary: Get skill details
 *     tags: [Skills]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: User skill ID
 *     responses:
 *       200:
 *         description: Skill details retrieved successfully
 *       404:
 *         description: Skill not found
 */
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const [skills] = await db.execute(`
            SELECT 
                us.id as user_skill_id,
                s.id as skill_id,
                s.name as skill_name,
                s.category,
                s.description as skill_description,
                us.skill_type,
                us.proficiency_level,
                us.description as user_description,
                us.created_at,
                u.id as user_id,
                u.username,
                u.full_name,
                u.bio,
                u.profile_image,
                u.location,
                AVG(r.rating) as user_rating,
                COUNT(DISTINCT r.id) as review_count,
                COUNT(DISTINCT t1.id) + COUNT(DISTINCT t2.id) as total_trades
            FROM user_skills us
            JOIN skills s ON us.skill_id = s.id
            JOIN users u ON us.user_id = u.id
            LEFT JOIN trades t1 ON u.id = t1.requester_id AND t1.status = 'completed'
            LEFT JOIN trades t2 ON u.id = t2.provider_id AND t2.status = 'completed'
            LEFT JOIN reviews r ON u.id = r.reviewee_id
            WHERE us.id = ? AND us.is_active = TRUE
            GROUP BY us.id
        `, [id]);

        if (skills.length === 0) {
            return res.status(404).json({ error: 'Skill not found' });
        }

        // Get recent reviews for this user
        const [reviews] = await db.execute(`
            SELECT 
                r.rating,
                r.comment,
                r.created_at,
                u.username as reviewer_username,
                u.full_name as reviewer_name,
                u.profile_image as reviewer_image
            FROM reviews r
            JOIN users u ON r.reviewer_id = u.id
            WHERE r.reviewee_id = ? AND r.is_public = TRUE
            ORDER BY r.created_at DESC
            LIMIT 5
        `, [skills[0].user_id]);

        res.json({
            skill: skills[0],
            recent_reviews: reviews
        });
    } catch (error) {
        console.error('Skill details error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;
'''

with open('backend-skills-routes.js', 'w') as f:
    f.write(skills_routes)

print("✅ Created skills API routes")

# Create Socket.IO handler for real-time messaging
socket_handler = '''const jwt = require('jsonwebtoken');
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
'''

with open('backend-socket-handler.js', 'w') as f:
    f.write(socket_handler)

print("✅ Created Socket.IO handler")

# Create AI recommendation service
ai_recommender = '''const express = require('express');
const db = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Simple content-based filtering for skill recommendations
class SkillRecommender {
    constructor() {
        this.userSkillMatrix = new Map();
        this.skillSimilarity = new Map();
    }

    // Calculate Jaccard similarity between skill sets
    calculateSimilarity(skillsA, skillsB) {
        const setA = new Set(skillsA);
        const setB = new Set(skillsB);
        
        const intersection = new Set([...setA].filter(x => setB.has(x)));
        const union = new Set([...setA, ...setB]);
        
        return union.size === 0 ? 0 : intersection.size / union.size;
    }

    // Get recommendations based on user's skills and activity
    async getRecommendations(userId, limit = 5) {
        try {
            // Get user's current skills
            const [userSkills] = await db.execute(`
                SELECT s.id, s.name, s.category, us.skill_type
                FROM user_skills us
                JOIN skills s ON us.skill_id = s.id
                WHERE us.user_id = ? AND us.is_active = TRUE
            `, [userId]);

            const offeringSkills = userSkills.filter(s => s.skill_type === 'offering').map(s => s.name);
            const seekingSkills = userSkills.filter(s => s.skill_type === 'seeking').map(s => s.name);
            const userCategories = [...new Set(userSkills.map(s => s.category))];

            // Get other users with complementary skills
            const [potentialMatches] = await db.execute(`
                SELECT DISTINCT
                    us.user_id,
                    u.username,
                    u.full_name,
                    s.id as skill_id,
                    s.name as skill_name,
                    s.category,
                    us.skill_type,
                    us.proficiency_level,
                    AVG(r.rating) as user_rating,
                    COUNT(DISTINCT t1.id) + COUNT(DISTINCT t2.id) as total_trades
                FROM user_skills us
                JOIN skills s ON us.skill_id = s.id
                JOIN users u ON us.user_id = u.id
                LEFT JOIN trades t1 ON u.id = t1.requester_id AND t1.status = 'completed'
                LEFT JOIN trades t2 ON u.id = t2.provider_id AND t2.status = 'completed'
                LEFT JOIN reviews r ON u.id = r.reviewee_id
                WHERE us.user_id != ? 
                AND u.is_active = TRUE 
                AND us.is_active = TRUE
                AND (
                    (us.skill_type = 'offering' AND s.name IN (${seekingSkills.map(() => '?').join(', ') || 'NULL'}))
                    OR (us.skill_type = 'seeking' AND s.name IN (${offeringSkills.map(() => '?').join(', ') || 'NULL'}))
                    OR s.category IN (${userCategories.map(() => '?').join(', ') || 'NULL'})
                )
                GROUP BY us.id
                ORDER BY user_rating DESC, total_trades DESC
                LIMIT 20
            `, [userId, ...seekingSkills, ...offeringSkills, ...userCategories]);

            // Score and rank recommendations
            const recommendations = [];
            const userScores = new Map();

            potentialMatches.forEach(match => {
                let score = 0;
                
                // Higher score for exact skill matches
                if (match.skill_type === 'offering' && seekingSkills.includes(match.skill_name)) {
                    score += 10;
                } else if (match.skill_type === 'seeking' && offeringSkills.includes(match.skill_name)) {
                    score += 8;
                } else if (userCategories.includes(match.category)) {
                    score += 3;
                }

                // Bonus for user rating and experience
                if (match.user_rating) {
                    score += match.user_rating * 2;
                }
                score += Math.min(match.total_trades * 0.5, 10);

                // Bonus for complementary skill levels
                if (match.proficiency_level === 'expert') score += 2;
                if (match.proficiency_level === 'intermediate') score += 1;

                if (!userScores.has(match.user_id) || userScores.get(match.user_id).score < score) {
                    userScores.set(match.user_id, {
                        ...match,
                        score
                    });
                }
            });

            // Get top recommendations
            const topRecommendations = Array.from(userScores.values())
                .sort((a, b) => b.score - a.score)
                .slice(0, limit);

            return topRecommendations;
        } catch (error) {
            console.error('Recommendation error:', error);
            throw error;
        }
    }

    // Get trending skills based on recent activity
    async getTrendingSkills(limit = 10) {
        try {
            const [trendingSkills] = await db.execute(`
                SELECT 
                    s.id,
                    s.name,
                    s.category,
                    COUNT(DISTINCT us.id) as user_count,
                    COUNT(DISTINCT t1.id) + COUNT(DISTINCT t2.id) as trade_count,
                    (COUNT(DISTINCT us.id) * 0.3 + COUNT(DISTINCT t1.id) + COUNT(DISTINCT t2.id)) as trend_score
                FROM skills s
                JOIN user_skills us ON s.id = us.skill_id
                LEFT JOIN trades t1 ON us.id = t1.requester_skill_id 
                    AND t1.created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
                LEFT JOIN trades t2 ON us.id = t2.provider_skill_id 
                    AND t2.created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
                WHERE s.is_active = TRUE AND us.is_active = TRUE
                GROUP BY s.id
                ORDER BY trend_score DESC
                LIMIT ?
            `, [limit]);

            return trendingSkills;
        } catch (error) {
            console.error('Trending skills error:', error);
            throw error;
        }
    }
}

const recommender = new SkillRecommender();

/**
 * @swagger
 * /recommendations/{userId}:
 *   get:
 *     summary: Get personalized skill recommendations
 *     tags: [Recommendations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 5
 *     responses:
 *       200:
 *         description: Recommendations retrieved successfully
 */
router.get('/:userId', authenticateToken, async (req, res) => {
    try {
        const { userId } = req.params;
        const { limit = 5 } = req.query;

        // Ensure user can only get their own recommendations or admin
        if (parseInt(userId) !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ error: 'Forbidden' });
        }

        const recommendations = await recommender.getRecommendations(userId, parseInt(limit));
        
        res.json({
            recommendations,
            message: recommendations.length === 0 ? 'No recommendations available yet. Complete your profile and start trading!' : null
        });
    } catch (error) {
        console.error('Get recommendations error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

/**
 * @swagger
 * /recommendations/trending:
 *   get:
 *     summary: Get trending skills
 *     tags: [Recommendations]
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *     responses:
 *       200:
 *         description: Trending skills retrieved successfully
 */
router.get('/trending', async (req, res) => {
    try {
        const { limit = 10 } = req.query;
        const trendingSkills = await recommender.getTrendingSkills(parseInt(limit));
        
        res.json({ trendingSkills });
    } catch (error) {
        console.error('Get trending skills error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;
'''

with open('backend-recommendations.js', 'w') as f:
    f.write(ai_recommender)

print("✅ Created AI recommendation service")