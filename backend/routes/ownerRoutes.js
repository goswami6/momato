const express = require('express');
const { Restaurant, MenuItem, Review, Order } = require('../models');
const { auth, ownerOnly } = require('../middleware/auth');

const router = express.Router();

// All routes require auth + owner role
router.use(auth, ownerOnly);

// GET /api/owner/stats
router.get('/stats', async (req, res, next) => {
  try {
    const restaurants = await Restaurant.findAll({ where: { ownerId: req.user.id } });
    const restaurantIds = restaurants.map((r) => r.id);

    const menuCount = restaurantIds.length
      ? await MenuItem.count({ where: { restaurantId: restaurantIds } })
      : 0;

    const reviewCount = restaurantIds.length
      ? await Review.count({ where: { restaurantId: restaurantIds } })
      : 0;

    const avgRating =
      restaurants.length > 0
        ? (restaurants.reduce((a, r) => a + Number(r.rating || 0), 0) / restaurants.length).toFixed(1)
        : '0.0';

    res.json({
      restaurants: restaurants.length,
      menuItems: menuCount,
      reviews: reviewCount,
      avgRating,
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/owner/restaurants
router.get('/restaurants', async (req, res, next) => {
  try {
    const restaurants = await Restaurant.findAll({
      where: { ownerId: req.user.id },
      order: [['createdAt', 'DESC']],
    });
    res.json({ restaurants });
  } catch (err) {
    next(err);
  }
});

// GET /api/owner/orders
const { getOwnerOrders, updateOrderStatus } = require('../controllers/orderController');
router.get('/orders', getOwnerOrders);
router.put('/orders/:id/status', updateOrderStatus);

// Reservations
const { getOwnerReservations, updateReservationStatus } = require('../controllers/reservationController');
router.get('/reservations', getOwnerReservations);
router.put('/reservations/:id/status', updateReservationStatus);

// Offers
const { createOffer, updateOffer, deleteOffer } = require('../controllers/offerController');
const { Offer } = require('../models');
router.get('/offers', async (req, res, next) => {
  try {
    const restaurants = await Restaurant.findAll({ where: { ownerId: req.user.id }, attributes: ['id'] });
    const ids = restaurants.map(r => r.id);
    const offers = await Offer.findAll({ where: { restaurantId: ids }, order: [['createdAt', 'DESC']] });
    res.json(offers);
  } catch (err) { next(err); }
});
router.post('/offers', createOffer);
router.put('/offers/:id', updateOffer);
router.delete('/offers/:id', deleteOffer);

module.exports = router;
