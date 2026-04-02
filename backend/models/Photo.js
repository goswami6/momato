const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Photo = sequelize.define('Photo', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  url: {
    type: DataTypes.STRING(500),
    allowNull: false,
  },
  caption: {
    type: DataTypes.STRING(300),
    allowNull: true,
  },
  type: {
    type: DataTypes.ENUM('food', 'ambiance', 'menu', 'exterior'),
    defaultValue: 'food',
  },
  restaurantId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: 'restaurants', key: 'id' },
  },
  uploadedBy: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: { model: 'users', key: 'id' },
  },
}, {
  timestamps: true,
  tableName: 'photos',
});

module.exports = Photo;
