const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Reservation = sequelize.define('Reservation', {
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
  date: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
  time: {
    type: DataTypes.STRING(10),
    allowNull: false,
  },
  partySize: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: { min: 1, max: 20 },
  },
  status: {
    type: DataTypes.ENUM('pending', 'confirmed', 'cancelled', 'completed', 'no-show'),
    defaultValue: 'pending',
  },
  specialRequests: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  guestName: {
    type: DataTypes.STRING(100),
    allowNull: true,
  },
  guestPhone: {
    type: DataTypes.STRING(15),
    allowNull: true,
  },
}, {
  timestamps: true,
  tableName: 'reservations',
});

module.exports = Reservation;
