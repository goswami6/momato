const { Photo, Restaurant } = require('../models');

// GET /api/restaurants/:restaurantId/photos
const getPhotos = async (req, res, next) => {
  try {
    const where = { restaurantId: req.params.restaurantId };
    if (req.query.type) where.type = req.query.type;

    const photos = await Photo.findAll({
      where,
      order: [['createdAt', 'DESC']],
    });
    res.json(photos);
  } catch (error) {
    next(error);
  }
};

// POST /api/restaurants/:restaurantId/photos
const addPhoto = async (req, res, next) => {
  try {
    const restaurant = await Restaurant.findByPk(req.params.restaurantId);
    if (!restaurant) return res.status(404).json({ message: 'Restaurant not found' });

    if (!req.file) return res.status(400).json({ message: 'Image file required' });

    const photo = await Photo.create({
      url: `/uploads/restaurants/${req.file.filename}`,
      caption: req.body.caption || null,
      type: req.body.type || 'food',
      restaurantId: req.params.restaurantId,
      uploadedBy: req.user.id,
    });

    res.status(201).json(photo);
  } catch (error) {
    next(error);
  }
};

// DELETE /api/photos/:id
const deletePhoto = async (req, res, next) => {
  try {
    const photo = await Photo.findByPk(req.params.id);
    if (!photo) return res.status(404).json({ message: 'Photo not found' });

    const restaurant = await Restaurant.findByPk(photo.restaurantId);
    if (restaurant.ownerId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    await photo.destroy();
    res.json({ message: 'Photo deleted' });
  } catch (error) {
    next(error);
  }
};

module.exports = { getPhotos, addPhoto, deletePhoto };
