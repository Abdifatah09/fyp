const bcrypt = require('bcrypt');
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

    await Profile.create({
      userId: user.id,
      firstName: name,
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
