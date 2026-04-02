const express = require('express');
const { validateCoupon } = require('../controllers/offerController');
const { auth } = require('../middleware/auth');

const router = express.Router();

router.post('/validate', auth, validateCoupon);

module.exports = router;
