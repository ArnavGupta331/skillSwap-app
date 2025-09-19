# Create main Express app.js file
app_js = '''const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
require('dotenv').config();

// Import routes
const authRoutes = require('./routes/auth');
const skillsRoutes = require('./routes/skills');
const tradesRoutes = require('./routes/trades');
const messagesRoutes = require('./routes/messages');
const reviewsRoutes = require('./routes/reviews');
const adminRoutes = require('./routes/admin');
const userRoutes = require('./routes/users');

// Import middleware
const errorHandler = require('./middleware/errorHandler');
const { authenticateToken } = require('./middleware/auth');

const app = express();
const PORT = process.env.PORT || 5000;

// Security middleware
app.use(helmet());
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true
}));

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Logging middleware
app.use(morgan('combined'));

// Swagger documentation
const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'SkillSwap API',
            version: '1.0.0',
            description: 'API for SkillSwap - A skill exchange platform where users trade skills instead of money',
            contact: {
                name: 'SkillSwap Team',
                email: 'api@skillswap.com'
            }
        },
        servers: [
            {
                url: 'http://localhost:5000/api/v1',
                description: 'Development server'
            },
            {
                url: 'https://api.skillswap.com/v1',
                description: 'Production server'
            }
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT'
                }
            }
        }
    },
    apis: ['./src/routes/*.js', './src/models/*.js']
};

const specs = swaggerJsdoc(options);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));

// API routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/skills', skillsRoutes);
app.use('/api/v1/trades', tradesRoutes);
app.use('/api/v1/messages', messagesRoutes);
app.use('/api/v1/reviews', reviewsRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/admin', adminRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({ error: 'Endpoint not found' });
});

// Error handling middleware
app.use(errorHandler);

// Initialize Socket.IO
const server = require('http').createServer(app);
const io = require('socket.io')(server, {
    cors: {
        origin: process.env.FRONTEND_URL || 'http://localhost:3000',
        methods: ['GET', 'POST']
    }
});

// Socket.IO connection handling
require('./socket/socketHandler')(io);

server.listen(PORT, () => {
    console.log(`🚀 SkillSwap API server running on port ${PORT}`);
    console.log(`📚 API Documentation available at http://localhost:${PORT}/api-docs`);
});

module.exports = app;
'''

with open('backend-app.js', 'w') as f:
    f.write(app_js)

print("✅ Created backend app.js")

# Create environment configuration file
env_example = '''# Environment Configuration
NODE_ENV=development
PORT=5000

# Frontend URL
FRONTEND_URL=http://localhost:3000

# Database Configuration
DB_HOST=localhost
DB_PORT=3306
DB_NAME=skillswap
DB_USER=skillswap_user
DB_PASSWORD=your_password

# Redis Configuration
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_here_change_in_production
JWT_EXPIRES_IN=7d

# File Upload Configuration
MAX_FILE_SIZE=10000000
UPLOAD_PATH=./uploads

# Email Configuration (for notifications)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password

# Admin Configuration
ADMIN_EMAIL=admin@skillswap.com
ADMIN_PASSWORD=admin123

# Rate Limiting
RATE_LIMIT_WINDOW=15
RATE_LIMIT_MAX_REQUESTS=100
'''

with open('backend-env-example', 'w') as f:
    f.write(env_example)

print("✅ Created .env.example file")