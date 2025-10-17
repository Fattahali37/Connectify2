# 🚀 System Status & Quick Start Guide

## Current Status

### ✅ Backend (Node.js/Express)
- **Status**: Running on port 8000
- **MongoDB**: Connected successfully
- **ML Integration Endpoint**: Available at `POST /api/admin/users/:userId/verify-profile`

### ✅ Flask API (Python ML Model)
- **Status**: Running on http://127.0.0.1:5000
- **Ngrok Tunnel**: https://exosmotic-israel-intercostally.ngrok-free.dev
- **Model**: Loaded successfully

### ⏳ Frontend
- **Status**: Not started yet
- **Action Needed**: Run `cd frontend && npm start`

---

## Quick Start Instructions

### 1. All Services Are Ready! ✅

Your system is set up with:
- ✅ Backend running on port 8000
- ✅ Flask ML API running on port 5000
- ✅ MongoDB connected
- ✅ ML model loaded

### 2. Start the Frontend

Open a new terminal and run:

```bash
cd "/home/fattahali37/Documents/Portfolio projects/Connectify2/frontend"
npm start
```

This will start the React app on http://localhost:3000

### 3. Access the Admin Dashboard

1. Open your browser to: **http://localhost:3000**
2. Navigate to the admin login page
3. Login with admin credentials:
   - **Username**: `admin`
   - **Password**: `admin123`

### 4. Test Profile Verification

Once in the admin dashboard:

1. Go to the **"All Users"** tab
2. Find any user in the table
3. Look for the **"Verification"** column
4. Click the **"Verify"** button next to a user
5. Watch the magic happen! 🎉

The system will:
- Extract 11 features from the user's profile
- Send them to your Flask ML API
- Get a prediction (real/fake)
- Display the result with a confidence score

---

## Flask API Connection Notes

### Local Connection vs Ngrok

Your Flask API is accessible via:

**Option 1: Local (Recommended for development)**
- URL: `http://127.0.0.1:5000`
- Already configured in backend `.env`
- Fastest response time

**Option 2: Ngrok Tunnel (For external access)**
- URL: `https://exosmotic-israel-intercostally.ngrok-free.dev`
- Use this if backend and Flask are on different machines

### Current Configuration

The backend is configured to use:
```
FLASK_API_URL=http://127.0.0.1:5000
```

This is correct since both services are running on your local machine.

---

## Testing the Complete Flow

### Test 1: Direct Flask API Test

Open Python terminal and test:

```python
import requests
import json

url = "http://127.0.0.1:5000/predict"
data = {
    "profile pic": 1,
    "nums/length username": 0.1,
    "fullname words": 2,
    "nums/length fullname": 0,
    "name==username": 0,
    "description length": 50,
    "external URL": 1,
    "private": 0,
    "#posts": 25,
    "#followers": 150,
    "#following": 100
}

response = requests.post(url, json=data)
print("Status:", response.status_code)
print("Response:", json.dumps(response.json(), indent=2))
```

Expected output:
```json
{
  "prediction": {
    "is_fake": 0,
    "status": "real"
  },
  "confidence": {
    "real_profile_prob": 0.8766,
    "fake_profile_prob": 0.1234
  }
}
```

### Test 2: Backend Integration Test

Once frontend is running, you can test via the UI or use:

```bash
# Replace USER_ID and ADMIN_TOKEN with actual values
curl -X POST http://localhost:8000/api/admin/users/USER_ID/verify-profile \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -H "Content-Type: application/json"
```

---

## Troubleshooting

### If Flask API connection fails from backend:

1. **Check Flask is running**:
   ```bash
   curl http://127.0.0.1:5000
   ```
   Should return a 404 (normal, means server is up)

2. **Check the /predict endpoint specifically**:
   Use Python script above or Postman to test

3. **Check firewall**:
   ```bash
   sudo ufw status
   ```
   Make sure port 5000 is not blocked

4. **Try using Ngrok URL instead**:
   Edit backend `.env`:
   ```
   FLASK_API_URL=https://exosmotic-israel-intercostally.ngrok-free.dev
   ```
   Then restart backend

### If you see "ECONNREFUSED" errors:

This usually means:
- Flask API is not running (but yours is ✅)
- Wrong port number
- Firewall blocking connection
- Flask bound to different interface

**Solution**: Your Flask logs show it's running on 127.0.0.1:5000, which is correct!

---

## System Architecture Summary

```
┌─────────────────┐
│  React Frontend │ :3000
│  Admin Dashboard│
└────────┬────────┘
         │ HTTP Requests
         ↓
┌─────────────────┐
│  Express Backend│ :8000
│  Node.js API    │
└────────┬────────┘
         │ ├─→ MongoDB (user data)
         │ └─→ POST /predict
         ↓
┌─────────────────┐
│  Flask ML API   │ :5000
│  Python Service │
└─────────────────┘
```

---

## What Happens When You Click "Verify"

1. **Frontend** sends request to backend
2. **Backend** fetches user from MongoDB
3. **Backend** calculates 11 ML features
4. **Backend** sends features to Flask API
5. **Flask API** runs ML model prediction
6. **Flask API** returns result to backend
7. **Backend** stores result in ProfileVerification collection
8. **Backend** sends result to frontend
9. **Frontend** updates UI with badge and confidence

---

## Next Steps

1. ✅ Backend is running
2. ✅ Flask API is running
3. ⏳ **Start the frontend**: `cd frontend && npm start`
4. 🎯 **Test the integration**: Click "Verify" in admin dashboard
5. 🎉 **Celebrate**: You have ML-powered fake profile detection!

---

## Quick Commands Reference

```bash
# Start Backend (already running ✅)
cd backend && npm run run-node

# Start Frontend (do this next)
cd frontend && npm start

# Test Flask API directly
python3 << EOF
import requests
r = requests.post("http://127.0.0.1:5000/predict", json={
    "profile pic": 1, "nums/length username": 0.1,
    "fullname words": 2, "nums/length fullname": 0,
    "name==username": 0, "description length": 50,
    "external URL": 1, "private": 0,
    "#posts": 25, "#followers": 150, "#following": 100
})
print(r.json())
EOF

# View verification data in MongoDB
mongosh
use your_database_name
db.profileverifications.find().pretty()
```

---

**Status**: Ready for Frontend Launch! 🚀

Everything is configured and running. Just start the frontend and you're good to go!
