const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const {
  getCart, addToCart, updateCartItem, removeFromCart, clearCart,
} = require('../controllers/orderController');

// All cart routes require auth
router.use(auth);

router.get('/', getCart);
router.post('/', addToCart);
router.put('/:id', updateCartItem);
router.delete('/clear', clearCart);
router.delete('/:id', removeFromCart);

module.exports = router;
