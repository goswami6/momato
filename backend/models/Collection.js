const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Collection = sequelize.define('Collection', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  title: {
    type: DataTypes.STRING(200),
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  image: {
    type: DataTypes.STRING(500),
    allowNull: true,
  },
  tag: {
    type: DataTypes.STRING(100),
    allowNull: true,
  },
  placeCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
}, {
  timestamps: true,
  tableName: 'collections',
});

module.exports = Collection;
