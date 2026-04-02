const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Cart = sequelize.define('Cart', {
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
  restaurantId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: 'restaurants', key: 'id' },
  },
  menuItemId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: 'menu_items', key: 'id' },
  },
  quantity: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1,
  },
}, {
  timestamps: true,
  tableName: 'cart_items',
});

module.exports = Cart;
