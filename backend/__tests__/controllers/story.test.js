const request = require('supertest');
const express = require('express');
const storyRoutes = require('../../routes/story');
const Story = require('../../models/Story');
const User = require('../../models/User');
const { isAuthenticated } = require('../../middlewares/auth');

jest.mock('../../models/Story');
jest.mock('../../models/User');
jest.mock('../../middlewares/auth');

const app = express();
app.use(express.json());
app.use('/story', storyRoutes);

describe('Story Controller Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    isAuthenticated.mockImplementation((req, res, next) => {
      req.user = { _id: '123' };
      next();
    });
  });

  describe('GET /story/home', () => {
    test('should return stories array for authenticated user', async () => {
      const mockUser = {
        _id: '123',
        followings: ['user1', 'user2']
      };

      const mockStories = [
        [{ id: '1', owner: 'user1', data: 'story1.jpg' }],
        [{ id: '2', owner: 'user2', data: 'story2.jpg' }]
      ];

      User.findOne = jest.fn().mockResolvedValue(mockUser);
      Story.find = jest.fn()
        .mockResolvedValueOnce([{ id: '1', owner: 'user1', data: 'story1.jpg' }])
        .mockResolvedValueOnce([{ id: '2', owner: 'user2', data: 'story2.jpg' }]);

      const response = await request(app)
        .get('/story/home');

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });

    test('should return empty array when user has no followings', async () => {
      const mockUser = {
        _id: '123',
        followings: []
      };

      User.findOne = jest.fn().mockResolvedValue(mockUser);

      const response = await request(app)
        .get('/story/home');

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(0);
    });

    test('should return 401 when user not authenticated', async () => {
      isAuthenticated.mockImplementation((req, res, next) => {
        req.user = null;
        next();
      });

      User.findOne = jest.fn().mockResolvedValue(null);

      const response = await request(app)
        .get('/story/home');

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });

    test('should return 404 when user not found', async () => {
      User.findOne = jest.fn().mockResolvedValue(null);

      const response = await request(app)
        .get('/story/home');

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('not found');
    });
  });

  describe('GET /story/:id', () => {
    test('should return story by ID', async () => {
      const mockStory = {
        id: '1',
        owner: 'user1',
        data: 'story.jpg',
        createdAt: new Date()
      };

      Story.findOne = jest.fn().mockResolvedValue(mockStory);

      const response = await request(app)
        .get('/story/1');

      expect(response.status).toBe(200);
      expect(response.body.id).toBe('1');
    });

    test('should return null for expired story', async () => {
      Story.findOne = jest.fn().mockResolvedValue(null);

      const response = await request(app)
        .get('/story/expired');

      expect(response.status).toBe(200);
    });
  });

  describe('GET /story/user/:uid', () => {
    test('should return user stories as array', async () => {
      const mockStories = [
        { id: '1', owner: 'user1', data: 'story1.jpg' },
        { id: '2', owner: 'user1', data: 'story2.jpg' }
      ];

      Story.find = jest.fn().mockResolvedValue(mockStories);

      const response = await request(app)
        .get('/story/user/user1');

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(2);
    });

    test('should return empty array when user has no stories', async () => {
      Story.find = jest.fn().mockResolvedValue([]);

      const response = await request(app)
        .get('/story/user/user1');

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(0);
    });
  });

  describe('POST /story', () => {
    test('should create new story', async () => {
      const mockStory = {
        id: '1',
        owner: '123',
        data: 'story.jpg',
        seen: [],
        save: jest.fn().mockResolvedValue(this)
      };

      Story.prototype.save = jest.fn().mockResolvedValue(mockStory);

      const response = await request(app)
        .post('/story')
        .send({ data: 'story.jpg' });

      expect(response.status).toBe(200);
      expect(response.body.data).toBe('story.jpg');
    });
  });

  describe('PUT /story/seen/:id', () => {
    test('should add user to seen list', async () => {
      const mockStory = {
        id: '1',
        owner: 'user1',
        seen: []
      };

      Story.findOne = jest.fn().mockResolvedValue(mockStory);
      Story.updateOne = jest.fn().mockResolvedValue({ modifiedCount: 1 });

      const response = await request(app)
        .put('/story/seen/1');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });
  });
});
