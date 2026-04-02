const { Collection, Restaurant } = require('../models');

// GET /api/collections
const getCollections = async (req, res, next) => {
  try {
    const collections = await Collection.findAll({
      order: [['createdAt', 'DESC']],
    });
    res.json(collections);
  } catch (error) {
    next(error);
  }
};

// GET /api/collections/:id
const getCollectionById = async (req, res, next) => {
  try {
    const collection = await Collection.findByPk(req.params.id, {
      include: [{ model: Restaurant, as: 'restaurants' }],
    });

    if (!collection) {
      return res.status(404).json({ message: 'Collection not found' });
    }

    res.json(collection);
  } catch (error) {
    next(error);
  }
};

module.exports = { getCollections, getCollectionById };
