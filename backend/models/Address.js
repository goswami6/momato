const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Address = sequelize.define('Address', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: 'users', key: 'id' },
  },
  label: {
    type: DataTypes.STRING(50),
    allowNull: false,
    defaultValue: 'Home',
    comment: 'Home, Work, Other',
  },
  address: {
    type: DataTypes.STRING(500),
    allowNull: false,
  },
  landmark: {
    type: DataTypes.STRING(200),
    allowNull: true,
  },
  isDefault: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
}, {
  timestamps: true,
  tableName: 'addresses',
});

module.exports = Address;
