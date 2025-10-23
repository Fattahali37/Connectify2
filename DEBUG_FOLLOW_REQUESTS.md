# 🐛 Debug Follow Requests Feature

## Steps to Test & Debug

### 1. Open Browser Console (F12)

Navigate to the Follow Requests page and check console logs.

### 2. Test Sending a Request

**User A (timothy_watson920):**
1. Open browser console (F12)
2. Go to User B's profile
3. Click "Follow" button
4. Check console for logs showing:
   ```
   👤 Profile Data: { ... requestPending: true ... }
   ```

**User B (the private account owner):**
1. Open browser console (F12)
2. Go to `/followrequests` page
3. Check console logs:
   ```
   📥 Follow Requests Response: { success: true, requests: [...] }
   📥 Number of requests: 1
   ```

### 3. Check API Responses

In Network tab (F12 → Network):
- Filter: XHR
- Look for: `/user/follow-requests`
- Check Response tab

Expected response:
```json
{
  "success": true,
  "requests": [
    {
      "user": {
        "_id": "...",
        "username": "timothy_watson920",
        "name": "...",
        "avatar": "..."
      }
    }
  ]
}
```

### 4. Backend Console Logs

Check your backend terminal for:
```
📥 Follow Requests Count: 1
📥 Follow Requests: [{ user: { ... } }]
```

### 5. Test Accept/Reject

When clicking Accept or Reject, check console:
```
✅ Accepting request from user: <userId>
✅ Accept response: { success: true, message: "..." }
✅ Request accepted successfully
```

---

## Common Issues & Solutions

### Issue 1: "0 pending requests" but notification shows request

**Problem:** Database has data but API not retrieving correctly

**Solution:**
1. Restart backend server
2. Check backend logs for error messages
3. Verify User model exports correctly

### Issue 2: Accept/Reject buttons not working

**Problem:** userId not being passed correctly

**Check:**
1. Console logs show userId when clicking
2. Network tab shows POST request to `/user/follow-requests/accept/:userId`
3. Backend receives request with correct userId parameter

### Issue 3: Button still shows "Requested" after sending

**Problem:** Profile not detecting pending request

**Check console for:**
```javascript
👤 Profile Data: {
  requestReceived: [{user: "..."}],
  requestPending: true // Should be true
}
```

---

## Quick Database Check

### Option 1: MongoDB Compass
1. Connect to your database
2. Find `users` collection
3. Look for users with `requestReceived` or `requestSent` arrays
4. Check if they have data like: `[{ user: ObjectId("...") }]`

### Option 2: Backend Console
Add this to `backend/server.js` temporarily:
```javascript
// After connectToDB()
setTimeout(async () => {
  const User = require('./models/User');
  const usersWithRequests = await User.find({
    $or: [
      { 'requestReceived.0': { $exists: true } },
      { 'requestSent.0': { $exists: true } }
    ]
  }, 'username requestReceived requestSent');
  console.log('📊 Users with pending requests:', usersWithRequests);
}, 2000);
```

---

## Expected Flow

### Sending Request:
1. User A visits User B's private profile
2. User A clicks "Follow"
3. Button changes to "Requested" (amber color)
4. User B gets notification
5. User B sees badge on "Requests" sidebar

### Viewing Requests:
1. User B clicks "Requests" in sidebar
2. Page shows list of requesters
3. Each request shows: avatar, username, Accept/Reject buttons

### Accepting Request:
1. User B clicks "Accept"
2. Request disappears from list
3. User A becomes follower
4. User A can now see posts
5. User A gets notification "accepted your follow request"

### Rejecting Request:
1. User B clicks "Reject"
2. Request disappears from list
3. User A can send another request later

---

## Code Changes Made

### 1. backend/controllers/user.js
- ✅ `getFollowRequests`: Fetches requests with user details
- ✅ `acceptFollowRequest`: Adds follower and removes request
- ✅ `rejectFollowRequest`: Removes request
- ✅ Added console logs for debugging

### 2. frontend/src/pages/Profile.jsx
- ✅ Fixed ObjectId comparison using `.toString()`
- ✅ Added logging to see request detection

### 3. frontend/src/pages/FollowRequests.jsx
- ✅ Added comprehensive logging
- ✅ Better error handling

---

## Next Steps

1. **Refresh both browsers** (clear cache if needed)
2. **Check browser console** for all logs
3. **Check backend terminal** for API logs
4. **Test the complete flow** again
5. **Share console logs** if issue persists

---

## Testing Checklist

- [ ] User A can make account private
- [ ] User B can send follow request to User A
- [ ] User A sees notification
- [ ] User A sees badge on "Requests" (number 1)
- [ ] User A clicks "Requests" and sees User B in list
- [ ] User A can click "Accept" button
- [ ] Request disappears after accepting
- [ ] User B becomes follower
- [ ] User B can see User A's posts
- [ ] User A can click "Reject" on other requests
- [ ] Request disappears after rejecting

