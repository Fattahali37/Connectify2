const request = require('supertest');
const express = require('express');
const userRoutes = require('../../routes/user');
const User = require('../../models/User');
const { isAuthenticated } = require('../../middlewares/auth');

// Mock the models and middleware
jest.mock('../../models/User');
jest.mock('../../middlewares/auth');

const app = express();
app.use(express.json());
app.use('/user', userRoutes);

describe('User Controller Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Mock authentication middleware to always pass
    isAuthenticated.mockImplementation((req, res, next) => {
      req.user = { _id: '123' };
      next();
    });
  });

  describe('GET /user/:username', () => {
    test('should get user by username', async () => {
      const mockUser = {
        _id: '123',
        username: 'testuser',
        name: 'Test User',
        email: 'test@example.com'
      };

      User.findOne = jest.fn().mockResolvedValue(mockUser);

      const response = await request(app)
        .get('/user/testuser');

      expect(response.status).toBe(200);
      expect(response.body.username).toBe('testuser');
    });

    test('should return error for non-existent user', async () => {
      User.findOne = jest.fn().mockResolvedValue(null);

      const response = await request(app)
        .get('/user/nonexistent');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('No user found');
    });
  });

  describe('GET /user/get/:id', () => {
    test('should get user by ID', async () => {
      const mockUser = {
        _id: '123',
        username: 'testuser',
        name: 'Test User'
      };

      User.findOne = jest.fn().mockResolvedValue(mockUser);

      const response = await request(app)
        .get('/user/get/123');

      expect(response.status).toBe(200);
      expect(response.body._id).toBe('123');
    });
  });

  describe('GET /user/handlefollow/:userId', () => {
    test('should follow a user', async () => {
      const mockUser = {
        _id: '123',
        followings: []
      };

      User.findOne = jest.fn().mockResolvedValue(mockUser);
      User.updateOne = jest.fn().mockResolvedValue({ modifiedCount: 1 });

      const response = await request(app)
        .get('/user/handlefollow/456');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(User.updateOne).toHaveBeenCalled();
    });

    test('should unfollow a user', async () => {
      const mockUser = {
        _id: '123',
        followings: ['456']
      };

      User.findOne = jest.fn().mockResolvedValue(mockUser);
      User.updateOne = jest.fn().mockResolvedValue({ modifiedCount: 1 });

      const response = await request(app)
        .get('/user/handlefollow/456');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });
  });

  describe('GET /user/followers/:userId', () => {
    test('should return followers list as array', async () => {
      const mockUser = {
        _id: '123',
        followers: ['user1', 'user2']
      };

      const mockFollower1 = { _id: 'user1', username: 'follower1' };
      const mockFollower2 = { _id: 'user2', username: 'follower2' };

      User.findOne = jest.fn()
        .mockResolvedValueOnce(mockUser)
        .mockResolvedValueOnce(mockFollower1)
        .mockResolvedValueOnce(mockFollower2);

      const response = await request(app)
        .get('/user/followers/123');

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });
  });

  describe('GET /user/followings/:userId', () => {
    test('should return followings list as array', async () => {
      const mockUser = {
        _id: '123',
        followings: ['user1', 'user2']
      };

      const mockFollowing1 = { _id: 'user1', username: 'following1' };
      const mockFollowing2 = { _id: 'user2', username: 'following2' };

      User.findOne = jest.fn()
        .mockResolvedValueOnce(mockUser)
        .mockResolvedValueOnce(mockFollowing1)
        .mockResolvedValueOnce(mockFollowing2);

      const response = await request(app)
        .get('/user/followings/123');

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });
  });

  describe('GET /user/view/notifications', () => {
    test('should return notifications array', async () => {
      const mockNotifications = [
        { _id: '1', content: 'liked your post', seen: false },
        { _id: '2', content: 'followed you', seen: true }
      ];

      const mockUser = {
        _id: '123',
        notifications: mockNotifications
      };

      User.findOne = jest.fn().mockResolvedValue(mockUser);

      const response = await request(app)
        .get('/user/view/notifications');

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });
  });

  describe('GET /user/suggestions', () => {
    test('should return user suggestions as array', async () => {
      const mockSuggestions = [
        { _id: '1', username: 'user1' },
        { _id: '2', username: 'user2' }
      ];

      User.find = jest.fn().mockReturnValue({
        limit: jest.fn().mockResolvedValue(mockSuggestions)
      });

      const response = await request(app)
        .get('/user/suggestions?limit=5');

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(2);
    });

    test('should handle empty suggestions', async () => {
      User.find = jest.fn().mockReturnValue({
        limit: jest.fn().mockResolvedValue([])
      });

      const response = await request(app)
        .get('/user/suggestions');

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(0);
    });
  });

  describe('GET /user/search/:text', () => {
    test('should search users and return array', async () => {
      const mockResults = [
        { _id: '456', username: 'testuser1' },
        { _id: '789', username: 'testuser2' }
      ];

      User.find = jest.fn().mockResolvedValue(mockResults);

      const response = await request(app)
        .get('/user/search/test');

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });

    test('should exclude current user from search results', async () => {
      const mockResults = [
        { _id: '123', username: 'currentuser' },
        { _id: '456', username: 'testuser' }
      ];

      User.find = jest.fn().mockResolvedValue(mockResults);

      const response = await request(app)
        .get('/user/search/user');

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });
  });

  describe('GET /user/allusers', () => {
    test('should return all users except current user as array', async () => {
      const mockUsers = [
        { _id: '456', username: 'user1' },
        { _id: '789', username: 'user2' }
      ];

      User.find = jest.fn().mockResolvedValue(mockUsers);

      const response = await request(app)
        .get('/user/allusers');

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });
  });
});
