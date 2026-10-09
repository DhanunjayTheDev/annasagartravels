const jwt = require('jsonwebtoken');
const userRepository = require('../repositories/user.repository');
const sessionRepository = require('../repositories/session.repository');
const activityLogRepository = require('../repositories/activityLog.repository');
const { getRedis } = require('../config/redis');
const { UnauthorizedError, BadRequestError, ConflictError } = require('../utils/errors');

class AuthService {
  generateAccessToken(userId, role) {
    return jwt.sign(
      { userId, role },
      process.env.JWT_ACCESS_SECRET,
      { expiresIn: process.env.JWT_ACCESS_EXPIRY || '15m' }
    );
  }

  generateRefreshToken(userId) {
    return jwt.sign(
      { userId },
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: process.env.JWT_REFRESH_EXPIRY || '7d' }
    );
  }

  setTokenCookies(res, accessToken, refreshToken) {
    const isProduction = process.env.NODE_ENV === 'production';

    res.cookie('accessToken', accessToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? 'strict' : 'lax',
      maxAge: 15 * 60 * 1000, // 15 minutes
      path: '/',
    });

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? 'strict' : 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      path: '/api/v1/auth',
    });
  }

  clearTokenCookies(res) {
    res.clearCookie('accessToken', { path: '/' });
    res.clearCookie('refreshToken', { path: '/api/v1/auth' });
  }

  async register({ name, email, phone, password }) {
    const existingUser = await userRepository.findByEmail(email);
    if (existingUser) {
      throw new ConflictError('Email already registered');
    }

    const user = await userRepository.create({ name, email, phone, password });

    await activityLogRepository.create({
      userId: user._id,
      action: 'user.register',
      resourceType: 'user',
      resourceId: user._id.toString(),
      description: `User ${email} registered`,
    });

    const { password: _, ...userWithoutPassword } = user.toObject();
    return userWithoutPassword;
  }

  async login({ email, password }, { userAgent, ipAddress }) {
    const user = await userRepository.findByEmail(email);
    if (!user) {
      throw new UnauthorizedError('Invalid email or password');
    }

    if (!user.isActive) {
      throw new UnauthorizedError('Account has been deactivated');
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      throw new UnauthorizedError('Invalid email or password');
    }

    // Generate tokens
    const accessToken = this.generateAccessToken(user._id, user.role);
    const refreshToken = this.generateRefreshToken(user._id);

    // Create session
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    await sessionRepository.create({
      userId: user._id,
      refreshToken,
      userAgent,
      ipAddress,
      expiresAt,
    });

    // Update last login
    await userRepository.update(user._id, { lastLogin: new Date() });

    await activityLogRepository.create({
      userId: user._id,
      action: 'user.login',
      resourceType: 'session',
      description: `Login from ${ipAddress}`,
      ipAddress,
      userAgent,
    });

    const { password: _, ...userWithoutPassword } = user.toObject();
    return { user: userWithoutPassword, accessToken, refreshToken };
  }

  async logout(refreshToken, accessToken) {
    // Deactivate session
    await sessionRepository.deactivateByRefreshToken(refreshToken);

    // Blacklist access token
    if (accessToken) {
      const redis = getRedis();
      if (redis) {
        try {
          const decoded = jwt.decode(accessToken);
          if (decoded?.exp) {
            const ttl = decoded.exp - Math.floor(Date.now() / 1000);
            if (ttl > 0) {
              await redis.setex(`bl:${accessToken}`, ttl, '1');
            }
          }
        } catch {
          // Token decode failure is acceptable
        }
      }
    }
  }

  async refreshTokens(currentRefreshToken) {
    // Verify the refresh token
    let decoded;
    try {
      decoded = jwt.verify(currentRefreshToken, process.env.JWT_REFRESH_SECRET);
    } catch {
      throw new UnauthorizedError('Invalid refresh token');
    }

    // Find session
    const session = await sessionRepository.findByRefreshToken(currentRefreshToken);
    if (!session) {
      // Potential token reuse - invalidate all sessions for security
      await sessionRepository.deactivateAllForUser(decoded.userId);
      throw new UnauthorizedError('Session not found. All sessions invalidated for security.');
    }

    // Get user
    const user = await userRepository.findById(decoded.userId);
    if (!user || !user.isActive) {
      throw new UnauthorizedError('User not found or deactivated');
    }

    // Rotate tokens
    const newAccessToken = this.generateAccessToken(user._id, user.role);
    const newRefreshToken = this.generateRefreshToken(user._id);

    // Update session with new refresh token
    await sessionRepository.deactivate(session._id);
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    await sessionRepository.create({
      userId: user._id,
      refreshToken: newRefreshToken,
      userAgent: session.userAgent,
      ipAddress: session.ipAddress,
      expiresAt,
    });

    return { accessToken: newAccessToken, refreshToken: newRefreshToken, user };
  }

  async changePassword(userId, currentPassword, newPassword) {
    const user = await userRepository.findByIdWithPassword(userId);
    if (!user) {
      throw new BadRequestError('User not found');
    }

    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      throw new BadRequestError('Current password is incorrect');
    }

    user.password = newPassword;
    user.passwordChangedAt = new Date();
    await user.save();

    // Invalidate all sessions
    await sessionRepository.deactivateAllForUser(userId);

    await activityLogRepository.create({
      userId,
      action: 'user.password_change',
      resourceType: 'user',
      resourceId: userId.toString(),
      description: 'Password changed',
    });
  }

  async getActiveSessions(userId) {
    return sessionRepository.findActiveByUserId(userId);
  }

  async forceLogout(userId, sessionId) {
    return sessionRepository.deactivateById(sessionId);
  }

  async forceLogoutAll(userId) {
    return sessionRepository.deactivateAllForUser(userId);
  }
}

module.exports = new AuthService();
