const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const ActivityLog = sequelize.define('ActivityLog', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  user_id: {
    type: DataTypes.INTEGER,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  action: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  module: {
    type: DataTypes.STRING(50),
    allowNull: false
  },
  reference_id: {
    type: DataTypes.INTEGER
  },
  description: {
    type: DataTypes.TEXT
  },
  ip_address: {
    type: DataTypes.STRING(50)
  }
}, {
  tableName: 'activity_logs',
  timestamps: true,
  updatedAt: false
});

module.exports = ActivityLog;
