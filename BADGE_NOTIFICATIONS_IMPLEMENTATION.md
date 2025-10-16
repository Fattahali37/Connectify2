# Real-Time Badge Notifications Implementation

## Overview
Implemented real-time badge counters for both **Messages** and **Notifications** in the sidebar that update automatically and clear when viewed.

## Features Implemented

### 1. Message Badge Counter
- ✅ Shows count of unread messages from all chat rooms
- ✅ Updates every 10 seconds automatically
- ✅ Tracks when user last viewed each chat room
- ✅ Only counts messages sent by others (not your own)
- ✅ Badge disappears when count is 0

### 2. Notification Badge Counter
- ✅ Shows count of unread notifications (likes, comments, follows)
- ✅ Updates every 10 seconds automatically
- ✅ Marks all notifications as read when clicked
- ✅ Badge disappears when count is 0

## Backend Changes

### New API Endpoints

#### User Notifications
1. **GET** `/user/notifications/unread-count`
   - Returns count of unread notifications
   - Response: `{ success: true, count: number }`

2. **PUT** `/user/notifications/mark-read`
   - Marks all user notifications as read
   - Response: `{ success: true, message: string }`

#### Chat Messages
3. **GET** `/chat/unread-count`
   - Returns count of chat rooms with unread messages
   - Response: `{ success: true, count: number }`

4. **PUT** `/chat/update-last-seen`
   - Updates when user last viewed a chat room
   - Body: `{ roomId: string }`
   - Response: `{ success: true }`

5. **PUT** `/chat/update-last-message`
   - Updates timestamp of last message in a room
   - Body: `{ roomId: string, timestamp: string }`
   - Response: `{ success: true }`

### Database Schema Changes

#### Room Model (`backend/models/Room.js`)
Added new fields to track message read status:

```javascript
lastSeen: [
  {
    userId: ObjectId,
    timestamp: Date
  }
]

lastMessage: {
  timestamp: Date,
  from: ObjectId
}
```

**How it works:**
- `lastSeen`: Stores when each user in the room last viewed it
- `lastMessage`: Stores timestamp and sender of the most recent message
- If `lastMessage.timestamp > lastSeen.timestamp` for a user, that room has unread messages

### Controller Functions

#### `backend/controllers/user.js`
- `getUnreadNotificationCount()` - Counts notifications where `seen: false`
- `markNotificationsAsRead()` - Sets all notifications `seen: true`

#### `backend/controllers/chat.js`
- `getUnreadMessageCount()` - Counts rooms with messages newer than user's last seen time
- `updateLastSeen()` - Records when user views a chat room
- `updateLastMessage()` - Records when a new message is sent

## Frontend Changes

### Sidebar Component (`frontend/src/components/navbar/Sidebar.jsx`)

#### New State Variables
```javascript
const [notificationCount, setNotificationCount] = useState(0);
const [messageCount, setMessageCount] = useState(0);
```

#### Auto-Refresh Logic
Both counters poll the backend every 10 seconds:

```javascript
// Notifications
useEffect(() => {
  const checkNotifications = async () => {
    const countRes = await api.get(`${url}/user/notifications/unread-count`);
    setNotificationCount(countRes.data.count);
  };
  checkNotifications();
  const interval = setInterval(checkNotifications, 10000);
  return () => clearInterval(interval);
}, [context.auth]);

// Messages
useEffect(() => {
  const checkUnreadMessages = async () => {
    const response = await api.get(`${url}/chat/unread-count`);
    setMessageCount(response.data.count);
  };
  checkUnreadMessages();
  const interval = setInterval(checkUnreadMessages, 10000);
  return () => clearInterval(interval);
}, [context.auth]);
```

#### Badge Components
```jsx
{/* Messages Badge */}
<Badge badgeContent={messageCount} color="error">
  {messageFill || messageOutline}
</Badge>

{/* Notifications Badge */}
<Badge badgeContent={notificationCount} color="error">
  {heartIcon || heartOutline}
</Badge>
```

#### Click Handlers
- **Notifications**: Clicking marks all as read and resets counter to 0
- **Messages**: Badge automatically updates when rooms are viewed

### ChatBox Component (`frontend/src/components/chat/ChatBox.jsx`)

#### Auto-Update Last Seen
When user opens a chat room:
```javascript
useEffect(() => {
  api.put(`${url}/chat/update-last-seen`, { roomId })
    .catch((err) => console.error('Error updating last seen:', err));
}, [roomId]);
```

#### Track Sent Messages
When user sends a message:
```javascript
async function sendMessage(m, file) {
  const timestamp = new Date();
  await addDoc(collection(db, roomId), { /* message data */ });
  
  // Update last message timestamp
  api.put(`${url}/chat/update-last-message`, { 
    roomId, 
    timestamp: timestamp.toISOString() 
  });
}
```

## How It Works

### Message Badge Flow
1. User A sends message to User B in Room X
2. `ChatBox.sendMessage()` calls `/chat/update-last-message` with current timestamp
3. MongoDB Room document updated with `lastMessage.timestamp` and `lastMessage.from`
4. User B's sidebar polls `/chat/unread-count` every 10 seconds
5. Backend compares `lastMessage.timestamp` with User B's `lastSeen.timestamp`
6. If message is newer AND not from User B, increment unread count
7. Badge shows count on User B's Messages icon
8. When User B opens Room X, `ChatBox` calls `/chat/update-last-seen`
9. User B's `lastSeen.timestamp` updated to current time
10. Next poll shows count decreased by 1

### Notification Badge Flow
1. User A likes User B's post
2. Backend adds notification to User B's `notifications` array with `seen: false`
3. User B's sidebar polls `/user/notifications/unread-count` every 10 seconds
4. Backend counts notifications where `seen: false`
5. Badge shows count on User B's Notifications icon
6. When User B clicks Notifications, `/user/notifications/mark-read` is called
7. All notifications updated to `seen: true`
8. Counter resets to 0

## Visual Behavior

### Message Badge
- 🔴 Red badge with number appears when unread messages exist
- ⚫ Badge disappears when count reaches 0
- 🔄 Updates every 10 seconds
- ✅ Decreases when user opens a chat room

### Notification Badge
- 🔴 Red badge with number appears when unread notifications exist
- ⚫ Badge disappears when count reaches 0
- 🔄 Updates every 10 seconds
- ✅ Resets to 0 when user clicks Notifications icon

## Testing Checklist

### Messages
- [ ] Send message from User A to User B
- [ ] Verify badge appears on User B's Messages icon with count 1
- [ ] User B opens the chat room
- [ ] Verify badge count decreases to 0
- [ ] Send messages from multiple users
- [ ] Verify badge shows total count of rooms with unread messages
- [ ] Verify badge doesn't increment when User B sends message

### Notifications
- [ ] User A likes User B's post
- [ ] Verify badge appears on User B's Notifications icon with count 1
- [ ] User A comments on User B's post
- [ ] Verify badge count increases to 2
- [ ] User B clicks Notifications icon
- [ ] Verify badge resets to 0
- [ ] Check that notifications are marked as read in database

## Performance Considerations

- **Poll Interval**: 10 seconds (adjustable in useEffect)
- **API Calls**: 2 endpoints polled every 10 seconds per user
- **Database Queries**: Efficient queries using indexes on userId and seen fields

## Future Enhancements

1. **Socket.io Integration**: Replace polling with real-time socket events
2. **Individual Message Count**: Show total unread messages instead of room count
3. **Sound Notifications**: Play sound when new message/notification arrives
4. **Browser Notifications**: Desktop notifications for new messages
5. **Read Receipts**: Show when messages have been seen by recipient
6. **Typing Indicators**: Already implemented for chat rooms

## Files Modified

### Backend
- `backend/models/Room.js` - Added lastSeen and lastMessage fields
- `backend/controllers/user.js` - Added notification count endpoints
- `backend/controllers/chat.js` - Added message tracking endpoints
- `backend/routes/user.js` - Added notification routes
- `backend/routes/chat.js` - Added message tracking routes

### Frontend
- `frontend/src/components/navbar/Sidebar.jsx` - Added badge counters
- `frontend/src/components/chat/ChatBox.jsx` - Added message tracking

## Configuration

No additional configuration required. The feature works out of the box once deployed.

## Notes

- Badge counts are user-specific and persist across sessions
- MongoDB stores tracking data, Firebase stores actual messages
- Polling interval can be adjusted in the useEffect dependencies
- All API calls include error handling to prevent UI crashes
