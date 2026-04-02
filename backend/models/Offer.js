const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Offer = sequelize.define('Offer', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  restaurantId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: 'restaurants', key: 'id' },
  },
  code: {
    type: DataTypes.STRING(30),
    allowNull: false,
  },
  title: {
    type: DataTypes.STRING(200),
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  discountType: {
    type: DataTypes.ENUM('percentage', 'flat'),
    defaultValue: 'percentage',
  },
  discountValue: {
    type: DataTypes.FLOAT,
    allowNull: false,
  },
  minOrderValue: {
    type: DataTypes.FLOAT,
    defaultValue: 0,
  },
  maxDiscount: {
    type: DataTypes.FLOAT,
    allowNull: true,
  },
  validFrom: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  validTo: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
  usageLimit: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  usageCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
}, {
  timestamps: true,
  tableName: 'offers',
});

module.exports = Offer;
