# Badge Notifications Debugging Guide

## How to Test and Debug the Badge Feature

### Step 1: Check Console Logs
Open your browser console (F12) and look for these log messages:

1. **Auth Check:**
   ```
   Auth user: <your-user-id>
   ```
   If this shows `undefined`, the user is not logged in.

2. **API Response Logs:**
   ```
   Notification count response: { success: true, count: X }
   Setting notification count to: X
   
   Message count response: { success: true, count: Y }
   Setting message count to: Y
   ```

3. **Badge Count Updates:**
   ```
   Badge counts - Messages: Y Notifications: X
   ```

### Step 2: Test Backend Endpoints Directly

Open a new browser tab or use Postman to test these endpoints:

#### Test Notification Count
```bash
GET http://localhost:5000/user/notifications/unread-count
Headers: {
  Authorization: Bearer <your-jwt-token>
}
```

Expected Response:
```json
{
  "success": true,
  "count": 5
}
```

#### Test Message Count
```bash
GET http://localhost:5000/chat/unread-count
Headers: {
  Authorization: Bearer <your-jwt-token>
}
```

Expected Response:
```json
{
  "success": true,
  "count": 3
}
```

### Step 3: Create Test Data

#### Create Unread Notifications
1. From another account, like one of your posts
2. From another account, comment on your post
3. From another account, follow you
4. Check if notification count increases

#### Create Unread Messages
1. From another account, send you a direct message
2. DON'T open the chat room yet
3. Check if message count increases

### Step 4: Common Issues and Fixes

#### Issue 1: Badges not showing at all
**Possible Causes:**
- API endpoints returning errors
- Authentication token missing or invalid
- Backend server not running

**Fix:**
1. Check browser console for errors
2. Verify backend is running on port 5000
3. Check that you're logged in (`context.auth` is not null)

#### Issue 2: Badges showing 0 when they shouldn't
**Possible Causes:**
- No unread notifications/messages in database
- API returning success but count is 0

**Fix:**
1. Manually create test data (see Step 3)
2. Check MongoDB database directly:
   ```javascript
   // Check notifications
   db.users.findOne({ _id: ObjectId("<your-id>") }, { notifications: 1 })
   
   // Check if any have seen: false
   db.users.findOne(
     { _id: ObjectId("<your-id>"), "notifications.seen": false },
     { notifications: 1 }
   )
   
   // Check rooms
   db.rooms.find({ people: ObjectId("<your-id>") })
   ```

#### Issue 3: Badges not updating in real-time
**Possible Causes:**
- Polling interval too long (currently 10 seconds)
- API calls failing silently

**Fix:**
1. Reduce polling interval to 5 seconds for testing:
   ```javascript
   const interval = setInterval(checkNotifications, 5000);
   ```
2. Check network tab in browser dev tools for failed requests

#### Issue 4: Badges disappear when they shouldn't
**Possible Causes:**
- Click handler marking all as read unintentionally
- API being called without user interaction

**Fix:**
1. Check console logs when clicking notifications
2. Verify the mark-read endpoint is only called on click

### Step 5: Manual Test with Fixed Values

To verify the Badge component renders correctly, temporarily hardcode values:

```javascript
// In Sidebar.jsx, temporarily change:
const [notificationCount, setNotificationCount] = useState(5); // Test value
const [messageCount, setMessageCount] = useState(3); // Test value
```

If badges show with hardcoded values but not with API data:
- Problem is with API calls or data fetching
- Check console logs for API errors

If badges DON'T show even with hardcoded values:
- Problem is with Badge component rendering
- Check CSS conflicts
- Check if Material-UI is properly installed

### Step 6: Verify Backend Routes

Run these commands in terminal:

```bash
# Navigate to backend
cd backend

# Start server with logs
npm start

# In another terminal, test endpoints
curl -X GET http://localhost:5000/user/notifications/unread-count \
  -H "Authorization: Bearer <your-token>"

curl -X GET http://localhost:5000/chat/unread-count \
  -H "Authorization: Bearer <your-token>"
```

### Step 7: Check Database Schema

Ensure your MongoDB collections have the correct structure:

#### Users Collection
```javascript
{
  _id: ObjectId("..."),
  username: "testuser",
  notifications: [
    {
      user: ObjectId("..."),
      NotificationType: 1, // 1=like, 2=comment, 3=follow
      content: "liked your post",
      seen: false, // <- This should be false for unread
      postId: ObjectId("..."),
      time: ISODate("2025-10-16T...")
    }
  ]
}
```

#### Rooms Collection
```javascript
{
  _id: ObjectId("..."),
  roomId: "uuid-string",
  people: [ObjectId("user1"), ObjectId("user2")],
  lastSeen: [
    {
      userId: ObjectId("user1"),
      timestamp: ISODate("2025-10-16T10:00:00")
    }
  ],
  lastMessage: {
    timestamp: ISODate("2025-10-16T10:05:00"), // <- Newer than lastSeen
    from: ObjectId("user2")
  }
}
```

### Expected Behavior

✅ **Notifications Badge:**
- Shows count when notifications with `seen: false` exist
- Updates every 10 seconds
- Resets to 0 when clicking notifications icon
- Disappears when count is 0

✅ **Messages Badge:**
- Shows count of rooms where `lastMessage.timestamp > lastSeen.timestamp`
- Only counts messages NOT from the current user
- Updates every 10 seconds
- Decreases when you open a chat room
- Disappears when count is 0

### Quick Troubleshooting Checklist

- [ ] Backend server running on port 5000
- [ ] Frontend running on port 3000
- [ ] User is logged in (check console for auth user ID)
- [ ] Browser console shows API calls being made
- [ ] API responses show `success: true`
- [ ] Database has test data (unread notifications/messages)
- [ ] Material-UI Badge component imported correctly
- [ ] No CSS conflicts hiding the badges
- [ ] No JavaScript errors in console

### Need More Help?

1. Check all console logs mentioned in Step 1
2. Test backend endpoints directly (Step 2)
3. Create fresh test data (Step 3)
4. Try hardcoded values (Step 5)
5. Share console logs and error messages for debugging
