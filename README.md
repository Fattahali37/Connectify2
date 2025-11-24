# 🌟 Connectify2 - Next-Gen Social Media Platform

> A full-stack MERN social media application with AI-powered fake profile detection, real-time chat, stories, and Instagram-like private profiles.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![React](https://img.shields.io/badge/React-18.0-blue.svg)](https://reactjs.org/)
[![Node](https://img.shields.io/badge/Node-16+-green.svg)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-5.0-brightgreen.svg)](https://www.mongodb.com/)

---

## 📋 Table of Contents

- [Features](#-features)
- [Tech Stack](#️-tech-stack)
- [Quick Start](#-quick-start)
- [Project Structure](#-project-structure)
- [Core Features](#-core-features)
- [Admin Dashboard](#-admin-dashboard)
- [Development](#-development)
- [Testing](#-testing)
- [Deployment](#-deployment)
- [Documentation](#-documentation)
- [Troubleshooting](#-troubleshooting)
- [Contributing](#-contributing)
- [License](#-license)

---

## ✨ Features

### 🔐 Authentication & Security
- JWT-based authentication with refresh tokens
- Secure password hashing (bcrypt)
- Email verification system
- Password reset functionality
- Admin authentication system

### 👥 Social Features
- **Private & Public Profiles** (Instagram-style)
- Follow/Unfollow system with requests
- Real-time notifications
- Like, comment, and share posts
- Image posts with multiple photos
- 24-hour Stories
- User search and discovery
- Explore page with trending content

### 💬 Real-time Communication
- Real-time chat with Socket.io
- One-on-one messaging
- Typing indicators
- Online/offline status
- Message notifications

### 🤖 AI-Powered Features
- **Machine Learning Fake Profile Detection** ⭐
- Automated profile verification
- Confidence scoring system
- Admin verification dashboard

### 🎨 Modern UI/UX
- Glass-morphism design
- Gradient themes
- Responsive layout (mobile, tablet, desktop)
- Dark theme optimized
- Smooth animations and transitions
- Tailwind CSS integration (in progress)

### 👑 Admin Panel
- Premium admin dashboard
- User management (suspend, delete, verify)
- Profile verification with ML
- Statistics and analytics
- User activity monitoring

---

## 🛠️ Tech Stack

### Frontend
- **Framework:** React 18
- **UI Library:** Material-UI (MUI)
- **Styling:** CSS Modules, Tailwind CSS (migrating)
- **State Management:** React Context API
- **HTTP Client:** Axios
- **Real-time:** Socket.io Client
- **Routing:** React Router v6
- **Icons:** Material Icons, SVG Icons

### Backend
- **Runtime:** Node.js 16+
- **Framework:** Express.js
- **Database:** MongoDB with Mongoose
- **Authentication:** JWT (jsonwebtoken)
- **Real-time:** Socket.io
- **Email:** Nodemailer
- **File Upload:** Multer
- **Security:** bcrypt, CORS

### Machine Learning
- **Framework:** Python Flask
- **ML Library:** scikit-learn
- **Model:** Trained classifier for fake profile detection
- **API:** REST API integration

### DevOps & Tools
- **Version Control:** Git
- **Package Manager:** npm
- **Testing:** Jest, React Testing Library
- **Code Quality:** ESLint
- **Deployment:** Vercel (frontend), Heroku/Railway (backend)

---

## 🚀 Quick Start

### Prerequisites
- Node.js 16+ and npm
- MongoDB (local or Atlas)
- Python 3.8+ (for ML features)
- Git

### 1️⃣ Clone Repository
```bash
git clone https://github.com/Fattahali37/Connectify2.git
cd Connectify2
```

### 2️⃣ Backend Setup
```bash
cd backend
npm install

# Create .env file
cp config/config.example .env

# Edit .env with your configuration:
# PORT=8000
# DataBaseURL=mongodb://localhost:27017/connectify2
# JWT_Secret=your_super_secret_jwt_key
# REFRESH_SECRET=your_refresh_token_secret
# FLASK_API_URL=http://127.0.0.1:5000
# ADMIN_USERNAME=admin
# ADMIN_PASSWORD=your_secure_admin_password
# EMAIL_USER=your_email@gmail.com
# EMAIL_PASS=your_app_password

# Start backend server
npm start
```

### 3️⃣ Frontend Setup
```bash
cd frontend
npm install

# Start React development server
npm start
```

### 4️⃣ ML API Setup (Optional)
```bash
cd ml-api
pip install -r requirements.txt

# Start Flask server
python app.py
```

### 5️⃣ Access Application
- **Frontend:** connectifydev.vercel.app
- **Backend API:** http://localhost:8000
- **ML API:** http://localhost:5000
- **Admin Dashboard:** connectifydev.vercel.app/admin

---

## 📁 Project Structure

```
Connectify2/
├── backend/
│   ├── config/          # Database & environment config
│   ├── controllers/     # Route controllers
│   ├── middlewares/     # Auth & validation middleware
│   ├── models/          # MongoDB models
│   ├── routes/          # API routes
│   ├── utils/           # Helper functions
│   ├── __tests__/       # Backend tests
│   └── server.js        # Entry point
│
├── frontend/
│   ├── public/          # Static assets
│   └── src/
│       ├── assets/      # Icons, images
│       ├── components/  # React components
│       │   ├── admin/   # Admin dashboard
│       │   ├── chat/    # Chat interface
│       │   ├── dialog/  # Modal dialogs
│       │   ├── home/    # Home feed
│       │   ├── navbar/  # Navigation
│       │   ├── post/    # Post components
│       │   ├── profile/ # Profile components
│       │   └── story/   # Story components
│       ├── context/     # React Context
│       ├── Interceptor/ # Axios interceptors
│       ├── pages/       # Page components
│       ├── routers/     # Route protection
│       ├── __tests__/   # Frontend tests
│       ├── App.js       # Root component
│       └── index.js     # Entry point
│
├── ml-api/              # Python Flask ML API
│   ├── models/          # Trained ML models
│   ├── app.py           # Flask server
│   └── requirements.txt
│
└── Documentation/       # Project documentation
    ├── ML_INTEGRATION_GUIDE.md
    ├── QUICK_START.md
    ├── STYLE_GUIDE.md
    ├── EMAIL_SETUP_GUIDE.md
    └── TAILWIND_MIGRATION.md
```

---

## 🎯 Core Features

### Private & Public Profiles
Users can toggle their profile privacy:
- **Public:** Anyone can see posts and profile
- **Private:** Only approved followers can view content
- Follow request system for private accounts
- Badge indicator for private profiles

### Real-time Chat
- Select user from chat list
- Real-time message delivery
- Typing indicators
- Message history
- Online status

### Stories
- Upload 24-hour temporary content
- View stories from followers
- Automatic deletion after 24 hours
- Story viewer with navigation

### Posts & Interactions
- Create posts with multiple images
- Like and unlike posts
- Comment on posts
- Share functionality
- Image slider for multi-photo posts

### Notifications
- Follow request notifications
- Like notifications
- Comment notifications
- Follow notifications
- Real-time notification updates

---

## 👑 Admin Dashboard

Access at `/admin` with admin credentials:

### Features
- **User Management:** View, suspend, delete users
- **Profile Verification:** AI-powered fake profile detection
- **Statistics:** User counts, post stats, engagement metrics
- **User Details:** View full user profiles and activity
- **Bulk Actions:** Manage multiple users

### ML Profile Verification
1. Navigate to Admin Dashboard
2. Click "Verify" on any user
3. Get instant AI prediction:
   - 🛡️ **Green Badge:** Verified Real Profile
   - ⚠️ **Red Badge:** Flagged as Fake Profile
   - Confidence score displayed

---

## 💻 Development

### Available Scripts

#### Backend
```bash
npm start          # Start server
npm test           # Run tests
npm run dev        # Start with nodemon
```

#### Frontend
```bash
npm start          # Start dev server (connectifydev.vercel.app)
npm test           # Run tests
npm run build      # Production build
npm run eject      # Eject from Create React App
```

### Environment Variables

#### Backend (.env)
```env
PORT=8000
DataBaseURL=mongodb://localhost:27017/connectify2
JWT_Secret=your_jwt_secret_key
REFRESH_SECRET=your_refresh_secret_key
FLASK_API_URL=http://127.0.0.1:5000
ADMIN_USERNAME=admin
ADMIN_PASSWORD=secure_password
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
```

#### Frontend
```env
REACT_APP_API_URL=http://localhost:8000
```

---

## 🧪 Testing

### Backend Tests
```bash
cd backend
npm test

# Run specific test
npm test -- auth.test.js

# Run with coverage
npm test -- --coverage
```

### Frontend Tests
```bash
cd frontend
npm test

# Run specific test
npm test -- Home.test.js

# Run with coverage
npm test -- --coverage
```

---

## 🚢 Deployment

### Frontend (Vercel)
```bash
cd frontend
npm run build
# Deploy build folder to Vercel
```

### Backend (Heroku/Railway)
```bash
cd backend
# Add Procfile: web: node server.js
# Deploy to platform
```

### Database (MongoDB Atlas)
1. Create cluster on MongoDB Atlas
2. Whitelist IP addresses
3. Update `DataBaseURL` in backend .env

---

## 📚 Documentation

Comprehensive guides available in the root directory:

### ⚡ Performance & Optimization (NEW)
- `PERFORMANCE_QUICK_START.md` - **Quick overview of optimizations**
- `PERFORMANCE_OPTIMIZATION.md` - Detailed performance guide
- `PERFORMANCE_SETUP.md` - Database indexing setup
- `PAGINATION_IMPLEMENTATION.md` - Frontend infinite scroll guide

### Setup & Configuration
- `QUICK_START.md` - Fast setup guide
- `EMAIL_SETUP_GUIDE.md` - Email configuration
- `ML_INTEGRATION_GUIDE.md` - ML API setup

### Features & Implementation
- `PRIVATE_PUBLIC_PROFILE_IMPLEMENTATION.md` - Privacy features
- `EMAIL_NOTIFICATIONS_IMPLEMENTATION.md` - Email system
- `PREMIUM_ADMIN_DASHBOARD.md` - Admin panel
- `COMPLETE_SUMMARY.md` - Full feature summary

### Design & Styling
- `STYLE_GUIDE.md` - UI/UX guidelines
- `GRADIENT_THEME_APPLIED.md` - Theme documentation
- `TAILWIND_MIGRATION.md` - Tailwind conversion plan
- `TAILWIND_PROGRESS.md` - Migration progress

### Development
- `IMPLEMENTATION_SUMMARY.md` - Technical overview
- `SYSTEM_FLOW_DIAGRAM.md` - Architecture diagrams
- `CODE_REVIEW_PRIVATE_PUBLIC.md` - Code reviews

### Troubleshooting
- `DEBUG_FOLLOW_REQUESTS.md` - Follow system debugging
- `AUTO_VERIFICATION_GUIDE.md` - Verification setup

---

## 🔧 Troubleshooting

### Common Issues

#### Backend won't start
```bash
# Check MongoDB connection
# Verify .env file exists and is configured
# Check port 8000 is not in use
```

#### Frontend build fails
```bash
# Clear cache
rm -rf node_modules package-lock.json
npm install
npm run build
```

#### ML API not responding
```bash
# Verify Python dependencies
pip install -r requirements.txt

# Check Flask is running on port 5000
# Verify FLASK_API_URL in backend .env
```

#### Socket.io connection issues
```bash
# Check CORS configuration in backend
# Verify Socket.io client version matches server
# Check firewall settings
```

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Code Style
- Follow ESLint configuration
- Use meaningful variable names
- Comment complex logic
- Write tests for new features

---

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 👨‍💻 Author

**Fattahali37**
- GitHub: [@Fattahali37](https://github.com/Fattahali37)
- Project: [Connectify2](https://github.com/Fattahali37/Connectify2)

---

## 🙏 Acknowledgments

- Material-UI for beautiful components
- Socket.io for real-time features
- MongoDB for flexible database
- Create React App for quick setup
- Flask for ML API integration

---

## 📞 Support

If you encounter any issues or have questions:
1. Check the [Documentation](#-documentation) section
2. Review [Troubleshooting](#-troubleshooting) guide
3. Open an issue on GitHub
4. Contact the maintainer

---

**⭐ Star this repository if you find it helpful!**
