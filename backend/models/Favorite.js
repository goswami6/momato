const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Favorite = sequelize.define('Favorite', {
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
}, {
  timestamps: true,
  tableName: 'favorites',
  indexes: [
    {
      unique: true,
      fields: ['userId', 'restaurantId'],
    },
  ],
});

module.exports = Favorite;
