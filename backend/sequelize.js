// backend/sequelize.js
const { Sequelize } = require('sequelize');
const allConfig = require('./config/config');

const env = process.env.NODE_ENV || 'development';
const cfg = allConfig[env];

const sequelize = cfg.use_env_variable
  ? new Sequelize(process.env[cfg.use_env_variable], cfg)
  : new Sequelize(cfg.database, cfg.username, cfg.password, {
      host: cfg.host,
      port: cfg.port,
      dialect: cfg.dialect,
      logging: cfg.logging ?? false,
    });

module.exports = sequelize;
