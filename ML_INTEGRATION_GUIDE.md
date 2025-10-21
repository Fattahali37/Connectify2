# ML-Based Fake Profile Detection Integration Guide

## Overview

This guide explains how to use the integrated Machine Learning-based fake profile detection feature in your Connectify2 social media application. The system uses a Python Flask API to analyze user profiles and determine if they are real or fake.

---

## Architecture

```
┌─────────────────┐      ┌──────────────────┐      ┌─────────────────┐
│  React Admin    │─────▶│  Express Backend │─────▶│  Python Flask   │
│  Dashboard      │      │  (Node.js)       │      │  ML API         │
└─────────────────┘      └──────────────────┘      └─────────────────┘
         │                        │                          │
         │                        ▼                          │
         │               ┌──────────────────┐              │
         └──────────────▶│    MongoDB       │◀─────────────┘
                         │  (User Data &    │
                         │  Verification)   │
                         └──────────────────┘
```

---

## Prerequisites

Before using this feature, ensure:

1. **Python Flask API is running** at `http://127.0.0.1:5000`
2. **MongoDB is connected** and running
3. **Backend server** is running on port 8000
4. **Frontend server** is running on port 3000
5. **Admin authentication** is set up and working

---

## Backend Implementation

### 1. Database Model: ProfileVerification

Location: `/backend/models/ProfileVerification.js`

This model stores:
- **11 ML features** extracted from user profiles
- **Verification status** (real/fake/pending/error)
- **Confidence scores** from the ML model
- **Verification history** for audit trails

**Features Stored:**
```javascript
{
  "profile pic": Number,          // 1 if has avatar, 0 if not
  "nums/length username": Number, // Ratio of digits in username
  "fullname words": Number,       // Word count in full name
  "nums/length fullname": Number, // Ratio of digits in full name
  "name==username": Number,       // 1 if name equals username
  "description length": Number,   // Length of bio
  "external URL": Number,         // 1 if has website, 0 if not
  "private": Number,              // 1 if private account
  "#posts": Number,               // Number of posts
  "#followers": Number,           // Number of followers
  "#following": Number            // Number of following
}
```

### 2. API Endpoint

**Route:** `POST /api/admin/users/:userId/verify-profile`

**Authentication:** Requires admin authentication (adminAuth middleware)

**Process Flow:**
1. Fetch user data from MongoDB
2. Calculate 11 ML features from user profile
3. Send features to Python Flask API
4. Receive prediction (real/fake) with confidence scores
5. Store results in ProfileVerification collection
6. Update verification history
7. Return results to frontend

**Success Response:**
```json
{
  "success": true,
  "message": "Profile verified as real",
  "verification": {
    "status": "real",
    "isFake": 0,
    "confidence": {
      "realProfileProb": 0.8766,
      "fakeProfileProb": 0.1234
    },
    "features": { /* 11 features */ },
    "lastVerified": "2025-10-17T..."
  },
  "user": {
    "_id": "...",
    "username": "john_doe",
    "name": "John Doe",
    "verificationStatus": "real"
  }
}
```

**Error Responses:**
- `404`: User not found
- `503`: Flask API not reachable
- `500`: Server error

### 3. Helper Functions

**calculateNumberRatio(str)**: Calculates the ratio of numeric characters to total length
**countWords(str)**: Counts words in a string (splits by whitespace)

---

## Frontend Implementation

### Admin Dashboard Updates

Location: `/frontend/src/pages/AdminDashboard.jsx`

**New Features Added:**

1. **Verification Status Badge** - Shows current verification status:
   - 🛡️ Green: "Verified Real"
   - ⚠️ Red: "Flagged Fake"
   - ❓ Gray: "Unverified"

2. **Verify Button** - Triggers ML verification:
   - Shows loading spinner during verification
   - Disabled while processing
   - Updates UI immediately after completion

3. **Confidence Score Display** - Shows ML model confidence percentage

**New State:**
```javascript
const [verifyingUsers, setVerifyingUsers] = useState({}); // Track loading per user
```

**Key Functions:**

#### handleVerifyProfile(userId)
Calls the backend API to verify a user's profile.

```javascript
const handleVerifyProfile = async (userId) => {
  // Set loading state
  setVerifyingUsers((prev) => ({ ...prev, [userId]: true }));
  
  // Call API
  const response = await api.post(`${url}/api/admin/users/${userId}/verify-profile`);
  
  // Update user state with verification results
  setUsers((prevUsers) =>
    prevUsers.map((user) =>
      user._id === userId
        ? { ...user, verificationStatus, verificationConfidence }
        : user
    )
  );
  
  // Clear loading state
  setVerifyingUsers((prev) => ({ ...prev, [userId]: false }));
};
```

#### getVerificationBadge(user)
Returns a Material-UI Chip component displaying the verification status.

---

## User Interface

### Admin Dashboard Table

The user table now includes a new **"Verification"** column between "Status" and "Actions":

```
┌──────────┬───────┬───────────┬─────────┬──────────────┬─────────┐
│   User   │ Email │   Date    │  Stats  │ Verification │ Actions │
├──────────┼───────┼───────────┼─────────┼──────────────┼─────────┤
│ @johndoe │ ...   │ 2025-...  │ 10/50/5 │ ✓ Verified   │ [Btns]  │
│          │       │           │         │ [Verify Btn] │         │
│          │       │           │         │ Conf: 87.7%  │         │
└──────────┴───────┴───────────┴─────────┴──────────────┴─────────┘
```

---

## How to Use

### Step 1: Start the Python Flask API

Ensure your Python ML API is running:
```bash
cd /path/to/your/flask/api
python app.py
```

The API should be accessible at `http://127.0.0.1:5000/predict`

### Step 2: Start Backend & Frontend

```bash
# Terminal 1 - Backend
cd backend
npm start

# Terminal 2 - Frontend
cd frontend
npm start
```

### Step 3: Access Admin Dashboard

1. Navigate to admin dashboard (usually `/admin/dashboard`)
2. Log in with admin credentials
3. View the user list in the "All Users" or "Blocked Users" tab

### Step 4: Verify a Profile

1. Locate the user you want to verify
2. Click the **"Verify"** button in the Verification column
3. Wait for the verification to complete (button shows "Verifying...")
4. View the results:
   - Status badge updates to "Verified Real" or "Flagged Fake"
   - Confidence percentage is displayed below the button
   - Success notification appears with confidence score

### Step 5: Review Results

The verification status is:
- **Stored in MongoDB** (ProfileVerification collection)
- **Persisted across sessions**
- **Includes verification history** for audit trails
- **Can be re-verified** at any time to update the status

---

## Configuration

### Environment Variables

Add to your backend `.env` file:

```env
FLASK_API_URL=http://127.0.0.1:5000
```

If not set, it defaults to `http://127.0.0.1:5000`

---

## Testing

### Manual Testing

1. **Test with an unverified user:**
   - Click "Verify" button
   - Should show loading state
   - Should update with status and confidence

2. **Test with Python API offline:**
   - Stop Flask API
   - Click "Verify" button
   - Should show error message about API not reachable

3. **Test re-verification:**
   - Verify a user
   - Click "Verify" again
   - Should update with new results
   - Check MongoDB for verification history

### Test the Flask API Directly

```bash
curl -X POST http://127.0.0.1:5000/predict \
  -H "Content-Type: application/json" \
  -d '{
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
  }'
```

Expected response:
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

---

## Troubleshooting

### Issue: "Failed to connect to ML verification service"

**Cause:** Python Flask API is not running or not accessible

**Solutions:**
1. Check if Flask API is running: `curl -I http://127.0.0.1:5000`
2. Check Flask logs for errors
3. Verify port 5000 is not blocked by firewall
4. Ensure Flask API is running on correct host/port

### Issue: "User not found"

**Cause:** Invalid userId or user was deleted

**Solutions:**
1. Refresh the user list
2. Check MongoDB for user existence
3. Verify the userId in the API request

### Issue: Button stays in "Verifying..." state

**Cause:** API request failed or timed out

**Solutions:**
1. Check browser console for errors
2. Check backend logs
3. Verify network connectivity
4. Increase timeout in axios config (currently 10 seconds)

### Issue: Verification status not persisting

**Cause:** MongoDB write failure

**Solutions:**
1. Check MongoDB connection
2. Verify ProfileVerification model is registered
3. Check backend logs for database errors

---

## Database Queries

### View all verifications:
```javascript
db.profileverifications.find().pretty()
```

### View specific user's verification:
```javascript
db.profileverifications.findOne({ userId: ObjectId("user_id_here") })
```

### View verification history:
```javascript
db.profileverifications.findOne(
  { userId: ObjectId("user_id_here") },
  { verificationHistory: 1 }
)
```

### Count verified profiles by status:
```javascript
db.profileverifications.aggregate([
  { $group: { _id: "$verificationStatus", count: { $sum: 1 } } }
])
```

---

## Feature Calculation Details

| Feature | Calculation Method | Example |
|---------|-------------------|---------|
| `profile pic` | Check if `user.avatar` exists | avatar ? 1 : 0 |
| `nums/length username` | Count digits / total length | "user123" → 3/7 = 0.43 |
| `fullname words` | Split by whitespace and count | "John Doe" → 2 |
| `nums/length fullname` | Count digits / total length | "John2" → 1/5 = 0.2 |
| `name==username` | Compare lowercase strings | "johndoe" == "johndoe" → 1 |
| `description length` | Length of bio field | "Hello world!" → 12 |
| `external URL` | Check if `user.website` exists | website ? 1 : 0 |
| `private` | Check private account flag | private ? 1 : 0 |
| `#posts` | Count posts array length | posts.length → 25 |
| `#followers` | Count followers array length | followers.length → 150 |
| `#following` | Count followings array length | followings.length → 100 |

---

## Security Considerations

1. **Admin-only access:** Only authenticated admins can verify profiles
2. **Rate limiting:** Consider adding rate limits to prevent API abuse
3. **Audit trails:** All verifications are logged in verification history
4. **Data privacy:** ML features are stored for transparency but contain no sensitive data
5. **API timeout:** 10-second timeout prevents hanging requests

---

## Future Enhancements

Potential improvements:
- [ ] Batch verification for multiple users
- [ ] Scheduled automatic verification for new users
- [ ] Email notifications for fake profile detections
- [ ] Confidence threshold configuration
- [ ] Verification dashboard with statistics
- [ ] Export verification reports
- [ ] Integration with blocking/deletion workflows
- [ ] Re-training feedback loop

---

## File Structure

```
backend/
├── models/
│   └── ProfileVerification.js    # New MongoDB model
├── controllers/
│   └── admin.js                  # Updated with verifyProfile function
└── routes/
    └── admin.js                  # Updated with verification route

frontend/
└── src/
    └── pages/
        └── AdminDashboard.jsx    # Updated with verification UI
```

---

## API Reference Summary

### Backend Endpoint

```
POST /api/admin/users/:userId/verify-profile
Authorization: Bearer <admin_token>

Response: {
  success: boolean,
  message: string,
  verification: {
    status: "real" | "fake",
    isFake: 0 | 1,
    confidence: {
      realProfileProb: number,
      fakeProfileProb: number
    },
    features: object,
    lastVerified: date
  }
}
```

### Python Flask API (External)

```
POST http://127.0.0.1:5000/predict
Content-Type: application/json

Body: {
  "profile pic": number,
  "nums/length username": number,
  "fullname words": number,
  "nums/length fullname": number,
  "name==username": number,
  "description length": number,
  "external URL": number,
  "private": number,
  "#posts": number,
  "#followers": number,
  "#following": number
}

Response: {
  "prediction": {
    "is_fake": 0 | 1,
    "status": "real" | "fake"
  },
  "confidence": {
    "real_profile_prob": number,
    "fake_profile_prob": number
  }
}
```

---

## Support

For issues or questions:
1. Check the troubleshooting section above
2. Review backend logs in terminal
3. Check browser console for frontend errors
4. Verify Flask API logs
5. Test each component individually

---

**Last Updated:** October 17, 2025
**Version:** 1.0.0
