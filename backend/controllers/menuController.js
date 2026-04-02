const { MenuItem, Restaurant } = require('../models');

// GET /api/restaurants/:restaurantId/menu
const getMenuItems = async (req, res, next) => {
  try {
    const items = await MenuItem.findAll({
      where: { restaurantId: req.params.restaurantId },
      order: [['category', 'ASC'], ['name', 'ASC']],
    });
    res.json(items);
  } catch (error) {
    next(error);
  }
};

// POST /api/restaurants/:restaurantId/menu
const addMenuItem = async (req, res, next) => {
  try {
    const restaurant = await Restaurant.findByPk(req.params.restaurantId);
    if (!restaurant) {
      return res.status(404).json({ message: 'Restaurant not found' });
    }

    if (restaurant.ownerId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const data = { ...req.body, restaurantId: req.params.restaurantId };
    if (req.file) data.image = `/uploads/menu/${req.file.filename}`;

    const item = await MenuItem.create(data);
    res.status(201).json(item);
  } catch (error) {
    next(error);
  }
};

// PUT /api/menu/:id
const updateMenuItem = async (req, res, next) => {
  try {
    const item = await MenuItem.findByPk(req.params.id, {
      include: [{ model: Restaurant, as: 'restaurant' }],
    });

    if (!item) {
      return res.status(404).json({ message: 'Menu item not found' });
    }

    if (item.restaurant.ownerId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const data = { ...req.body };
    if (req.file) data.image = `/uploads/menu/${req.file.filename}`;

    await item.update(data);
    res.json(item);
  } catch (error) {
    next(error);
  }
};

// DELETE /api/menu/:id
const deleteMenuItem = async (req, res, next) => {
  try {
    const item = await MenuItem.findByPk(req.params.id, {
      include: [{ model: Restaurant, as: 'restaurant' }],
    });

    if (!item) {
      return res.status(404).json({ message: 'Menu item not found' });
    }

    if (item.restaurant.ownerId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    await item.destroy();
    res.json({ message: 'Menu item deleted' });
  } catch (error) {
    next(error);
  }
};

module.exports = { getMenuItems, addMenuItem, updateMenuItem, deleteMenuItem };
