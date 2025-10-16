# Notification & Message Read Status Implementation

## Changes Made

### 1. Notification Badge Auto-Clear ✅

**Problem:** Notification badge wasn't clearing after viewing notifications

**Solution:** Added auto mark-as-read when NotificationBox opens

**File:** `frontend/src/components/dialog/NotificationBox.jsx`
```javascript
useEffect(() => {
    // Fetch notifications
    api.get(`${url}/user/view/notifications`).then(...);
    
    // Mark all notifications as read when opening
    api.put(`${url}/user/notifications/mark-read`)
        .then(() => console.log('Notifications marked as read'))
        .catch((err) => console.error('Error:', err));
}, [])
```

**Behavior:**
- When user clicks notification icon → NotificationBox opens
- API call automatically marks all notifications as `seen: true`
- Badge count updates to 0 within 10 seconds (next poll)
- Works immediately on next page refresh

---

### 2. Red Dot Indicator for Unread Messages ✅

**Problem:** No visual indicator for unread messages in chat list

**Solution:** Added red dot + bold text for rooms with unread messages

**File:** `frontend/src/components/chat/RoomName.jsx`

#### Features Added:
1. **Red Dot Indicator** - Shows on the right side of rooms with unread messages
2. **Bold Name** - Room name appears bold when unread
3. **Dark Last Message** - Last message text appears darker when unread
4. **Auto-Clear on Click** - Red dot disappears when room is clicked

#### How It Works:
```javascript
// Track unread status
const [hasUnread, setHasUnread] = useState(false);

// Check if message is newer than last seen time
useEffect(() => {
    onSnapshot(q, (querySnapshot) => {
        const messages = querySnapshot.docs.map(doc => doc.data());
        
        if (messages[0]?.uid !== context.auth._id) {
            const lastSeenKey = `lastSeen_${roomId}_${context.auth._id}`;
            const lastSeenTime = localStorage.getItem(lastSeenKey);
            const messageTime = messages[0].timestamp?.toDate();
            
            if (!lastSeenTime || messageTime > new Date(lastSeenTime)) {
                setHasUnread(true); // Show red dot
            }
        }
    });
}, [q, roomId]);

// Mark as read when clicked
onClick={() => {
    localStorage.setItem(`lastSeen_${roomId}_${context.auth._id}`, new Date().toISOString());
    setHasUnread(false);
}}
```

#### Visual Changes:
```jsx
// Room name - bold when unread
<p style={{ 
    fontSize: '13.75px', 
    fontWeight: hasUnread ? 'bold' : 'normal' 
}}>
    {roomName}
</p>

// Last message - darker when unread
<p style={{ 
    fontSize: '12px', 
    color: hasUnread ? '#000' : 'gray',
    fontWeight: hasUnread ? '600' : 'normal'
}}>
    {lastmessage}
</p>

// Red dot indicator
{hasUnread && (
    <div style={{
        backgroundColor: '#ff0000',
        width: '10px',
        height: '10px',
        borderRadius: '50%',
        marginRight: '20px'
    }}></div>
)}
```

---

### 3. Auto-Mark Messages as Read in ChatBox ✅

**File:** `frontend/src/components/chat/ChatBox.jsx`

Added localStorage tracking when user opens a chat:
```javascript
useEffect(() => {
    // Mark room as seen in localStorage
    const lastSeenKey = `lastSeen_${roomId}_${context.auth._id}`;
    localStorage.setItem(lastSeenKey, new Date().toISOString());
    
    // Also update backend
    api.put(`${url}/chat/update-last-seen`, { roomId });
}, [roomId, context.auth._id]);
```

---

## How It All Works Together

### Notification Flow:
1. User A likes User B's post → Notification created with `seen: false`
2. User B sees badge with count "1"
3. User B clicks notification icon → NotificationBox opens
4. API automatically marks all notifications as `seen: true`
5. Next poll (10 seconds) → Badge updates to "0"

### Message Unread Flow:
1. User A sends message to User B in Room X
2. Message timestamp stored in Firebase
3. User B opens Messages page
4. **Red dot appears** next to Room X
5. **Room name is bold**, last message is darker
6. User B clicks Room X
7. `lastSeen` timestamp saved to localStorage
8. **Red dot disappears**, text returns to normal
9. Badge count decreases

---

## Testing Instructions

### Test Notification Badge:
1. Have another user like your post
2. Check sidebar - notification badge shows "1"
3. Click notification icon (heart)
4. NotificationBox opens showing the like
5. Wait 10 seconds
6. Badge count updates to "0" ✅

### Test Message Red Dot:
1. Have another user send you a message
2. Open Messages page (`/chats/all`)
3. **Look for red dot** on the right side of that room ✅
4. **Room name should be bold** ✅
5. Click on that room
6. Red dot disappears immediately ✅
7. Room name returns to normal weight ✅
8. Message badge count decreases ✅

---

## Visual Examples

### Before (No Unread):
```
┌────────────────────────────────┐
│  [Avatar]  John Doe            │
│            Hey there           │
└────────────────────────────────┘
```

### After (With Unread):
```
┌────────────────────────────────┐
│  [Avatar]  **John Doe**     🔴 │
│            **New message**     │
└────────────────────────────────┘
```

---

## Storage Strategy

### localStorage Keys:
- `lastSeen_${roomId}_${userId}` - Timestamp when user last viewed room
- Used for instant red dot display without API calls
- Syncs with backend via `/chat/update-last-seen`

### MongoDB:
- `User.notifications[].seen` - Boolean for notification read status
- `Room.lastSeen[]` - Array of user last seen timestamps
- `Room.lastMessage` - Latest message info for comparison

---

## Performance Notes

- ✅ Red dots update **instantly** (no API delay)
- ✅ Uses localStorage for fast local checks
- ✅ Backend sync happens in background
- ✅ No extra Firebase queries (uses existing message listener)
- ✅ Notification marking happens once per open (not on every poll)

---

## Troubleshooting

### Red dot not appearing:
1. Check localStorage: `localStorage.getItem('lastSeen_ROOM_ID_USER_ID')`
2. Clear it to test: `localStorage.removeItem('lastSeen_ROOM_ID_USER_ID')`
3. Refresh and send new message

### Notification badge not clearing:
1. Check console for "Notifications marked as read" log
2. Check network tab for `/user/notifications/mark-read` request
3. Verify backend server is running with new routes

### Badge count not updating:
1. Wait 10 seconds for next poll
2. Or refresh the page for immediate update
3. Check console for API response logs
