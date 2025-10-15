# Admin Dashboard Setup Guide

## Overview
The Connectify2 Admin Dashboard provides comprehensive user management and analytics features for platform administrators.

## Features

### User Management
- **View All Users**: Complete list of registered users with detailed information
- **User Information Displayed**:
  - Username, email, full name
  - Profile picture
  - Join date
  - Number of posts
  - Followers count
  - Following count
  - Current status (active/blocked)

### User Actions
- **Delete User**: Permanently remove user and all associated data
  - Cascading deletion of posts, comments, likes, relationships
  - Username/email reservation to prevent reuse
- **Block User**: Temporarily disable user account
- **Unblock User**: Restore blocked user account
- **Blocked Users List**: Dedicated view for all blocked users

### Analytics & Charts
- **User Growth Chart**: Line chart showing new registrations over time
- **Status Distribution**: Bar chart of active vs blocked users
- **Activity Distribution**: Pie chart showing user activity levels based on post count
- **Dashboard Overview**: Key metrics and statistics

## Setup Instructions

### Backend Configuration

1. **Environment Variables**
   Add the following to your `.env` file in the backend directory:
   ```env
   ADMIN_USERNAME=admin
   ADMIN_PASSWORD=admin123
   ```
   **Important**: Change these credentials to secure values in production!

2. **Database Schema Updates**
   The User model has been updated with a `status` field:
   ```javascript
   status: {
     type: String,
     enum: ['active', 'blocked'],
     default: 'active',
   }
   ```

3. **New Collections**
   - `DeletedUser`: Tracks deleted usernames/emails to prevent reuse

### Frontend Dependencies

Install the required chart library:
```bash
cd frontend
npm install recharts
```

### Admin Authentication

1. **Single Admin Account**
   - Only one admin account exists per platform
   - Credentials stored in environment variables
   - No admin registration process

2. **Login Process**
   - Admin can login through the regular login page using admin credentials
   - System automatically detects admin credentials and redirects to admin dashboard
   - Alternative: Direct access via `/admin/login`

3. **Access Control**
   - Admin routes protected with JWT middleware
   - Regular users cannot access admin features
   - Blocked users see notification on their profile

## API Endpoints

### Admin Authentication
- `POST /auth/login` - Enhanced to support admin login

### User Management
- `GET /api/admin/users` - Get all users (admin only)
- `GET /api/admin/blocked-users` - Get blocked users (admin only)
- `DELETE /api/admin/users/:id` - Delete user (admin only)
- `PUT /api/admin/users/:id/block` - Block user (admin only)
- `PUT /api/admin/users/:id/unblock` - Unblock user (admin only)

### Analytics
- `GET /api/admin/stats/user-growth` - User growth statistics
- `GET /api/admin/stats/user-activity` - User activity statistics

## Frontend Routes

- `/admin/login` - Admin login page
- `/admin/dashboard` - Admin dashboard (protected)

## Security Features

1. **Password Security**
   - Admin password should be hashed in production
   - Consider using bcrypt for password hashing

2. **JWT Authentication**
   - Admin tokens include `isAdmin` flag
   - Separate middleware for admin route protection

3. **Data Integrity**
   - Cascading deletes maintain database consistency
   - Username/email reservation prevents reuse

## User Experience

### Blocked User Experience
When a user is blocked:
1. They cannot access the platform (401/403 responses)
2. If they view their profile, they see a prominent notification:
   "⚠️ Your account has been blocked by the admin"

### Admin Dashboard Features
- **Responsive Design**: Works on desktop and mobile
- **Real-time Updates**: Refresh button to update data
- **Confirmation Dialogs**: Safe deletion with confirmation
- **Visual Feedback**: Loading states and success/error messages
- **Tabbed Interface**: Organized sections for different functions

## Usage Instructions

1. **Access Admin Dashboard**
   - Navigate to `/admin/login`
   - Enter admin credentials
   - Access dashboard at `/admin/dashboard`

2. **Manage Users**
   - View all users in the "All Users" tab
   - Use action buttons to block/unblock or delete users
   - View blocked users in the "Blocked Users" tab

3. **View Analytics**
   - Check the "Analytics" tab for charts and statistics
   - User growth, activity distribution, and key metrics

4. **Security Best Practices**
   - Change default admin credentials
   - Use strong passwords
   - Regularly review user accounts
   - Monitor analytics for unusual activity

## Troubleshooting

### Common Issues

1. **Admin Login Not Working**
   - Verify environment variables are set correctly
   - Check backend logs for authentication errors

2. **Charts Not Loading**
   - Ensure recharts library is installed
   - Check network requests in browser dev tools

3. **User Actions Failing**
   - Verify admin authentication token
   - Check backend middleware configuration

### Support
For additional support, check the backend logs and browser console for error messages.
