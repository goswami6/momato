const { Review, Restaurant, User } = require('../models');
const { sequelize } = require('../config/db');

// GET /api/restaurants/:restaurantId/reviews
const getReviews = async (req, res, next) => {
  try {
    const reviews = await Review.findAll({
      where: { restaurantId: req.params.restaurantId },
      include: [{ model: User, as: 'user', attributes: ['id', 'name'] }],
      order: [['createdAt', 'DESC']],
    });
    res.json(reviews);
  } catch (error) {
    next(error);
  }
};

// POST /api/restaurants/:restaurantId/reviews  (multipart – photos optional)
const addReview = async (req, res, next) => {
  try {
    const { rating, comment } = req.body;

    const restaurant = await Restaurant.findByPk(req.params.restaurantId);
    if (!restaurant) {
      return res.status(404).json({ message: 'Restaurant not found' });
    }

    const existingReview = await Review.findOne({
      where: { userId: req.user.id, restaurantId: req.params.restaurantId },
    });
    if (existingReview) {
      return res.status(409).json({ message: 'You have already reviewed this restaurant' });
    }

    // Collect uploaded photo paths
    const photos = (req.files || []).map((f) => `/uploads/reviews/${f.filename}`);

    const review = await Review.create({
      rating,
      comment,
      photos,
      userId: req.user.id,
      restaurantId: req.params.restaurantId,
    });

    // Update restaurant rating
    const stats = await Review.findOne({
      where: { restaurantId: req.params.restaurantId },
      attributes: [
        [sequelize.fn('AVG', sequelize.col('rating')), 'avgRating'],
        [sequelize.fn('COUNT', sequelize.col('id')), 'count'],
      ],
      raw: true,
    });

    await restaurant.update({
      rating: parseFloat(stats.avgRating).toFixed(1),
      reviewCount: stats.count,
    });

    const fullReview = await Review.findByPk(review.id, {
      include: [{ model: User, as: 'user', attributes: ['id', 'name'] }],
    });

    res.status(201).json(fullReview);
  } catch (error) {
    next(error);
  }
};

// DELETE /api/reviews/:id
const deleteReview = async (req, res, next) => {
  try {
    const review = await Review.findByPk(req.params.id);

    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    if (review.userId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const restaurantId = review.restaurantId;
    await review.destroy();

    // Recalculate restaurant rating
    const stats = await Review.findOne({
      where: { restaurantId },
      attributes: [
        [sequelize.fn('AVG', sequelize.col('rating')), 'avgRating'],
        [sequelize.fn('COUNT', sequelize.col('id')), 'count'],
      ],
      raw: true,
    });

    await Restaurant.update(
      {
        rating: stats.avgRating ? parseFloat(stats.avgRating).toFixed(1) : 0,
        reviewCount: stats.count || 0,
      },
      { where: { id: restaurantId } }
    );

    res.json({ message: 'Review deleted' });
  } catch (error) {
    next(error);
  }
};

module.exports = { getReviews, addReview, deleteReview };
