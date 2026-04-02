const express = require('express');
const {
  getRestaurants, getRestaurantById, createRestaurant, updateRestaurant, deleteRestaurant, getNearbyRestaurants,
} = require('../controllers/restaurantController');
const { getMenuItems, addMenuItem } = require('../controllers/menuController');
const { getReviews, addReview } = require('../controllers/reviewController');
const { getPhotos, addPhoto } = require('../controllers/photoController');
const { createReservation } = require('../controllers/reservationController');
const { getOffers } = require('../controllers/offerController');
const { auth, ownerOnly } = require('../middleware/auth');
const { uploadReviewPhotos, uploadRestaurantImage, uploadMenuImage } = require('../middleware/upload');

const router = express.Router();

// Public
router.get('/', getRestaurants);
router.get('/nearby', getNearbyRestaurants);
router.get('/:id', getRestaurantById);

// Protected - owner
router.post('/', auth, ownerOnly, uploadRestaurantImage, createRestaurant);
router.put('/:id', auth, uploadRestaurantImage, updateRestaurant);
router.delete('/:id', auth, deleteRestaurant);

// Menu items (nested under restaurant)
router.get('/:restaurantId/menu', getMenuItems);
router.post('/:restaurantId/menu', auth, ownerOnly, uploadMenuImage, addMenuItem);

// Reviews (nested under restaurant) — multipart for photos
router.get('/:restaurantId/reviews', getReviews);
router.post('/:restaurantId/reviews', auth, uploadReviewPhotos, addReview);

// Photos (nested under restaurant)
router.get('/:restaurantId/photos', getPhotos);
router.post('/:restaurantId/photos', auth, uploadRestaurantImage, addPhoto);

// Reservations (nested under restaurant)
router.post('/:restaurantId/reservations', auth, createReservation);

// Offers (nested under restaurant)
router.get('/:restaurantId/offers', getOffers);

module.exports = router;
