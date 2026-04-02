const { Reservation, Restaurant, User } = require('../models');
const { Op } = require('sequelize');

// POST /api/restaurants/:restaurantId/reservations
const createReservation = async (req, res, next) => {
  try {
    const restaurant = await Restaurant.findByPk(req.params.restaurantId);
    if (!restaurant) return res.status(404).json({ message: 'Restaurant not found' });
    if (!restaurant.hasDineIn) return res.status(400).json({ message: 'Restaurant does not support dine-in' });

    const { date, time, partySize, specialRequests, guestName, guestPhone } = req.body;
    if (!date || !time || !partySize) {
      return res.status(400).json({ message: 'date, time, and partySize are required' });
    }

    const reservation = await Reservation.create({
      userId: req.user.id,
      restaurantId: req.params.restaurantId,
      date,
      time,
      partySize: parseInt(partySize),
      specialRequests: specialRequests || null,
      guestName: guestName || req.user.name,
      guestPhone: guestPhone || null,
    });

    res.status(201).json(reservation);
  } catch (error) {
    next(error);
  }
};

// GET /api/reservations  (user's own)
const getMyReservations = async (req, res, next) => {
  try {
    const reservations = await Reservation.findAll({
      where: { userId: req.user.id },
      include: [{ model: Restaurant, as: 'restaurant', attributes: ['id', 'name', 'image', 'address', 'area', 'city', 'phone'] }],
      order: [['date', 'DESC'], ['time', 'DESC']],
    });
    res.json(reservations);
  } catch (error) {
    next(error);
  }
};

// GET /api/owner/reservations
const getOwnerReservations = async (req, res, next) => {
  try {
    const restaurants = await Restaurant.findAll({ where: { ownerId: req.user.id }, attributes: ['id'] });
    const ids = restaurants.map(r => r.id);

    const where = { restaurantId: ids };
    if (req.query.status) where.status = req.query.status;
    if (req.query.date) where.date = req.query.date;

    const reservations = await Reservation.findAll({
      where,
      include: [
        { model: User, as: 'user', attributes: ['id', 'name', 'email', 'phone'] },
        { model: Restaurant, as: 'restaurant', attributes: ['id', 'name'] },
      ],
      order: [['date', 'ASC'], ['time', 'ASC']],
    });
    res.json(reservations);
  } catch (error) {
    next(error);
  }
};

// PUT /api/reservations/:id/status
const updateReservationStatus = async (req, res, next) => {
  try {
    const reservation = await Reservation.findByPk(req.params.id, {
      include: [{ model: Restaurant, as: 'restaurant' }],
    });
    if (!reservation) return res.status(404).json({ message: 'Reservation not found' });

    // User can cancel their own; owner can confirm/cancel/complete/no-show
    const isOwner = reservation.restaurant.ownerId === req.user.id;
    const isUser = reservation.userId === req.user.id;

    if (!isOwner && !isUser && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    if (isUser && !isOwner && req.body.status !== 'cancelled') {
      return res.status(400).json({ message: 'You can only cancel your reservation' });
    }

    await reservation.update({ status: req.body.status });
    res.json(reservation);
  } catch (error) {
    next(error);
  }
};

module.exports = { createReservation, getMyReservations, getOwnerReservations, updateReservationStatus };
