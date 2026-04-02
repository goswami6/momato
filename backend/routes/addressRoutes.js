const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const { getAddresses, addAddress, updateAddress, deleteAddress } = require('../controllers/addressController');

router.use(auth);
router.get('/', getAddresses);
router.post('/', addAddress);
router.put('/:id', updateAddress);
router.delete('/:id', deleteAddress);

module.exports = router;
