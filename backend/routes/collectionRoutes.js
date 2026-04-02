const express = require('express');
const { getCollections, getCollectionById } = require('../controllers/collectionController');

const router = express.Router();

router.get('/', getCollections);
router.get('/:id', getCollectionById);

module.exports = router;
