const request = require('supertest');
const express = require('express');
const authRoutes = require('../../routes/auth');
const User = require('../../models/User');
const Token = require('../../models/AuthTokens');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// Mock the models and middleware
jest.mock('../../models/User');
jest.mock('../../models/AuthTokens');
jest.mock('../../models/DeletedUser');
jest.mock('../../middlewares/auth');

// Setup express app for testing
const app = express();
app.use(express.json());
app.use('/auth', authRoutes);

// Mock environment variables
process.env.JWT_Secret = 'test_secret';
process.env.JWT_Refresh_Secret = 'test_refresh_secret';
process.env.ADMIN_USERNAME = 'admin';
process.env.ADMIN_PASSWORD = 'admin123';

describe('Auth Controller Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /auth/register', () => {
    test('should register a new user successfully', async () => {
      const mockUser = {
        _id: '123',
        username: 'testuser',
        email: 'test@example.com',
        name: 'Test User',
        save: jest.fn().mockResolvedValue(this)
      };

      User.findOne = jest.fn().mockResolvedValue(null);
      User.prototype.save = jest.fn().mockResolvedValue(mockUser);
      Token.prototype.save = jest.fn().mockResolvedValue({});

      const response = await request(app)
        .post('/auth/register')
        .send({
          username: 'testuser',
          email: 'test@example.com',
          password: 'password123',
          name: 'Test User'
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body).toHaveProperty('access_token');
      expect(response.body).toHaveProperty('refresh_token');
    });

    test('should return error if user already exists', async () => {
      User.findOne = jest.fn().mockResolvedValue({ username: 'testuser' });

      const response = await request(app)
        .post('/auth/register')
        .send({
          username: 'testuser',
          email: 'test@example.com',
          password: 'password123'
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('already exist');
    });
  });

  describe('POST /auth/login', () => {
    test('should login user with correct credentials', async () => {
      const hashedPassword = await bcrypt.hash('password123', 10);
      const mockUser = {
        _id: '123',
        username: 'testuser',
        email: 'test@example.com',
        password: hashedPassword,
        status: 'active'
      };

      User.findOne = jest.fn().mockResolvedValue(mockUser);
      Token.prototype.save = jest.fn().mockResolvedValue({});

      const response = await request(app)
        .post('/auth/login')
        .send({
          text: 'testuser',
          password: 'password123'
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body).toHaveProperty('access_token');
      expect(response.body).toHaveProperty('user');
    });

    test('should return error for non-existent user', async () => {
      User.findOne = jest.fn().mockResolvedValue(null);

      const response = await request(app)
        .post('/auth/login')
        .send({
          text: 'nonexistent',
          password: 'password123'
        });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain("doesn't exist");
    });

    test('should return error for wrong password', async () => {
      const hashedPassword = await bcrypt.hash('correctpassword', 10);
      const mockUser = {
        _id: '123',
        username: 'testuser',
        password: hashedPassword,
        status: 'active'
      };

      User.findOne = jest.fn().mockResolvedValue(mockUser);

      const response = await request(app)
        .post('/auth/login')
        .send({
          text: 'testuser',
          password: 'wrongpassword'
        });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Wrong password');
    });

    test('should prevent login for blocked users', async () => {
      const hashedPassword = await bcrypt.hash('password123', 10);
      const mockUser = {
        _id: '123',
        username: 'testuser',
        password: hashedPassword,
        status: 'blocked'
      };

      User.findOne = jest.fn().mockResolvedValue(mockUser);

      const response = await request(app)
        .post('/auth/login')
        .send({
          text: 'testuser',
          password: 'password123'
        });

      expect(response.status).toBe(403);
      expect(response.body.success).toBe(false);
      expect(response.body.isBlocked).toBe(true);
      expect(response.body.message).toContain('blocked');
    });

    test('should login admin with admin credentials', async () => {
      User.findOne = jest.fn().mockResolvedValue(null);

      const response = await request(app)
        .post('/auth/login')
        .send({
          text: 'admin',
          password: 'admin123'
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.isAdmin).toBe(true);
      expect(response.body).toHaveProperty('access_token');
    });
  });

  describe('POST /auth/token', () => {
    test('should refresh access token with valid refresh token', async () => {
      const refreshToken = jwt.sign({ _id: '123' }, process.env.JWT_Refresh_Secret);
      Token.findOne = jest.fn().mockResolvedValue({ token: refreshToken });

      const response = await request(app)
        .post('/auth/token')
        .send({ token: refreshToken });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('access_token');
    });

    test('should return error for invalid refresh token', async () => {
      Token.findOne = jest.fn().mockResolvedValue(null);

      const response = await request(app)
        .post('/auth/token')
        .send({ token: 'invalid_token' });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Invalid');
    });

    test('should return error when no token provided', async () => {
      const response = await request(app)
        .post('/auth/token')
        .send({});

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('No Refresh Token');
    });
  });

  describe('POST /auth/logout', () => {
    test('should logout user successfully', async () => {
      const { isAuthenticated } = require('../../middlewares/auth');
      
      // Mock authentication middleware for this test
      isAuthenticated.mockImplementation((req, res, next) => {
        req.user = { _id: '123' };
        next();
      });

      Token.deleteOne = jest.fn().mockResolvedValue({ deletedCount: 1 });

      const token = jwt.sign({ _id: '123' }, process.env.JWT_Secret);
      
      const response = await request(app)
        .post('/auth/logout')
        .set('Authorization', `Bearer ${token}`)
        .send({ token: 'some_token' });

      expect(response.status).toBe(200);
      expect(Token.deleteOne).toHaveBeenCalledWith({ token: 'some_token' });
    });
  });
});
