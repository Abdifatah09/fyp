const bcrypt = require('bcrypt');
const crypto = require('crypto');
const { User, Profile, RefreshToken } = require('../models');
const {
  generateAccessToken,
  generateRefreshToken,
  refreshTokenExpiryDate
} = require('../utils/tokenUtils');

exports.register = async (req, res) => {
  console.log("Incoming body:", req.body);

  try {
    const { email, password, name, role } = req.body;

    if (!email || !password || !name)
      return res.status(400).json({ message: "Email, password and name required" });

    const exists = await User.findOne({ where: { email } });
    if (exists) return res.status(409).json({ message: "Email already exists" });

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await User.create({
      email,
      passwordHash,
      name,
      role: role || 'student',
    });

    const refreshTokenStr = generateRefreshToken();

    await RefreshToken.create({
      userId: user.id,
      token: refreshTokenStr,
      expiresAt: refreshTokenExpiryDate()
    });

    const accessToken = generateAccessToken(user);

    return res.status(201).json({
      message: "Registered successfully",
      user: { id: user.id, email: user.email, name: user.name, role: user.role },
      accessToken,
      refreshToken: refreshTokenStr,
    });

  } catch (err) {
    console.error("Register error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(401).json({ message: "Invalid credentials" });

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) return res.status(401).json({ message: "Invalid credentials" });

    const refreshTokenStr = generateRefreshToken();

    await RefreshToken.create({
      userId: user.id,
      token: refreshTokenStr,
      expiresAt: refreshTokenExpiryDate()
    });

    const accessToken = generateAccessToken(user);

    return res.json({
      message: "Login successful",
      user: { id: user.id, email: user.email, name: user.name, role: user.role },
      accessToken,
      refreshToken: refreshTokenStr,
    });

  } catch (err) {
    console.error("Login error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

exports.me = async (req, res) => {
  try {
    const { userId } = req.user;

    const user = await User.findByPk(userId, {
      attributes: ['id', 'email', 'name', 'role'],
      include: [{ model: Profile, as: 'profile' }],
    });

    if (!user) return res.status(404).json({ message: "User not found" });

    return res.json(user);

  } catch (err) {
    console.error("Me error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

exports.refresh = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({ message: 'refreshToken is required' });
    }

    const stored = await RefreshToken.findOne({ where: { token: refreshToken } });

    if (!stored) {
      return res.status(401).json({ message: 'Invalid refresh token' });
    }

    if (stored.revokedAt || new Date(stored.expiresAt) < new Date()) {
      return res.status(401).json({ message: 'Refresh token expired or revoked' });
    }

    const user = await User.findByPk(stored.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found for this token' });
    }

    const accessToken = generateAccessToken(user);

    return res.json({
      message: 'Token refreshed',
      accessToken,
    });
  } catch (err) {
    console.error('Refresh error:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

exports.logout = async (req, res) => {
  try {

    const userId = req.user.userId; 

    await RefreshToken.update(
      { revokedAt: new Date() },
      { where: { userId } }
    );

    return res.json({ message: 'Logged out successfully' });
  } catch (err) {
    console.error('Logout error:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const { userIdToDelete } = req.params;
    const { role, userId } = req.user;

    if (role !== 'admin') {
      return res.status(403).json({ message: 'Only admin can delete users' });
    }

    if (!userIdToDelete) {
      return res.status(400).json({ message: 'userId is required' });
    }

    if (userIdToDelete === userId) {
      return res.status(400).json({ message: 'Admin cannot delete themselves via this route' });
    }

    const user = await User.findByPk(userIdToDelete);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    await user.destroy(); 

    return res.json({ message: 'User deleted successfully' });
  } catch (err) {
    console.error('Delete user error:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) return res.status(400).json({ message: 'Email is required' });

    const genericMsg = { message: 'If the email exists, a reset token has been created.' };

    const user = await User.findOne({ where: { email } });
    if (!user) return res.json(genericMsg);

    const resetToken = crypto.randomBytes(32).toString('hex');
    const expires = new Date(Date.now() + 15 * 60 * 1000); 

    await user.update({
      passwordResetToken: resetToken,
      passwordResetTokenExpiresAt: expires,
    });

    return res.json({
      ...genericMsg,
      resetToken, 
      expiresAt: expires,
    });
  } catch (err) {
    console.error('forgotPassword error:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const { email, resetToken, newPassword } = req.body;

    if (!email || !resetToken || !newPassword) {
      return res.status(400).json({ message: 'email, resetToken and newPassword are required' });
    }

    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(400).json({ message: 'Invalid token or expired' });

    if (
      !user.passwordResetToken ||
      user.passwordResetToken !== resetToken ||
      !user.passwordResetTokenExpiresAt ||
      new Date(user.passwordResetTokenExpiresAt) < new Date()
    ) {
      return res.status(400).json({ message: 'Invalid token or expired' });
    }

    const passwordHash = await bcrypt.hash(newPassword, 10);

    await user.update({
      passwordHash, 
      passwordResetToken: null,
      passwordResetTokenExpiresAt: null,
    });

    if (RefreshToken) {
      await RefreshToken.update(
        { revokedAt: new Date() },
        { where: { userId: user.id, revokedAt: null } }
      );
    }

    return res.json({ message: 'Password reset successful. Please log in again.' });
  } catch (err) {
    console.error('resetPassword error:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};
