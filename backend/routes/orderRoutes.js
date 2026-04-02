const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const {
  placeOrder, getMyOrders, getOrderById, cancelOrder, reorderFromOrder,
} = require('../controllers/orderController');

router.use(auth);

router.post('/', placeOrder);
router.get('/', getMyOrders);
router.get('/:id', getOrderById);
router.put('/:id/cancel', cancelOrder);
router.post('/:id/reorder', reorderFromOrder);

module.exports = router;
