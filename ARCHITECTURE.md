# ML Profile Verification System Architecture

## System Overview

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        CONNECTIFY2 SOCIAL MEDIA APP                      │
│                      with ML-Based Fake Profile Detection                │
└─────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────┐
│                              FRONTEND LAYER                              │
├─────────────────────────────────────────────────────────────────────────┤
│  React Admin Dashboard (AdminDashboard.jsx)                             │
│  ┌──────────────────────────────────────────────────────────┐           │
│  │  User Table with Verification Column                     │           │
│  │  ┌─────────┬────────┬──────────────┬──────────┐          │           │
│  │  │ User    │ Email  │ Status       │ Actions  │          │           │
│  │  ├─────────┼────────┼──────────────┼──────────┤          │           │
│  │  │ @john   │ j@...  │ 🛡️ Verified │ [Verify] │          │           │
│  │  │         │        │   Real       │ [Block]  │          │           │
│  │  │         │        │ Conf: 87.7%  │ [Delete] │          │           │
│  │  └─────────┴────────┴──────────────┴──────────┘          │           │
│  └──────────────────────────────────────────────────────────┘           │
│                              ↕️ API Calls (axios)                        │
└─────────────────────────────────────────────────────────────────────────┘
                                      ↓
┌─────────────────────────────────────────────────────────────────────────┐
│                             BACKEND LAYER                                │
├─────────────────────────────────────────────────────────────────────────┤
│  Express.js Server (Node.js)                                            │
│  ┌─────────────────────────────────────────────────────────┐            │
│  │  Routes: /api/admin/users/:userId/verify-profile       │            │
│  │          (POST) - Admin Protected                       │            │
│  └─────────────────────────────────────────────────────────┘            │
│                            ↓                                             │
│  ┌─────────────────────────────────────────────────────────┐            │
│  │  Controller: admin.js                                   │            │
│  │  Function: verifyProfile()                              │            │
│  │                                                          │            │
│  │  1. Fetch user data from MongoDB                        │            │
│  │  2. Calculate 11 ML features:                           │            │
│  │     • profile pic (1/0)                                 │            │
│  │     • nums/length username                              │            │
│  │     • fullname words                                    │            │
│  │     • nums/length fullname                              │            │
│  │     • name==username (1/0)                              │            │
│  │     • description length                                │            │
│  │     • external URL (1/0)                                │            │
│  │     • private (1/0)                                     │            │
│  │     • #posts                                            │            │
│  │     • #followers                                        │            │
│  │     • #following                                        │            │
│  │  3. Send features to Python Flask API →                │            │
│  │  4. ← Receive prediction & confidence                   │            │
│  │  5. Store in ProfileVerification collection             │            │
│  │  6. Return result to frontend                           │            │
│  └─────────────────────────────────────────────────────────┘            │
│                     ↕️ HTTP POST (axios)                                 │
└─────────────────────────────────────────────────────────────────────────┘
                                      ↓
┌─────────────────────────────────────────────────────────────────────────┐
│                        MACHINE LEARNING LAYER                            │
├─────────────────────────────────────────────────────────────────────────┤
│  Python Flask API (http://127.0.0.1:5000)                               │
│  ┌─────────────────────────────────────────────────────────┐            │
│  │  Endpoint: POST /predict                                │            │
│  │  Input: JSON with 11 features                           │            │
│  │  Output: Prediction + Confidence                        │            │
│  │  ┌───────────────────────────────────────┐              │            │
│  │  │  ML Model (Pre-trained)               │              │            │
│  │  │  • Random Forest / Neural Network     │              │            │
│  │  │  • Trained on fake profile dataset    │              │            │
│  │  │  • Returns classification + probs     │              │            │
│  │  └───────────────────────────────────────┘              │            │
│  │                                                          │            │
│  │  Response:                                               │            │
│  │  {                                                       │            │
│  │    "prediction": {                                       │            │
│  │      "is_fake": 0,                                       │            │
│  │      "status": "real"                                    │            │
│  │    },                                                    │            │
│  │    "confidence": {                                       │            │
│  │      "real_profile_prob": 0.8766,                        │            │
│  │      "fake_profile_prob": 0.1234                         │            │
│  │    }                                                     │            │
│  │  }                                                       │            │
│  └─────────────────────────────────────────────────────────┘            │
└─────────────────────────────────────────────────────────────────────────┘
                                      ↓
┌─────────────────────────────────────────────────────────────────────────┐
│                           DATABASE LAYER                                 │
├─────────────────────────────────────────────────────────────────────────┤
│  MongoDB                                                                 │
│  ┌─────────────────────────────────────────────────────────┐            │
│  │  Collection: users                                      │            │
│  │  • username, name, email, avatar                        │            │
│  │  • posts[], followers[], followings[]                   │            │
│  │  • bio, website, private                                │            │
│  └─────────────────────────────────────────────────────────┘            │
│  ┌─────────────────────────────────────────────────────────┐            │
│  │  Collection: profileverifications (NEW)                 │            │
│  │  • userId (ref to users)                                │            │
│  │  • features (11 ML features)                            │            │
│  │  • verificationStatus (real/fake/pending/error)         │            │
│  │  • isFake (0/1)                                         │            │
│  │  • confidence { realProfileProb, fakeProfileProb }      │            │
│  │  • lastVerified (timestamp)                             │            │
│  │  • verificationHistory []                               │            │
│  └─────────────────────────────────────────────────────────┘            │
└─────────────────────────────────────────────────────────────────────────┘
```

## Data Flow Diagram

```
Admin clicks "Verify" button
           ↓
┌──────────────────────────┐
│  Frontend (React)        │
│  handleVerifyProfile()   │
└──────────────────────────┘
           ↓ POST /api/admin/users/:userId/verify-profile
┌──────────────────────────┐
│  Backend (Express)       │
│  verifyProfile()         │
└──────────────────────────┘
           ↓ 1. Fetch user
┌──────────────────────────┐
│  MongoDB - users         │
└──────────────────────────┘
           ↓ 2. User data
┌──────────────────────────┐
│  Feature Extraction      │
│  Calculate 11 features   │
└──────────────────────────┘
           ↓ 3. POST /predict with features
┌──────────────────────────┐
│  Flask API (Python)      │
│  ML Model Prediction     │
└──────────────────────────┘
           ↓ 4. Prediction + confidence
┌──────────────────────────┐
│  Backend stores result   │
└──────────────────────────┘
           ↓ 5. Save to DB
┌──────────────────────────┐
│  MongoDB                 │
│  profileverifications    │
└──────────────────────────┘
           ↓ 6. Return response
┌──────────────────────────┐
│  Frontend updates UI     │
│  • Badge color           │
│  • Confidence %          │
│  • Success notification  │
└──────────────────────────┘
```

## Feature Extraction Details

```
User Profile Data                    ML Features
─────────────────                    ───────────
avatar: "https://..."        →       profile pic: 1
username: "user123"          →       nums/length username: 0.43
name: "John Doe"             →       fullname words: 2
                             →       nums/length fullname: 0
                             →       name==username: 0
bio: "Hello world!"          →       description length: 12
website: "example.com"       →       external URL: 1
private: false               →       private: 0
posts: [25 items]            →       #posts: 25
followers: [150 items]       →       #followers: 150
followings: [100 items]      →       #following: 100
```

## Technology Stack

```
┌──────────────────────────────────────────────────────────┐
│  Frontend                                                 │
│  • React 18                                               │
│  • Material-UI (MUI)                                      │
│  • Axios for HTTP requests                                │
│  • Context API for state management                       │
└──────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────┐
│  Backend                                                  │
│  • Node.js                                                │
│  • Express.js                                             │
│  • Mongoose ODM                                           │
│  • JWT for authentication                                 │
│  • Axios for HTTP requests to Flask API                   │
└──────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────┐
│  Machine Learning                                         │
│  • Python 3.x                                             │
│  • Flask web framework                                    │
│  • scikit-learn / TensorFlow / PyTorch (model-dependent)  │
│  • NumPy, Pandas                                          │
└──────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────┐
│  Database                                                 │
│  • MongoDB                                                │
│  • Mongoose schemas                                       │
└──────────────────────────────────────────────────────────┘
```

## Security Flow

```
Admin User Login
       ↓
JWT Token Issued
       ↓
Token stored in localStorage/cookies
       ↓
API Request with Authorization header
       ↓
adminAuth middleware validates token
       ↓
If valid → proceed to verifyProfile()
If invalid → 401 Unauthorized
```

## Error Handling

```
Try to verify profile
       ↓
┌──────────────────────┐
│  User exists?        │
│  No → 404 Error      │
└──────────────────────┘
       ↓ Yes
┌──────────────────────┐
│  Extract features    │
└──────────────────────┘
       ↓
┌──────────────────────┐
│  Call Flask API      │
│  • Timeout?          │
│  • Connection fail?  │
│  Yes → 503 Error     │
└──────────────────────┘
       ↓ No error
┌──────────────────────┐
│  Store in MongoDB    │
│  DB error?           │
│  Yes → 500 Error     │
└──────────────────────┘
       ↓ No error
┌──────────────────────┐
│  Return success ✅   │
└──────────────────────┘
```

## Deployment Considerations

```
Production Setup:
─────────────────

1. Flask API
   • Deploy on separate server/container
   • Use WSGI server (Gunicorn)
   • Enable HTTPS
   • Set up monitoring

2. Backend
   • Environment variable for FLASK_API_URL
   • Enable CORS properly
   • Rate limiting for API endpoint
   • Request validation

3. Frontend
   • Build optimized production bundle
   • Environment-based API URLs
   • Error boundary components

4. Database
   • Index on userId in profileverifications
   • Regular backups
   • Monitoring for verification collection growth
```

## File Structure

```
Connectify2/
├── backend/
│   ├── models/
│   │   ├── User.js
│   │   └── ProfileVerification.js ✨ NEW
│   ├── controllers/
│   │   └── admin.js ✏️ MODIFIED
│   ├── routes/
│   │   └── admin.js ✏️ MODIFIED
│   └── middlewares/
│       └── adminAuth.js
├── frontend/
│   └── src/
│       └── pages/
│           └── AdminDashboard.jsx ✏️ MODIFIED
├── ML_INTEGRATION_GUIDE.md ✨ NEW
├── IMPLEMENTATION_SUMMARY.md ✨ NEW
├── QUICK_REFERENCE.md ✨ NEW
├── ARCHITECTURE.md ✨ NEW (this file)
└── test-ml-integration.sh ✨ NEW
```

---

**Created:** October 17, 2025  
**Purpose:** ML-based fake profile detection system architecture documentation
