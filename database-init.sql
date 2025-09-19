-- SkillSwap Database Schema
-- Initialize the SkillSwap database with all required tables

CREATE DATABASE IF NOT EXISTS skillswap;
USE skillswap;

-- Users table
CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    bio TEXT,
    profile_image VARCHAR(255),
    location VARCHAR(100),
    role ENUM('user', 'admin') DEFAULT 'user',
    is_active BOOLEAN DEFAULT TRUE,
    email_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Skills table
CREATE TABLE skills (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    category VARCHAR(50) NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_category (category),
    INDEX idx_name (name)
);

-- User Skills table (many-to-many relationship)
CREATE TABLE user_skills (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    skill_id INT NOT NULL,
    skill_type ENUM('offering', 'seeking') NOT NULL,
    proficiency_level ENUM('beginner', 'intermediate', 'expert') NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (skill_id) REFERENCES skills(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_skill_type (user_id, skill_id, skill_type),
    INDEX idx_user_skill_type (user_id, skill_type),
    INDEX idx_skill_user (skill_id, user_id)
);

-- Trades table
CREATE TABLE trades (
    id INT PRIMARY KEY AUTO_INCREMENT,
    requester_id INT NOT NULL,
    provider_id INT NOT NULL,
    requester_skill_id INT NOT NULL,
    provider_skill_id INT NOT NULL,
    status ENUM('pending', 'accepted', 'rejected', 'in_progress', 'completed', 'cancelled') DEFAULT 'pending',
    title VARCHAR(200) NOT NULL,
    description TEXT,
    meeting_type ENUM('online', 'in_person', 'hybrid') DEFAULT 'online',
    duration_hours INT,
    scheduled_date DATETIME,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    completed_at TIMESTAMP NULL,
    FOREIGN KEY (requester_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (provider_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (requester_skill_id) REFERENCES user_skills(id) ON DELETE CASCADE,
    FOREIGN KEY (provider_skill_id) REFERENCES user_skills(id) ON DELETE CASCADE,
    INDEX idx_requester_status (requester_id, status),
    INDEX idx_provider_status (provider_id, status),
    INDEX idx_status_created (status, created_at)
);

-- Messages table for trade communications
CREATE TABLE messages (
    id INT PRIMARY KEY AUTO_INCREMENT,
    trade_id INT NOT NULL,
    sender_id INT NOT NULL,
    receiver_id INT NOT NULL,
    content TEXT NOT NULL,
    message_type ENUM('text', 'image', 'file', 'system') DEFAULT 'text',
    read_status BOOLEAN DEFAULT FALSE,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (trade_id) REFERENCES trades(id) ON DELETE CASCADE,
    FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (receiver_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_trade_timestamp (trade_id, timestamp),
    INDEX idx_receiver_read (receiver_id, read_status)
);

-- Reviews table
CREATE TABLE reviews (
    id INT PRIMARY KEY AUTO_INCREMENT,
    trade_id INT NOT NULL,
    reviewer_id INT NOT NULL,
    reviewee_id INT NOT NULL,
    rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    is_public BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (trade_id) REFERENCES trades(id) ON DELETE CASCADE,
    FOREIGN KEY (reviewer_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (reviewee_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_trade_reviewer (trade_id, reviewer_id),
    INDEX idx_reviewee_rating (reviewee_id, rating),
    INDEX idx_public_created (is_public, created_at)
);

-- Badges table for gamification
CREATE TABLE badges (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT NOT NULL,
    icon VARCHAR(255),
    badge_type ENUM('achievement', 'milestone', 'special') DEFAULT 'achievement',
    criteria TEXT,
    points_required INT DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- User Badges table (many-to-many relationship)
CREATE TABLE user_badges (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    badge_id INT NOT NULL,
    earned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    progress INT DEFAULT 100,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (badge_id) REFERENCES badges(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_badge (user_id, badge_id),
    INDEX idx_user_earned (user_id, earned_at)
);

-- Notifications table
CREATE TABLE notifications (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    type VARCHAR(50) NOT NULL,
    title VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    related_id INT,
    related_type VARCHAR(50),
    read_status BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_read_created (user_id, read_status, created_at)
);

-- Reports table for content moderation
CREATE TABLE reports (
    id INT PRIMARY KEY AUTO_INCREMENT,
    reporter_id INT NOT NULL,
    reported_user_id INT,
    reported_trade_id INT,
    reported_review_id INT,
    reason VARCHAR(100) NOT NULL,
    description TEXT,
    status ENUM('pending', 'investigating', 'resolved', 'dismissed') DEFAULT 'pending',
    admin_notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    resolved_at TIMESTAMP NULL,
    FOREIGN KEY (reporter_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (reported_user_id) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (reported_trade_id) REFERENCES trades(id) ON DELETE SET NULL,
    FOREIGN KEY (reported_review_id) REFERENCES reviews(id) ON DELETE SET NULL,
    INDEX idx_status_created (status, created_at)
);

-- Insert sample skills
INSERT INTO skills (name, category, description) VALUES
('UI/UX Design', 'Design', 'User interface and user experience design'),
('React Development', 'Programming', 'Building modern web applications with React'),
('Node.js', 'Programming', 'Backend JavaScript development'),
('Python', 'Programming', 'Python programming language'),
('Data Analysis', 'Analytics', 'Data science and statistical analysis'),
('Digital Marketing', 'Marketing', 'Online marketing strategies and campaigns'),
('Photography', 'Visual Arts', 'Digital photography techniques'),
('Video Editing', 'Media', 'Video production and post-production'),
('Guitar', 'Music', 'Playing acoustic and electric guitar'),
('Piano', 'Music', 'Piano playing and music theory'),
('Spanish', 'Languages', 'Spanish language conversation and grammar'),
('French', 'Languages', 'French language skills'),
('Cooking', 'Lifestyle', 'Culinary skills and recipes'),
('Fitness Training', 'Health', 'Personal training and workout planning'),
('Writing', 'Creative', 'Creative writing and content creation');

-- Insert sample badges
INSERT INTO badges (name, description, icon, badge_type, criteria) VALUES
('First Trade', 'Complete your first skill exchange', '🎯', 'milestone', 'Complete 1 trade'),
('Top Teacher', 'Maintain a high rating as an instructor', '⭐', 'achievement', 'Maintain 4.5+ rating with 5+ reviews'),
('Frequent Swapper', 'Complete multiple skill trades', '🔄', 'achievement', 'Complete 10+ trades'),
('5-Star Mentor', 'Receive excellent reviews', '🌟', 'achievement', 'Receive 5 five-star reviews'),
('Skill Explorer', 'Learn diverse skill categories', '🗺️', 'achievement', 'Learn skills from 5+ categories'),
('Community Builder', 'Help many people learn', '🏗️', 'special', 'Help 20+ people learn skills'),
('Early Adopter', 'Join the platform early', '🚀', 'special', 'Register in first 100 users'),
('Master Trader', 'Complete many successful trades', '👑', 'achievement', 'Complete 50+ trades'),
('Perfect Rating', 'Maintain perfect 5.0 rating', '💎', 'special', 'Maintain 5.0 rating with 10+ reviews'),
('Generous Helper', 'Offer help frequently', '🤝', 'achievement', 'Accept 25+ trade requests');

-- Create admin user (password: admin123)
INSERT INTO users (username, email, password_hash, full_name, role, email_verified) VALUES
('admin', 'admin@skillswap.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/8wLYHqCFm', 'SkillSwap Admin', 'admin', TRUE);
