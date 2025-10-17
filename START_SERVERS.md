# How to Start the Connectify2 Application

## Problem Identified
The admin dashboard was showing "Failed to fetch users" because the **backend server was not running**.

## Solution: Starting the Servers

### 1. Start the Backend Server

Open a terminal and run:

```bash
cd /home/fattahali37/Documents/Portfolio\ projects/Connectify2/backend
node server.js
```

Or if you have nodemon installed:

```bash
npm start
```

You should see:
```
Server running at port : 8000
✅ MongoDB connected: ...
```

### 2. Start the Frontend Server

Open another terminal and run:

```bash
cd /home/fattahali37/Documents/Portfolio\ projects/Connectify2/frontend
npm start
```

The React app should open at `http://localhost:3000`

### 3. Access Admin Dashboard

1. Navigate to `http://localhost:3000/admin/login`
2. Login with credentials:
   - Username: `admin`
   - Password: `admin123`
3. You should now see the admin dashboard with user data

## Verification

To verify the backend is running, you can test the endpoint:

```bash
curl http://localhost:8000/test
```

Expected response: `Hello from other side`

## Common Issues

### Issue: "nodemon: not found"
**Solution**: Use `node server.js` instead of `npm start`

### Issue: "Failed to connect to MongoDB"
**Solution**: Check your `.env` file has the correct MongoDB connection string

### Issue: "CORS errors"
**Solution**: The backend already has CORS enabled with `app.use(cors())`

### Issue: "Failed to fetch users" even with backend running
**Solution**: 
1. Clear browser localStorage
2. Re-login to admin dashboard
3. Check browser console for detailed error messages
