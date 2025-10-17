#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}  Connectify2 Development Server${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""

# Function to check if a port is in use
check_port() {
    if lsof -Pi :$1 -sTCP:LISTEN -t >/dev/null 2>&1 ; then
        return 0
    else
        return 1
    fi
}

# Check if backend port is already in use
if check_port 8000; then
    echo -e "${YELLOW}⚠️  Port 8000 is already in use${NC}"
    echo -e "${YELLOW}   Backend may already be running${NC}"
    echo ""
else
    echo -e "${GREEN}✓ Port 8000 is available${NC}"
fi

# Check if frontend port is already in use
if check_port 3000; then
    echo -e "${YELLOW}⚠️  Port 3000 is already in use${NC}"
    echo -e "${YELLOW}   Frontend may already be running${NC}"
    echo ""
else
    echo -e "${GREEN}✓ Port 3000 is available${NC}"
fi

echo ""
echo -e "${GREEN}Starting servers...${NC}"
echo ""

# Start backend in background
echo -e "${GREEN}[1/2] Starting Backend Server...${NC}"
cd backend
node server.js &
BACKEND_PID=$!
cd ..

# Wait a moment for backend to start
sleep 3

# Check if backend started successfully
if check_port 8000; then
    echo -e "${GREEN}✓ Backend server started successfully on port 8000${NC}"
    echo -e "  PID: $BACKEND_PID"
else
    echo -e "${RED}✗ Failed to start backend server${NC}"
    exit 1
fi

echo ""

# Start frontend in background
echo -e "${GREEN}[2/2] Starting Frontend Server...${NC}"
cd frontend
npm start &
FRONTEND_PID=$!
cd ..

echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}  Servers Started Successfully!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo -e "Backend:  http://localhost:8000 (PID: $BACKEND_PID)"
echo -e "Frontend: http://localhost:3000 (PID: $FRONTEND_PID)"
echo ""
echo -e "${YELLOW}Admin Login:${NC}"
echo -e "  URL:      http://localhost:3000/admin/login"
echo -e "  Username: admin"
echo -e "  Password: admin123"
echo ""
echo -e "${GREEN}Press Ctrl+C to stop all servers${NC}"
echo ""

# Wait for both processes
wait
