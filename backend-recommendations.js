const express = require('express');
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
