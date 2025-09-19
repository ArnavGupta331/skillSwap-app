# Create database configuration
database_config = '''const mysql = require('mysql2/promise');
require('dotenv').config();

const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER || 'skillswap_user',
    password: process.env.DB_PASSWORD || 'password',
    database: process.env.DB_NAME || 'skillswap',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    acquireTimeout: 60000,
    timeout: 60000,
    reconnect: true
};

const pool = mysql.createPool(dbConfig);

// Test database connection
async function testConnection() {
    try {
        const connection = await pool.getConnection();
        console.log('✅ Database connected successfully');
        connection.release();
    } catch (error) {
        console.error('❌ Database connection failed:', error.message);
    }
}

testConnection();

module.exports = pool;
'''

with open('backend-database.js', 'w') as f:
    f.write(database_config)

print("✅ Created database configuration")

# Create authentication middleware
auth_middleware = '''const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const db = require('../config/database');

// Middleware to authenticate JWT token
const authenticateToken = async (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'Access token required' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Verify user still exists and is active
        const [rows] = await db.execute(
            'SELECT id, username, email, role, is_active FROM users WHERE id = ?',
            [decoded.userId]
        );

        if (rows.length === 0 || !rows[0].is_active) {
            return res.status(401).json({ error: 'Invalid or expired token' });
        }

        req.user = rows[0];
        next();
    } catch (error) {
        return res.status(403).json({ error: 'Invalid token' });
    }
};

// Middleware to check if user has admin role
const requireAdmin = (req, res, next) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Admin access required' });
    }
    next();
};

// Generate JWT token
const generateToken = (userId, username, email, role = 'user') => {
    return jwt.sign(
        { userId, username, email, role },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );
};

// Hash password
const hashPassword = async (password) => {
    const saltRounds = 12;
    return await bcrypt.hash(password, saltRounds);
};

// Compare password
const comparePassword = async (password, hashedPassword) => {
    return await bcrypt.compare(password, hashedPassword);
};

module.exports = {
    authenticateToken,
    requireAdmin,
    generateToken,
    hashPassword,
    comparePassword
};
'''

with open('backend-auth-middleware.js', 'w') as f:
    f.write(auth_middleware)

print("✅ Created authentication middleware")

# Create auth routes
auth_routes = '''const express = require('express');
const { body, validationResult } = require('express-validator');
const db = require('../config/database');
const { 
    generateToken, 
    hashPassword, 
    comparePassword,
    authenticateToken 
} = require('../middleware/auth');

const router = express.Router();

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - email
 *               - password
 *               - fullName
 *             properties:
 *               username:
 *                 type: string
 *                 minLength: 3
 *                 maxLength: 50
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 minLength: 6
 *               fullName:
 *                 type: string
 *                 minLength: 2
 *                 maxLength: 100
 *     responses:
 *       201:
 *         description: User registered successfully
 *       400:
 *         description: Validation error or user already exists
 */
router.post('/register', [
    body('username')
        .isLength({ min: 3, max: 50 })
        .matches(/^[a-zA-Z0-9_]+$/)
        .withMessage('Username must be 3-50 characters and contain only letters, numbers, and underscores'),
    body('email').isEmail().normalizeEmail(),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('fullName').isLength({ min: 2, max: 100 }).trim()
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { username, email, password, fullName } = req.body;

        // Check if user already exists
        const [existingUsers] = await db.execute(
            'SELECT id FROM users WHERE email = ? OR username = ?',
            [email, username]
        );

        if (existingUsers.length > 0) {
            return res.status(400).json({ error: 'User already exists with this email or username' });
        }

        // Hash password and create user
        const hashedPassword = await hashPassword(password);
        const [result] = await db.execute(
            'INSERT INTO users (username, email, password_hash, full_name, created_at) VALUES (?, ?, ?, ?, NOW())',
            [username, email, hashedPassword, fullName]
        );

        const token = generateToken(result.insertId, username, email);

        res.status(201).json({
            message: 'User registered successfully',
            token,
            user: {
                id: result.insertId,
                username,
                email,
                fullName,
                isNewUser: true
            }
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Login user
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login successful
 *       401:
 *         description: Invalid credentials
 */
router.post('/login', [
    body('email').isEmail().normalizeEmail(),
    body('password').notEmpty().withMessage('Password is required')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { email, password } = req.body;

        // Find user by email
        const [users] = await db.execute(
            'SELECT id, username, email, password_hash, full_name, role, is_active FROM users WHERE email = ?',
            [email]
        );

        if (users.length === 0) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const user = users[0];

        if (!user.is_active) {
            return res.status(401).json({ error: 'Account is deactivated' });
        }

        // Verify password
        const isValidPassword = await comparePassword(password, user.password_hash);
        if (!isValidPassword) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const token = generateToken(user.id, user.username, user.email, user.role);

        res.json({
            message: 'Login successful',
            token,
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                fullName: user.full_name,
                role: user.role
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

/**
 * @swagger
 * /auth/profile:
 *   get:
 *     summary: Get user profile
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User profile retrieved successfully
 *       401:
 *         description: Unauthorized
 */
router.get('/profile', authenticateToken, async (req, res) => {
    try {
        const [users] = await db.execute(
            `SELECT u.id, u.username, u.email, u.full_name, u.bio, u.location, 
                    u.profile_image, u.created_at, u.updated_at,
                    COUNT(DISTINCT t1.id) as trades_as_requester,
                    COUNT(DISTINCT t2.id) as trades_as_provider,
                    AVG(r.rating) as average_rating,
                    COUNT(DISTINCT r.id) as review_count
             FROM users u
             LEFT JOIN trades t1 ON u.id = t1.requester_id AND t1.status = 'completed'
             LEFT JOIN trades t2 ON u.id = t2.provider_id AND t2.status = 'completed'
             LEFT JOIN reviews r ON u.id = r.reviewee_id
             WHERE u.id = ?
             GROUP BY u.id`,
            [req.user.id]
        );

        if (users.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        const user = users[0];
        user.total_trades = user.trades_as_requester + user.trades_as_provider;

        res.json({ user });
    } catch (error) {
        console.error('Profile error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;
'''

with open('backend-auth-routes.js', 'w') as f:
    f.write(auth_routes)

print("✅ Created authentication routes")