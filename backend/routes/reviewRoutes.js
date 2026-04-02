const express = require('express');
const { deleteReview } = require('../controllers/reviewController');
const { auth } = require('../middleware/auth');

const router = express.Router();

router.delete('/:id', auth, deleteReview);

module.exports = router;
