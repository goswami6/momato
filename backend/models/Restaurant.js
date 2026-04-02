const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Restaurant = sequelize.define('Restaurant', {
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
  cuisine: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  address: {
    type: DataTypes.STRING(500),
    allowNull: false,
  },
  city: {
    type: DataTypes.STRING(100),
    defaultValue: 'Varanasi',
  },
  area: {
    type: DataTypes.STRING(200),
    allowNull: true,
  },
  phone: {
    type: DataTypes.STRING(15),
    allowNull: true,
  },
  image: {
    type: DataTypes.STRING(500),
    allowNull: true,
  },
  rating: {
    type: DataTypes.FLOAT,
    defaultValue: 0,
    validate: { min: 0, max: 5 },
  },
  reviewCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  priceRange: {
    type: DataTypes.ENUM('low', 'medium', 'high', 'premium'),
    defaultValue: 'medium',
  },
  costForTwo: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  isVeg: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  hasAlcohol: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  petFriendly: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  hasOutdoorSeating: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  openingTime: {
    type: DataTypes.STRING(10),
    allowNull: true,
  },
  closingTime: {
    type: DataTypes.STRING(10),
    allowNull: true,
  },
  isOpen: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
  deliveryTime: {
    type: DataTypes.STRING(50),
    allowNull: true,
  },
  hasDelivery: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
  hasDineIn: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
  hasNightlife: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  ownerId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: { model: 'users', key: 'id' },
  },
  status: {
    type: DataTypes.ENUM('pending', 'approved', 'rejected'),
    defaultValue: 'approved',
  },
  rejectionReason: {
    type: DataTypes.STRING(500),
    allowNull: true,
  },
  latitude: {
    type: DataTypes.DOUBLE,
    allowNull: true,
  },
  longitude: {
    type: DataTypes.DOUBLE,
    allowNull: true,
  },
  deliveryRadius: {
    type: DataTypes.FLOAT,
    defaultValue: 5,
    comment: 'Delivery radius in kilometers',
  },
}, {
  timestamps: true,
  tableName: 'restaurants',
});

module.exports = Restaurant;
