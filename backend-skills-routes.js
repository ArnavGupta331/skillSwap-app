const express = require('express');
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
