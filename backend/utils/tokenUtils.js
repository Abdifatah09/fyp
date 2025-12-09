const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret';
const ACCESS_EXPIRES_IN = '15m';
const REFRESH_EXPIRES_DAYS = 7;

function generateAccessToken(user) {
  return jwt.sign(
    { userId: user.id, role: user.role },
    JWT_SECRET,
    { expiresIn: ACCESS_EXPIRES_IN }
  );
}

function generateRefreshToken() {
  return require('crypto').randomBytes(40).toString('hex');
}

function refreshTokenExpiryDate() {
  const expires = new Date();
  expires.setDate(expires.getDate() + REFRESH_EXPIRES_DAYS);
  return expires;
}

module.exports = {
  JWT_SECRET,
  generateAccessToken,
  generateRefreshToken,
  refreshTokenExpiryDate,
};
