const express = require('express');
const { createReservation, getMyReservations, updateReservationStatus } = require('../controllers/reservationController');
const { auth } = require('../middleware/auth');

const router = express.Router();

router.get('/', auth, getMyReservations);
router.put('/:id/status', auth, updateReservationStatus);

module.exports = router;
