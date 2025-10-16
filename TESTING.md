# Testing Documentation for Connectify2

## Overview

This document outlines the testing strategy, test coverage, and instructions for running tests in the Connectify2 project.

## Test Structure

### Frontend Tests (`/frontend/src/__tests__/`)
- **Component Tests**: Test individual React components
- **Integration Tests**: Test API interactions and data flow
- **Unit Tests**: Test utility functions and helpers

### Backend Tests (`/backend/__tests__/`)
- **Controller Tests**: Test API endpoints and business logic
- **Middleware Tests**: Test authentication and authorization
- **Integration Tests**: Test database operations

## Running Tests

### Quick Start

```bash
# Make the test script executable
chmod +x run-tests.sh

# Run all tests
./run-tests.sh all

# Run only frontend tests
./run-tests.sh frontend

# Run only backend tests
./run-tests.sh backend
```

### Individual Test Commands

#### Frontend Tests
```bash
cd frontend

# Run all tests
npm test

# Run tests with coverage
npm test -- --coverage

# Run tests in watch mode
npm test -- --watch

# Run specific test file
npm test -- Home.test.js
```

#### Backend Tests
```bash
cd backend

# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run with coverage
npm test -- --coverage
```

## Test Coverage

### Frontend Components Tested

1. **Home Component** (`Home.test.js`)
   - Renders without crashing
   - Displays loading spinner
   - Shows "No posts" message when empty
   - Renders posts from API
   - Handles API errors gracefully
   - Handles non-array responses

2. **NotificationBox Component** (`NotificationBox.test.js`)
   - Renders without crashing
   - Displays loading state
   - Shows empty state message
   - Renders notifications list
   - Handles API errors
   - Validates array responses

3. **StoryContainer Component** (`StoryContainer.test.js`)
   - Renders with empty array
   - Renders stories list
   - Handles undefined props
   - Handles non-array props

4. **Integration Tests** (`api.test.js`)
   - Array response validation
   - Error handling (400, 401, 403)
   - Data transformation
   - Null/undefined handling

### Backend Controllers Tested

1. **Auth Controller** (`auth.test.js`)
   - User registration
   - User login (normal & admin)
   - Token refresh
   - Logout
   - Blocked user prevention
   - Error cases

2. **User Controller** (`user.test.js`)
   - Get user by username/ID
   - Follow/unfollow users
   - Get followers/followings (returns arrays)
   - View notifications (returns array)
   - User suggestions (returns array)
   - Search users (returns array)
   - Get all users (returns array)

3. **Story Controller** (`story.test.js`)
   - Get home stories (returns array)
   - Get story by ID
   - Get user stories (returns array)
   - Create new story
   - Mark story as seen

## Key Fixes Implemented

### 1. Array Validation
All API responses that should return arrays now have validation:

```javascript
// Before (WRONG)
api.get(url).then((res) => {
  setState(res.data)
})

// After (CORRECT)
api.get(url).then((res) => {
  setState(Array.isArray(res.data) ? res.data : [])
}).catch((err) => {
  console.log(err)
  setState([])
})
```

### 2. Safe Mapping
All `.map()` calls are now protected:

```javascript
// Before (WRONG)
data.map(item => <Component {...item} />)

// After (CORRECT)
Array.isArray(data) && data.map(item => <Component {...item} />)
```

### 3. Error Handling
All API calls now have proper error handling:
- Network errors
- 400 Bad Request
- 401 Unauthorized
- 403 Forbidden (blocked users)
- 404 Not Found

## Test Scenarios Covered

### ✅ Happy Path Tests
- User can register and login
- User can view posts, stories, notifications
- User can follow/unfollow others
- User can create content

### ✅ Error Handling Tests
- API returns non-array data
- API returns error objects
- Network failures
- Authentication failures
- Blocked user scenarios

### ✅ Edge Cases
- Empty arrays
- Null/undefined values
- Invalid data types
- Missing required fields

## Known Issues and Resolutions

### Issue 1: `.map() is not a function`
**Resolution**: Added `Array.isArray()` checks before all map operations

**Files Fixed**:
- `Home.jsx`
- `NotificationBox.jsx`
- `StoryContainer.jsx`
- `Followers.jsx`
- `Chat.jsx`
- `Right.jsx`
- `Select.jsx`

### Issue 2: Socket.io Connection Errors
**Resolution**: 
- Fixed socket initialization with proper options
- Removed invalid `socket.on("connection")` call
- Added proper event handlers with cleanup

**Files Fixed**:
- `App.js`

### Issue 3: Story API Returns 400 Error
**Resolution**: 
- Added user authentication validation
- Added proper error handling
- Changed Promise.all pattern to await

**Files Fixed**:
- `backend/controllers/story.js`

## CI/CD Integration

### GitHub Actions (Recommended)

Create `.github/workflows/test.yml`:

```yaml
name: Run Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v2
    - uses: actions/setup-node@v2
      with:
        node-version: '18'
    
    - name: Install dependencies
      run: |
        cd frontend && npm install
        cd ../backend && npm install
    
    - name: Run tests
      run: ./run-tests.sh all
```

## Best Practices

1. **Always validate arrays before mapping**
2. **Add error handling to all API calls**
3. **Test both success and error scenarios**
4. **Mock external dependencies in tests**
5. **Keep tests isolated and independent**
6. **Use descriptive test names**
7. **Maintain high test coverage (>80%)**

## Continuous Improvement

### Next Steps
1. Add end-to-end tests with Cypress
2. Add performance tests
3. Add accessibility tests
4. Increase code coverage to 90%+
5. Add visual regression tests

## Support

For issues or questions about testing:
1. Check this documentation
2. Review test files for examples
3. Check console output for detailed error messages

## Conclusion

All critical functionality has been tested and validated. The application now handles errors gracefully and provides a stable user experience even when APIs fail.

**Test Status**: ✅ All Core Features Tested
