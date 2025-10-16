# Quick Badge Testing Script

## Test the badges are working correctly

### Step 1: Open Browser Console
Press `F12` or `Ctrl+Shift+I` (Windows/Linux) or `Cmd+Option+I` (Mac)

### Step 2: Look for These Console Messages

You should see logs appearing every 10 seconds:

```
Badge counts - Messages: 0 Notifications: 0
Auth user: 6703a85f9e2b4c5d8a1f3e4b
Notification count response: { success: true, count: 0 }
Setting notification count to: 0
Message count response: { success: true, count: 0 }
Setting message count to: 0
```

### Step 3: If You See Errors Like These:

#### Error: 404 Not Found on `/user/notifications/unread-count`
**Solution:** Backend server needs to be restarted to load new routes
```bash
cd backend
npm start
```

#### Error: 401 Unauthorized
**Solution:** You're not logged in. Log in first, then check again.

#### Error: Cannot GET /user/notifications/unread-count
**Solution:** Route not registered. Check that backend/routes/user.js includes:
```javascript
router.route("/notifications/unread-count").get(isAuthenticated, getUnreadNotificationCount)
```

### Step 4: Force a Test Badge to Appear

Add this temporarily to Sidebar.jsx after line 68:

```javascript
// TEMPORARY TEST CODE - REMOVE AFTER TESTING
useEffect(() => {
  setNotificationCount(5);
  setMessageCount(3);
}, []);
```

If badges appear with these hardcoded values, the problem is with the API.
If badges still don't appear, the problem is with the Badge component rendering.

### Step 5: Check Network Tab

1. Open browser DevTools
2. Go to Network tab
3. Filter by "Fetch/XHR"
4. Look for these requests every 10 seconds:
   - `/user/notifications/unread-count`
   - `/chat/unread-count`

5. Click on each request and check:
   - **Status:** Should be `200 OK`
   - **Response:** Should show `{ "success": true, "count": X }`

### Step 6: Create Test Notification

To create a test notification in MongoDB:

```javascript
// Run in MongoDB shell or Compass
db.users.updateOne(
  { _id: ObjectId("YOUR_USER_ID_HERE") },
  { 
    $push: { 
      notifications: {
        user: ObjectId("ANOTHER_USER_ID"),
        NotificationType: 1,
        content: "liked your post",
        seen: false,
        time: new Date()
      }
    }
  }
)
```

Then refresh the page and check if notification badge shows 1.

### Step 7: Create Test Unread Message

```javascript
// Run in MongoDB shell or Compass

// First, find a room you're part of
db.rooms.findOne({ people: ObjectId("YOUR_USER_ID_HERE") })

// Then update it with a recent message
db.rooms.updateOne(
  { roomId: "ROOM_ID_FROM_ABOVE" },
  {
    $set: {
      lastMessage: {
        timestamp: new Date(),
        from: ObjectId("OTHER_USER_ID")
      }
    }
  }
)
```

Wait 10 seconds and check if message badge appears.

## Expected Results

✅ **Working correctly:**
- Console logs appear every 10 seconds
- API calls return 200 status
- Badges appear when count > 0
- Badges disappear when count = 0
- Clicking notifications resets count

❌ **Not working - Needs fixing:**
- No console logs appearing → Check if Sidebar component is rendering
- 404 errors → Restart backend server
- 401 errors → User not logged in
- Badges never appear → Check CSS or Badge component
- Count stuck at 0 → No unread data in database
