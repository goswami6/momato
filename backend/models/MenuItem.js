const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const MenuItem = sequelize.define('MenuItem', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  name: {
    type: DataTypes.STRING(200),
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  price: {
    type: DataTypes.FLOAT,
    allowNull: false,
  },
  category: {
    type: DataTypes.STRING(100),
    allowNull: true,
  },
  image: {
    type: DataTypes.STRING(500),
    allowNull: true,
  },
  isVeg: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
  isAvailable: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
  isBestseller: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  isNew: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  spiceLevel: {
    type: DataTypes.ENUM('mild', 'medium', 'hot'),
    allowNull: true,
  },
  restaurantId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: 'restaurants', key: 'id' },
  },
}, {
  timestamps: true,
  tableName: 'menu_items',
});

module.exports = MenuItem;
