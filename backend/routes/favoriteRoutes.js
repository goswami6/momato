const express = require('express');
const { Favorite, Restaurant } = require('../models');
const { auth } = require('../middleware/auth');

const router = express.Router();

router.use(auth);

// GET /api/favorites
router.get('/', async (req, res, next) => {
  try {
    const favorites = await Favorite.findAll({
      where: { userId: req.user.id },
      include: [{ model: Restaurant, as: 'restaurant' }],
      order: [['createdAt', 'DESC']],
    });

    res.json({ favorites });
  } catch (error) {
    next(error);
  }
});

// POST /api/favorites/:restaurantId
router.post('/:restaurantId', async (req, res, next) => {
  try {
    const { restaurantId } = req.params;

    const restaurant = await Restaurant.findByPk(restaurantId);
    if (!restaurant) {
      return res.status(404).json({ message: 'Restaurant not found' });
    }

    const [favorite] = await Favorite.findOrCreate({
      where: { userId: req.user.id, restaurantId },
      defaults: { userId: req.user.id, restaurantId },
    });

    res.status(201).json({ message: 'Restaurant saved', favorite });
  } catch (error) {
    next(error);
  }
});

// DELETE /api/favorites/:restaurantId
router.delete('/:restaurantId', async (req, res, next) => {
  try {
    const { restaurantId } = req.params;

    const deleted = await Favorite.destroy({
      where: { userId: req.user.id, restaurantId },
    });

    if (!deleted) {
      return res.status(404).json({ message: 'Favorite not found' });
    }

    res.json({ message: 'Removed from saved restaurants' });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
