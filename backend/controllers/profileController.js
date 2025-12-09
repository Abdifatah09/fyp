const { Profile, User } = require('../models');

exports.createProfile = async (req, res) => {
  try {
    const userId = req.user.userId;
    const data = req.body;

    const existing = await Profile.findOne({ where: { userId } });
    if (existing) {
      return res.status(400).json({ message: 'Profile already exists for this user' });
    }

    const profile = await Profile.create({ ...data, userId });

    return res.status(201).json({
      message: 'Profile created successfully',
      profile,
    });
  } catch (err) {
    console.error('Create profile error:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

exports.getProfileByUserId = async (req, res) => {
  try {
    const { userId } = req.params;

    const profile = await Profile.findOne({
      where: { userId },
      include: [{ model: User, as: 'user', attributes: ['email', 'name', 'role'] }],
    });

    if (!profile) return res.status(404).json({ message: 'Profile not found' });

    return res.json(profile);
  } catch (err) {
    console.error('Get profile by userId error:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

exports.updateProfilePut = async (req, res) => {
  try {
    const { userId } = req.params;
    const body = req.body;

    const profile = await Profile.findOne({ where: { userId } });
    if (!profile) return res.status(404).json({ message: 'Profile not found' });

    await profile.update(body);

    return res.json({
      message: 'Profile updated successfully',
      profile,
    });
  } catch (err) {
    console.error('PUT profile error:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

exports.getMyProfile = async (req, res) => {
  try {
    const userId = req.user.userId;

    const profile = await Profile.findOne({
      where: { userId },
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'email', 'name', 'role'],
        },
      ],
    });

    if (!profile) return res.status(404).json({ message: 'Profile not found' });

    return res.json(profile);
  } catch (err) {
    console.error('Get my profile error:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};
