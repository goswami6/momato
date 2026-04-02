const express = require('express');
const { updateMenuItem, deleteMenuItem } = require('../controllers/menuController');
const { auth } = require('../middleware/auth');
const { uploadMenuImage } = require('../middleware/upload');

const router = express.Router();

router.put('/:id', auth, uploadMenuImage, updateMenuItem);
router.delete('/:id', auth, deleteMenuItem);

module.exports = router;
