#!/bin/bash

# Test Runner Script for Connectify2

echo "=================================="
echo "   Connectify2 Test Suite Runner   "
echo "=================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    if [ $1 -eq 0 ]; then
        echo -e "${GREEN}✓ $2 passed${NC}"
    else
        echo -e "${RED}✗ $2 failed${NC}"
    fi
}

# Check if node_modules exist
check_dependencies() {
    echo "Checking dependencies..."
    
    if [ ! -d "frontend/node_modules" ]; then
        echo -e "${YELLOW}Frontend dependencies not installed. Installing...${NC}"
        cd frontend && npm install && cd ..
    fi
    
    if [ ! -d "backend/node_modules" ]; then
        echo -e "${YELLOW}Backend dependencies not installed. Installing...${NC}"
        cd backend && npm install && cd ..
    fi
    
    echo -e "${GREEN}✓ Dependencies checked${NC}"
    echo ""
}

# Run frontend tests
run_frontend_tests() {
    echo "=================================="
    echo "Running Frontend Tests..."
    echo "=================================="
    cd frontend
    npm test -- --coverage --watchAll=false
    FRONTEND_EXIT_CODE=$?
    cd ..
    print_status $FRONTEND_EXIT_CODE "Frontend tests"
    echo ""
    return $FRONTEND_EXIT_CODE
}

# Run backend tests
run_backend_tests() {
    echo "=================================="
    echo "Running Backend Tests..."
    echo "=================================="
    cd backend
    npm test
    BACKEND_EXIT_CODE=$?
    cd ..
    print_status $BACKEND_EXIT_CODE "Backend tests"
    echo ""
    return $BACKEND_EXIT_CODE
}

# Main execution
main() {
    check_dependencies
    
    FRONTEND_RESULT=0
    BACKEND_RESULT=0
    
    # Run tests based on argument
    case "$1" in
        "frontend")
            run_frontend_tests
            FRONTEND_RESULT=$?
            ;;
        "backend")
            run_backend_tests
            BACKEND_RESULT=$?
            ;;
        "all"|"")
            run_frontend_tests
            FRONTEND_RESULT=$?
            run_backend_tests
            BACKEND_RESULT=$?
            ;;
        *)
            echo "Usage: $0 {frontend|backend|all}"
            exit 1
            ;;
    esac
    
    # Summary
    echo "=================================="
    echo "Test Summary"
    echo "=================================="
    print_status $FRONTEND_RESULT "Frontend Tests"
    print_status $BACKEND_RESULT "Backend Tests"
    echo ""
    
    # Exit with failure if any tests failed
    if [ $FRONTEND_RESULT -ne 0 ] || [ $BACKEND_RESULT -ne 0 ]; then
        echo -e "${RED}Some tests failed. Please review the output above.${NC}"
        exit 1
    else
        echo -e "${GREEN}All tests passed successfully!${NC}"
        exit 0
    fi
}

main "$@"
