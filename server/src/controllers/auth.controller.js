const authService = require('../services/auth.service');
const { asyncHandler } = require('../utils/helpers');

const register = asyncHandler(async (req, res) => {
  const user = await authService.register(req.body);
  res.created(user, 'Registration successful');
});

const login = asyncHandler(async (req, res) => {
  const { user, accessToken, refreshToken } = await authService.login(req.body, {
    userAgent: req.headers['user-agent'],
    ipAddress: req.ip,
  });

  authService.setTokenCookies(res, accessToken, refreshToken);

  res.success({ user, accessToken }, 'Login successful');
});

const logout = asyncHandler(async (req, res) => {
  const refreshToken = req.cookies?.refreshToken;
  const accessToken = req.cookies?.accessToken || req.token;

  await authService.logout(refreshToken, accessToken);
  authService.clearTokenCookies(res);

  res.success(null, 'Logged out successfully');
});

const refreshToken = asyncHandler(async (req, res) => {
  const currentRefreshToken = req.cookies?.refreshToken || req.body.refreshToken;

  if (!currentRefreshToken) {
    return res.status(401).json({
      success: false,
      message: 'Refresh token required',
    });
  }

  const { accessToken, refreshToken: newRefreshToken, user } =
    await authService.refreshTokens(currentRefreshToken);

  authService.setTokenCookies(res, accessToken, newRefreshToken);

  res.success({ accessToken, user }, 'Token refreshed');
});

const getProfile = asyncHandler(async (req, res) => {
  res.success(req.user, 'Profile retrieved');
});

const changePassword = asyncHandler(async (req, res) => {
  await authService.changePassword(
    req.user._id,
    req.body.currentPassword,
    req.body.newPassword
  );

  authService.clearTokenCookies(res);
  res.success(null, 'Password changed. Please login again.');
});

const getSessions = asyncHandler(async (req, res) => {
  const sessions = await authService.getActiveSessions(req.user._id);
  res.success(sessions, 'Active sessions retrieved');
});

const forceLogoutSession = asyncHandler(async (req, res) => {
  await authService.forceLogout(req.user._id, req.params.sessionId);
  res.success(null, 'Session terminated');
});

const forceLogoutAll = asyncHandler(async (req, res) => {
  await authService.forceLogoutAll(req.user._id);
  authService.clearTokenCookies(res);
  res.success(null, 'All sessions terminated');
});

module.exports = {
  register,
  login,
  logout,
  refreshToken,
  getProfile,
  changePassword,
  getSessions,
  forceLogoutSession,
  forceLogoutAll,
};
