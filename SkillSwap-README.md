# SkillSwap - Premium Skill Exchange Platform

A modern, full-stack skill exchange platform where users trade skills instead of money. Built with React, Node.js, MySQL, Redis, and Socket.IO.

## 🚀 Live Demo

[**Try SkillSwap Platform →**](https://ppl-ai-code-interpreter-files.s3.amazonaws.com/web/direct-files/597484f38252658f10f02c67e644ab27/5fccc35b-e85f-40ab-9a3f-81ab0ff387cf/index.html)

## 🎯 Project Overview

SkillSwap is a revolutionary platform that enables users to exchange skills without money. Whether you're a designer wanting to learn coding, or a developer interested in learning photography, SkillSwap connects you with the right people for mutually beneficial skill exchanges.

### Key Features

- **👥 Skill Trading**: Users can offer their skills and request others' skills for mutual exchange
- **🎨 Premium Matte UI**: Modern interface with Deep Navy, Teal, and Coral color scheme
- **💬 Real-time Chat**: Socket.IO-powered messaging between trade partners
- **🏆 Gamification**: Badge system with achievements like "Top Teacher" and "5-Star Mentor"
- **⭐ Reviews & Ratings**: Comprehensive review system to build trust in the community
- **🤖 AI Recommendations**: Content-based filtering to suggest relevant skills and partners
- **📱 Responsive Design**: Mobile-first approach with TailwindCSS
- **🔐 Secure Authentication**: JWT-based auth with bcrypt password hashing
- **👨‍💼 Admin Dashboard**: Complete admin panel for platform management

## 🛠 Tech Stack

### Frontend
- **React** - Component-based UI framework
- **TailwindCSS** - Utility-first CSS framework
- **Framer Motion** - Advanced animations and interactions
- **Socket.IO Client** - Real-time communication

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web application framework
- **MySQL** - Relational database
- **Redis** - Caching and session storage
- **Socket.IO** - Real-time bidirectional communication
- **JWT** - JSON Web Tokens for authentication
- **bcryptjs** - Password hashing
- **Swagger/OpenAPI** - API documentation

### DevOps & Tools
- **Docker** - Containerization
- **Docker Compose** - Multi-container orchestration
- **Nginx** - Reverse proxy (production)
- **ESLint/Prettier** - Code linting and formatting

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or higher)
- **Docker** and **Docker Compose**
- **MySQL** (v8.0 or higher)
- **Redis** (v7 or higher)
- **Git**

## 🏗 Project Structure

```
SkillSwap/
├── frontend/                   # React application
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── hooks/
│   │   ├── context/
│   │   └── utils/
│   ├── package.json
│   └── Dockerfile
├── backend/                    # Node.js API server
│   ├── src/
│   │   ├── config/
│   │   │   └── database.js
│   │   ├── controllers/
│   │   ├── middleware/
│   │   │   └── auth.js
│   │   ├── routes/
│   │   │   ├── auth.js
│   │   │   ├── skills.js
│   │   │   ├── trades.js
│   │   │   ├── messages.js
│   │   │   ├── reviews.js
│   │   │   └── admin.js
│   │   ├── socket/
│   │   │   └── socketHandler.js
│   │   └── app.js
│   ├── package.json
│   └── Dockerfile
├── database/
│   └── init/
│       └── schema.sql
├── nginx/
│   └── nginx.conf
├── docker-compose.yml
├── .env.example
└── README.md
```

## 🚀 Quick Start

### Option 1: Docker Compose (Recommended)

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/skillswap.git
   cd skillswap
   ```

2. **Create environment file**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

3. **Start all services**
   ```bash
   docker-compose up --build
   ```

4. **Access the application**
   - Frontend: http://localhost:3000
   - API Documentation: http://localhost:5000/api-docs
   - Admin Panel: http://localhost:3000/admin

### Option 2: Manual Setup

1. **Set up MySQL Database**
   ```bash
   mysql -u root -p
   CREATE DATABASE skillswap;
   CREATE USER 'skillswap_user'@'localhost' IDENTIFIED BY 'your_password';
   GRANT ALL PRIVILEGES ON skillswap.* TO 'skillswap_user'@'localhost';
   EXIT;
   ```

2. **Initialize Database Schema**
   ```bash
   mysql -u skillswap_user -p skillswap < database/init/schema.sql
   ```

3. **Start Redis**
   ```bash
   redis-server
   ```

4. **Set up Backend**
   ```bash
   cd backend
   npm install
   cp .env.example .env
   # Configure your .env file
   npm run dev
   ```

5. **Set up Frontend**
   ```bash
   cd frontend
   npm install
   npm start
   ```

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the root directory:

```env
# Database Configuration
DB_HOST=localhost
DB_PORT=3306
DB_NAME=skillswap
DB_USER=skillswap_user
DB_PASSWORD=your_password

# Redis Configuration
REDIS_HOST=localhost
REDIS_PORT=6379

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRES_IN=7d

# Application Configuration
NODE_ENV=development
PORT=5000
FRONTEND_URL=http://localhost:3000

# Admin Configuration
ADMIN_EMAIL=admin@skillswap.com
ADMIN_PASSWORD=admin123
```

### Database Configuration

The application uses MySQL with the following key tables:
- `users` - User accounts and profiles
- `skills` - Available skills in the platform
- `user_skills` - User's offered/sought skills
- `trades` - Skill exchange requests and transactions
- `messages` - Real-time chat messages
- `reviews` - User ratings and feedback
- `badges` - Gamification achievements
- `notifications` - System notifications

## 📚 API Documentation

Once the backend is running, visit http://localhost:5000/api-docs for comprehensive API documentation powered by Swagger/OpenAPI.

### Key API Endpoints

#### Authentication
- `POST /api/v1/auth/register` - Register new user
- `POST /api/v1/auth/login` - User login
- `GET /api/v1/auth/profile` - Get user profile

#### Skills
- `GET /api/v1/skills/search` - Search skills with filters
- `GET /api/v1/skills/categories` - Get skill categories
- `POST /api/v1/skills` - Add skill to profile
- `GET /api/v1/skills/:id` - Get skill details

#### Trades
- `POST /api/v1/trades` - Create trade request
- `GET /api/v1/trades/my` - Get user's trades
- `PUT /api/v1/trades/:id/accept` - Accept trade
- `PUT /api/v1/trades/:id/complete` - Mark trade as completed

#### Real-time Features
- WebSocket endpoint at `/socket.io/`
- Real-time messaging
- Live trade status updates
- Typing indicators

## 🎮 Demo Features

### Sample User Accounts
```javascript
// Available demo accounts
{
  email: 'sarah@example.com',
  password: 'password123',
  skills: ['UI/UX Design', 'Figma', 'User Research']
}

{
  email: 'alex@example.com', 
  password: 'password123',
  skills: ['React Development', 'Node.js', 'Database Design']
}

{
  email: 'admin@skillswap.com',
  password: 'admin123',
  role: 'admin'
}
```

### Demo Flow
1. **Registration**: Create account with profile setup wizard
2. **Profile Setup**: Add skills you offer and skills you want to learn
3. **Discovery**: Browse available skills with search and filters
4. **Trading**: Request skill exchanges with other users
5. **Messaging**: Chat in real-time with trade partners
6. **Completion**: Complete trades and leave reviews
7. **Achievements**: Unlock badges as you participate more

## 🏆 Gamification System

### Available Badges
- **🎯 First Trade** - Complete your first skill exchange
- **⭐ Top Teacher** - Maintain 4.5+ star rating with 5+ reviews
- **🔄 Frequent Swapper** - Complete 10+ trades
- **🌟 5-Star Mentor** - Receive 5 five-star reviews
- **🗺️ Skill Explorer** - Learn skills from 5+ categories
- **🏗️ Community Builder** - Help 20+ people learn skills
- **🚀 Early Adopter** - Register in first 100 users
- **👑 Master Trader** - Complete 50+ trades

### Achievement Animations
- Confetti effects for badge unlocks
- Progress bars for milestone tracking
- Toast notifications for achievements
- Badge showcase on profiles

## 🛡 Security Features

### Authentication & Authorization
- JWT-based stateless authentication
- bcrypt password hashing with salt rounds
- Role-based access control (User/Admin)
- Protected API routes with middleware
- Rate limiting to prevent abuse

### Data Protection
- Input validation and sanitization
- SQL injection prevention
- XSS protection with helmet.js
- CORS configuration
- Environment variable management

### Security Best Practices
- Secure session management with Redis
- HTTPS configuration (production)
- Database connection pooling
- Error handling without information leakage

## 🚀 Deployment

### Production Deployment with Docker

1. **Build production images**
   ```bash
   docker-compose -f docker-compose.prod.yml build
   ```

2. **Deploy with environment variables**
   ```bash
   docker-compose -f docker-compose.prod.yml up -d
   ```

### Cloud Deployment Options

#### AWS Deployment
- **ECS/Fargate** for container orchestration
- **RDS MySQL** for database
- **ElastiCache Redis** for caching
- **ALB** for load balancing
- **Route 53** for DNS
- **CloudFront** for CDN

#### GCP Deployment  
- **Cloud Run** for containers
- **Cloud SQL** for MySQL
- **Memorystore** for Redis
- **Load Balancer** for traffic distribution

#### Kubernetes Deployment
- Use provided Kubernetes manifests
- Configure ingress controllers
- Set up persistent volumes for data
- Implement horizontal pod autoscaling

## 🔧 Development

### Running in Development Mode

1. **Backend (with hot reload)**
   ```bash
   cd backend
   npm run dev
   ```

2. **Frontend (with hot reload)**
   ```bash
   cd frontend
   npm start
   ```

3. **Database migrations**
   ```bash
   npm run migrate
   ```

### Code Quality
- ESLint configuration for consistent code style
- Prettier for code formatting
- Husky pre-commit hooks
- Jest for testing
- Code coverage reports

### Testing
```bash
# Run backend tests
cd backend && npm test

# Run frontend tests  
cd frontend && npm test

# Run integration tests
npm run test:integration
```

## 📊 Monitoring & Analytics

### Application Monitoring
- Health check endpoints
- Error logging with Winston
- Performance metrics
- Database query monitoring

### User Analytics
- User engagement tracking
- Skill popularity metrics
- Trade completion rates
- Badge achievement statistics

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines
- Follow the established code style
- Write comprehensive tests
- Update documentation
- Ensure backward compatibility
- Follow semantic versioning

## 📝 License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details.

## 🙏 Acknowledgments

- **React Team** for the amazing framework
- **TailwindCSS** for utility-first styling
- **Framer Motion** for beautiful animations
- **Socket.IO** for real-time communication
- **Express.js** for the robust backend framework
- **MySQL** for reliable data storage
- **Docker** for containerization
- **OpenAPI/Swagger** for API documentation

## 📞 Support

- **Documentation**: Check the `/docs` folder for detailed guides
- **Issues**: Report bugs and feature requests on GitHub
- **Community**: Join our Discord server for discussions
- **Email**: Contact support@skillswap.com for critical issues

## 🔮 Future Roadmap

### Upcoming Features
- **Video Calling**: Integrate Zoom/Meet for skill sessions
- **Payment System**: Optional premium features
- **Mobile Apps**: Native iOS and Android applications
- **Advanced AI**: Machine learning for better recommendations
- **Skill Certifications**: Blockchain-based skill verification
- **Community Features**: Groups and forums
- **Internationalization**: Multi-language support
- **Advanced Analytics**: Detailed platform insights

### Scaling Plans
- Microservices architecture
- GraphQL API implementation  
- Event-driven architecture with message queues
- Multi-region deployment
- Advanced caching strategies
- CDN integration for global performance

---

**Ready to revolutionize skill learning? Start trading skills instead of money with SkillSwap!** 🚀