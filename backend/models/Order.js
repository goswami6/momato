const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Order = sequelize.define('Order', {
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
  items: {
    type: DataTypes.JSON,
    allowNull: false,
    comment: '[{ menuItemId, name, price, quantity, image }]',
  },
  totalAmount: {
    type: DataTypes.FLOAT,
    allowNull: false,
  },
  status: {
    type: DataTypes.ENUM('placed', 'confirmed', 'preparing', 'out_for_delivery', 'delivered', 'cancelled'),
    defaultValue: 'placed',
  },
  deliveryAddress: {
    type: DataTypes.STRING(500),
    allowNull: false,
  },
  paymentMethod: {
    type: DataTypes.ENUM('cod', 'card', 'upi'),
    defaultValue: 'cod',
  },
  paymentStatus: {
    type: DataTypes.ENUM('pending', 'paid', 'failed'),
    defaultValue: 'pending',
  },
  note: {
    type: DataTypes.STRING(500),
    allowNull: true,
  },
  tip: {
    type: DataTypes.FLOAT,
    defaultValue: 0,
  },
  deliveryInstructions: {
    type: DataTypes.STRING(500),
    allowNull: true,
    comment: 'e.g. Contactless delivery, Leave at door',
  },
  couponCode: {
    type: DataTypes.STRING(50),
    allowNull: true,
  },
  couponDiscount: {
    type: DataTypes.FLOAT,
    defaultValue: 0,
  },
}, {
  timestamps: true,
  tableName: 'orders',
});

module.exports = Order;
