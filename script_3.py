# Create Dockerfile for backend
dockerfile = '''# Use Node.js official image
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY . .

# Create uploads directory
RUN mkdir -p uploads

# Expose port
EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:5000/health || exit 1

# Start the application
CMD ["npm", "start"]
'''

with open('backend-Dockerfile', 'w') as f:
    f.write(dockerfile)

print("✅ Created Dockerfile")

# Create Docker Compose configuration
docker_compose = '''version: '3.8'

services:
  # Frontend React Application
  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    ports:
      - "3000:3000"
    environment:
      - REACT_APP_API_URL=http://localhost:5000/api/v1
      - REACT_APP_SOCKET_URL=http://localhost:8080
    depends_on:
      - backend
    volumes:
      - ./frontend:/app
      - /app/node_modules

  # Backend API Server
  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    ports:
      - "5000:5000"
    environment:
      - NODE_ENV=development
      - DB_HOST=mysql
      - DB_PORT=3306
      - DB_NAME=skillswap
      - DB_USER=skillswap_user
      - DB_PASSWORD=skillswap_password
      - REDIS_HOST=redis
      - REDIS_PORT=6379
      - JWT_SECRET=your_super_secret_jwt_key_change_in_production
      - FRONTEND_URL=http://localhost:3000
    depends_on:
      - mysql
      - redis
    volumes:
      - ./backend:/app
      - /app/node_modules
      - ./backend/uploads:/app/uploads

  # Socket.IO Server (can be combined with backend in production)
  socket-server:
    build:
      context: ./backend
      dockerfile: Dockerfile
    ports:
      - "8080:8080"
    environment:
      - NODE_ENV=development
      - REDIS_HOST=redis
      - REDIS_PORT=6379
      - DB_HOST=mysql
      - DB_PORT=3306
      - DB_NAME=skillswap
      - DB_USER=skillswap_user
      - DB_PASSWORD=skillswap_password
    depends_on:
      - mysql
      - redis
    volumes:
      - ./backend:/app
      - /app/node_modules

  # MySQL Database
  mysql:
    image: mysql:8.0
    restart: unless-stopped
    environment:
      MYSQL_DATABASE: skillswap
      MYSQL_USER: skillswap_user
      MYSQL_PASSWORD: skillswap_password
      MYSQL_ROOT_PASSWORD: root_password
    ports:
      - "3306:3306"
    volumes:
      - mysql_data:/var/lib/mysql
      - ./database/init:/docker-entrypoint-initdb.d
    command: --default-authentication-plugin=mysql_native_password

  # Redis Cache & Session Store
  redis:
    image: redis:7-alpine
    restart: unless-stopped
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    command: redis-server --appendonly yes

  # Nginx Reverse Proxy (Production)
  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf
      - ./nginx/ssl:/etc/nginx/ssl
    depends_on:
      - frontend
      - backend
    profiles:
      - production

  # AI Recommendation Service (Optional Microservice)
  ai-recommender:
    build:
      context: ./ai-service
      dockerfile: Dockerfile
    ports:
      - "9000:9000"
    environment:
      - MODEL_PATH=/app/models
      - DB_HOST=mysql
      - DB_PORT=3306
      - DB_NAME=skillswap
      - DB_USER=skillswap_user
      - DB_PASSWORD=skillswap_password
    depends_on:
      - mysql
    volumes:
      - ./ai-service:/app
      - ai_models:/app/models
    profiles:
      - ai-enabled

volumes:
  mysql_data:
  redis_data:
  ai_models:

networks:
  default:
    driver: bridge
'''

with open('docker-compose.yml', 'w') as f:
    f.write(docker_compose)

print("✅ Created Docker Compose configuration")

# Create database initialization script
db_init = '''-- SkillSwap Database Schema
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
'''

with open('database-init.sql', 'w') as f:
    f.write(db_init)

print("✅ Created database initialization script")