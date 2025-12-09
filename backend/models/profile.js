const { DataTypes } = require('sequelize');
const  sequelize  = require('../sequelize');

const Profile = sequelize.define(
  'Profile',
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    firstName: DataTypes.STRING(100),
    lastName: DataTypes.STRING(100),
    username: {
      type: DataTypes.STRING(50),
      unique: true,
    },
    dob: DataTypes.DATEONLY,
    gender: {
      type: DataTypes.ENUM('male', 'female', 'other', 'prefer_not_to_say'),
    },
    bio: DataTypes.TEXT,
    avatarUri: DataTypes.TEXT,
  },
  {
    tableName: 'profiles',
  }
);

module.exports = Profile;
