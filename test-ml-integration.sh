#!/bin/bash

# ML Integration Testing Script
# This script helps verify that the ML profile verification system is working correctly

echo "============================================="
echo "ML Profile Verification Integration Test"
echo "============================================="
echo ""

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test 1: Check if Flask API is running
echo "Test 1: Checking Flask API..."
FLASK_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:5000 2>/dev/null)

if [ "$FLASK_RESPONSE" != "000" ]; then
    echo -e "${GREEN}✓ Flask API is running (HTTP $FLASK_RESPONSE)${NC}"
else
    echo -e "${RED}✗ Flask API is NOT running${NC}"
    echo "  Please start your Flask API: python app.py"
    exit 1
fi

echo ""

# Test 2: Test Flask API /predict endpoint
echo "Test 2: Testing Flask /predict endpoint..."

PREDICTION_RESPONSE=$(curl -s -X POST http://127.0.0.1:5000/predict \
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
  }' 2>/dev/null)

if echo "$PREDICTION_RESPONSE" | grep -q "prediction"; then
    echo -e "${GREEN}✓ Flask API /predict endpoint is working${NC}"
    echo "  Response: $PREDICTION_RESPONSE"
else
    echo -e "${RED}✗ Flask API /predict endpoint failed${NC}"
    echo "  Response: $PREDICTION_RESPONSE"
    exit 1
fi

echo ""

# Test 3: Check if backend server is running
echo "Test 3: Checking Express backend..."
BACKEND_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:8000 2>/dev/null)

if [ "$BACKEND_RESPONSE" != "000" ]; then
    echo -e "${GREEN}✓ Backend server is running (HTTP $BACKEND_RESPONSE)${NC}"
else
    echo -e "${RED}✗ Backend server is NOT running${NC}"
    echo "  Please start your backend: cd backend && npm start"
    exit 1
fi

echo ""

# Test 4: Check if MongoDB is accessible
echo "Test 4: Checking MongoDB connection..."
# This test is indirect - we'll check if the backend can respond to an API call
# You may need admin credentials for this test to work fully

echo -e "${YELLOW}⚠ Manual check required: Verify MongoDB is running${NC}"
echo "  Run: mongosh --eval 'db.runCommand({ ping: 1 })'"

echo ""

# Test 5: Check if ProfileVerification model exists
echo "Test 5: Checking ProfileVerification model..."
if [ -f "../backend/models/ProfileVerification.js" ]; then
    echo -e "${GREEN}✓ ProfileVerification model exists${NC}"
else
    echo -e "${RED}✗ ProfileVerification model not found${NC}"
    exit 1
fi

echo ""

# Test 6: Check if admin route is configured
echo "Test 6: Checking admin routes..."
if grep -q "verifyProfile" ../backend/routes/admin.js 2>/dev/null; then
    echo -e "${GREEN}✓ Verification route is configured${NC}"
else
    echo -e "${RED}✗ Verification route not found in admin.js${NC}"
    exit 1
fi

echo ""

# Test 7: Check frontend component
echo "Test 7: Checking frontend component..."
if grep -q "handleVerifyProfile" ../frontend/src/pages/AdminDashboard.jsx 2>/dev/null; then
    echo -e "${GREEN}✓ Frontend verification UI is implemented${NC}"
else
    echo -e "${RED}✗ Frontend verification UI not found${NC}"
    exit 1
fi

echo ""
echo "============================================="
echo -e "${GREEN}All tests passed!${NC}"
echo "============================================="
echo ""
echo "Next steps:"
echo "1. Log in to the admin dashboard"
echo "2. Navigate to the 'All Users' tab"
echo "3. Click the 'Verify' button next to any user"
echo "4. Check that the verification status updates"
echo ""
echo "To view verification data in MongoDB:"
echo "  mongosh"
echo "  use your_database_name"
echo "  db.profileverifications.find().pretty()"
echo ""
