# Connectify2 - Social Media Application with ML-Powered Fake Profile Detection

A full-stack MERN (MongoDB, Express, React, Node.js) social media application with integrated machine learning for fake profile detection.

## 🚀 Features

- User Authentication & Authorization
- Post Creation & Interactions (Like, Comment, Share)
- Real-time Chat (Socket.io)
- Stories (24-hour temporary posts)
- Admin Dashboard with user management
- **ML-Powered Fake Profile Detection** ⭐

## 🏗️ Tech Stack

**Frontend:** React 18, Material-UI, Axios, Socket.io  
**Backend:** Node.js, Express, MongoDB, JWT, Socket.io  
**ML Integration:** Python Flask API, scikit-learn

## 🛠️ Quick Start

### 1. Install Dependencies
```bash
# Backend
cd backend && npm install

# Frontend
cd frontend && npm install
```

### 2. Configure Environment
Create `backend/.env`:
```env
PORT=8000
DataBaseURL=your_mongodb_connection_string
JWT_Secret=your_jwt_secret
FLASK_API_URL=http://127.0.0.1:5000
ADMIN_USERNAME=admin
ADMIN_PASSWORD=admin123
```

### 3. Run Application
```bash
# Backend (terminal 1)
cd backend && npm start

# Frontend (terminal 2)
cd frontend && npm start

# Flask ML API (terminal 3)
python app.py
```

## 🤖 ML Profile Verification

Access Admin Dashboard → Click "Verify" on any user → Get instant AI prediction!

- 🛡️ **Green**: Verified Real Profile
- ⚠️ **Red**: Flagged as Fake Profile
- Confidence scores displayed

## 📚 Documentation

- `ML_INTEGRATION_GUIDE.md` - ML integration details
- `ARCHITECTURE.md` - System architecture
- `FLASK_TROUBLESHOOTING.md` - API troubleshooting

## 📝 License

MIT License - See [LICENSE](LICENSE)

## 👨‍💻 Author

**Fattahali37** - [@Fattahali37](https://github.com/Fattahali37)
