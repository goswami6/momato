const express = require('express');
const { User, Restaurant, Review, Collection } = require('../models');
const { auth, adminOnly } = require('../middleware/auth');
const { Op } = require('sequelize');

const router = express.Router();

// All admin routes require auth + admin role
router.use(auth, adminOnly);

// GET /api/admin/stats
router.get('/stats', async (req, res, next) => {
  try {
    const [restaurants, users, reviews, collections, pending] = await Promise.all([
      Restaurant.count(),
      User.count(),
      Review.count(),
      Collection.count(),
      Restaurant.count({ where: { status: 'pending' } }),
    ]);

    // Average rating across all restaurants
    const ratingResult = await Restaurant.findOne({
      attributes: [[require('sequelize').fn('AVG', require('sequelize').col('rating')), 'avgRating']],
      raw: true,
    });

    res.json({
      restaurants,
      users,
      reviews,
      collections,
      pending,
      avgRating: ratingResult?.avgRating ? parseFloat(ratingResult.avgRating).toFixed(1) : '0.0',
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/admin/users
router.get('/users', async (req, res, next) => {
  try {
    const users = await User.findAll({
      attributes: { exclude: ['password'] },
      order: [['createdAt', 'DESC']],
    });
    res.json(users);
  } catch (error) {
    next(error);
  }
});

// DELETE /api/admin/users/:id
router.delete('/users/:id', async (req, res, next) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (user.role === 'admin') return res.status(403).json({ message: 'Cannot delete admin user' });
    await user.destroy();
    res.json({ message: 'User deleted' });
  } catch (error) {
    next(error);
  }
});

// GET /api/admin/reviews
router.get('/reviews', async (req, res, next) => {
  try {
    const reviews = await Review.findAll({
      include: [
        { model: User, as: 'user', attributes: ['id', 'name'] },
        { model: Restaurant, as: 'restaurant', attributes: ['id', 'name'] },
      ],
      order: [['createdAt', 'DESC']],
    });
    res.json(reviews);
  } catch (error) {
    next(error);
  }
});

// DELETE /api/admin/reviews/:id
router.delete('/reviews/:id', async (req, res, next) => {
  try {
    const review = await Review.findByPk(req.params.id);
    if (!review) return res.status(404).json({ message: 'Review not found' });
    await review.destroy();
    res.json({ message: 'Review deleted' });
  } catch (error) {
    next(error);
  }
});

// ─── Moderation: Restaurant approval ────────────────────────────────────────

// GET /api/admin/restaurants/pending
router.get('/restaurants/pending', async (req, res, next) => {
  try {
    const restaurants = await Restaurant.findAll({
      where: { status: 'pending' },
      include: [{ model: User, as: 'owner', attributes: ['id', 'name', 'email'] }],
      order: [['createdAt', 'DESC']],
    });
    res.json(restaurants);
  } catch (error) {
    next(error);
  }
});

// GET /api/admin/restaurants — all restaurants with status info
router.get('/restaurants', async (req, res, next) => {
  try {
    const { status } = req.query;
    const where = {};
    if (status) where.status = status;
    const restaurants = await Restaurant.findAll({
      where,
      include: [{ model: User, as: 'owner', attributes: ['id', 'name', 'email'] }],
      order: [['createdAt', 'DESC']],
    });
    res.json(restaurants);
  } catch (error) {
    next(error);
  }
});

// PUT /api/admin/restaurants/:id/approve
router.put('/restaurants/:id/approve', async (req, res, next) => {
  try {
    const restaurant = await Restaurant.findByPk(req.params.id);
    if (!restaurant) return res.status(404).json({ message: 'Restaurant not found' });
    await restaurant.update({ status: 'approved', rejectionReason: null });
    res.json({ message: 'Restaurant approved', restaurant });
  } catch (error) {
    next(error);
  }
});

// PUT /api/admin/restaurants/:id/reject
router.put('/restaurants/:id/reject', async (req, res, next) => {
  try {
    const restaurant = await Restaurant.findByPk(req.params.id);
    if (!restaurant) return res.status(404).json({ message: 'Restaurant not found' });
    const { reason } = req.body;
    await restaurant.update({ status: 'rejected', rejectionReason: reason || 'Does not meet listing standards' });
    res.json({ message: 'Restaurant rejected', restaurant });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
