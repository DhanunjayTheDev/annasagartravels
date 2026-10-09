const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const AuthService = require('../src/services/auth.service');
const User = require('../src/models/User');

const MONGO_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/annasagar_test';

describe('AuthService', () => {
  beforeAll(async () => {
    await mongoose.connect(MONGO_URI);
  });

  afterAll(async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
  });

  beforeEach(async () => {
    await User.deleteMany({});
  });

  describe('register', () => {
    it('should register a new user', async () => {
      const result = await AuthService.register({
        name: 'Test User',
        email: 'test@example.com',
        phone: '9876543210',
        password: 'Test@12345',
      });

      expect(result.user).toBeDefined();
      expect(result.user.email).toBe('test@example.com');
      expect(result.user.role).toBe('customer');
      expect(result.accessToken).toBeDefined();
      expect(result.refreshToken).toBeDefined();
    });

    it('should hash the password', async () => {
      await AuthService.register({
        name: 'Test User',
        email: 'test@example.com',
        phone: '9876543210',
        password: 'Test@12345',
      });

      const user = await User.findOne({ email: 'test@example.com' }).select('+password');
      expect(user).toBeDefined();
      const isMatch = await bcrypt.compare('Test@12345', user.password);
      expect(isMatch).toBe(true);
    });

    it('should reject duplicate email', async () => {
      await AuthService.register({
        name: 'User 1',
        email: 'dup@example.com',
        phone: '9876543210',
        password: 'Test@12345',
      });

      await expect(
        AuthService.register({
          name: 'User 2',
          email: 'dup@example.com',
          phone: '9876543211',
          password: 'Test@12345',
        })
      ).rejects.toThrow();
    });
  });
});
