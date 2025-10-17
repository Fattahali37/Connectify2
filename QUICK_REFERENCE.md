# 🚀 Quick Reference: ML Profile Verification

## Start All Services

```bash
# Terminal 1: Flask API (Python)
cd /path/to/your/flask/api
python app.py

# Terminal 2: Backend (Node.js)
cd backend
npm start

# Terminal 3: Frontend (React)
cd frontend
npm start

# Terminal 4: Run tests
./test-ml-integration.sh
```

## Test Flask API

```bash
curl -X POST http://127.0.0.1:5000/predict \
  -H "Content-Type: application/json" \
  -d '{"profile pic":1,"nums/length username":0.1,"fullname words":2,"nums/length fullname":0,"name==username":0,"description length":50,"external URL":1,"private":0,"#posts":25,"#followers":150,"#following":100}'
```

## Admin Dashboard Usage

1. Go to: `http://localhost:3000/admin/dashboard`
2. Login with admin credentials
3. Navigate to "All Users" tab
4. Click "Verify" button next to any user
5. View status badge and confidence score

## MongoDB Queries

```javascript
// View all verifications
db.profileverifications.find().pretty()

// Count by status
db.profileverifications.aggregate([
  { $group: { _id: "$verificationStatus", count: { $sum: 1 } } }
])

// View specific user
db.profileverifications.findOne({ userId: ObjectId("USER_ID") })
```

## API Endpoint

```
POST /api/admin/users/:userId/verify-profile
Authorization: Bearer <admin_token>
```

## Status Badges

- 🛡️ **Green**: Verified Real
- ⚠️ **Red**: Flagged Fake
- ❓ **Gray**: Unverified

## Files Created/Modified

### ✨ New Files
- `/backend/models/ProfileVerification.js`
- `/ML_INTEGRATION_GUIDE.md`
- `/test-ml-integration.sh`
- `/IMPLEMENTATION_SUMMARY.md`
- `/QUICK_REFERENCE.md` (this file)

### ✏️ Modified Files
- `/backend/controllers/admin.js`
- `/backend/routes/admin.js`
- `/frontend/src/pages/AdminDashboard.jsx`

## Environment Variable

```env
# Add to /backend/.env
FLASK_API_URL=http://127.0.0.1:5000
```

## Troubleshooting

| Problem | Solution |
|---------|----------|
| API not reachable | Check Flask API is running on port 5000 |
| Button stuck on "Verifying..." | Check browser console and backend logs |
| No status update | Verify MongoDB connection |

## Testing Checklist

- [ ] Flask API responds to `/predict`
- [ ] Backend server running on port 8000
- [ ] Frontend running on port 3000
- [ ] Admin can login
- [ ] Verify button appears in user table
- [ ] Verification triggers successfully
- [ ] Status badge updates
- [ ] Confidence score displays
- [ ] MongoDB stores data

## Documentation

- **Complete Guide**: `ML_INTEGRATION_GUIDE.md`
- **Summary**: `IMPLEMENTATION_SUMMARY.md`
- **This Reference**: `QUICK_REFERENCE.md`

---

**Need help?** Check the detailed guide in `ML_INTEGRATION_GUIDE.md`
