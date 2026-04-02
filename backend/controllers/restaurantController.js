const { Restaurant, MenuItem, Review, User } = require('../models');
const { Op, literal } = require('sequelize');

// GET /api/restaurants
const getRestaurants = async (req, res, next) => {
  try {
    const {
      search, location, cuisine, isVeg, hasAlcohol, petFriendly, hasOutdoorSeating,
      isOpen, hasDelivery, hasDineIn, hasNightlife, minRating, minCost, maxCost,
      sort, page = 1, limit = 12,
    } = req.query;

    const where = {};

    if (search) {
      where[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { cuisine: { [Op.like]: `%${search}%` } },
        { address: { [Op.like]: `%${search}%` } },
      ];
    }
    if (location) {
      where[Op.and] = [
        ...(where[Op.and] || []),
        {
          [Op.or]: [
            { city: { [Op.like]: `%${location}%` } },
            { area: { [Op.like]: `%${location}%` } },
            { address: { [Op.like]: `%${location}%` } },
          ],
        },
      ];
    }
    if (cuisine) where.cuisine = { [Op.like]: `%${cuisine}%` };
    if (isVeg === 'true') where.isVeg = true;
    if (hasAlcohol === 'true') where.hasAlcohol = true;
    if (petFriendly === 'true') where.petFriendly = true;
    if (hasOutdoorSeating === 'true') where.hasOutdoorSeating = true;
    if (isOpen === 'true') where.isOpen = true;
    if (hasDelivery === 'true') where.hasDelivery = true;
    if (hasDineIn === 'true') where.hasDineIn = true;
    if (hasNightlife === 'true') where.hasNightlife = true;
    if (minRating) where.rating = { [Op.gte]: Number(minRating) };
    if (minCost || maxCost) {
      where.costForTwo = {};
      if (minCost) where.costForTwo[Op.gte] = Number(minCost);
      if (maxCost) where.costForTwo[Op.lte] = Number(maxCost);
    }

    let order = [['createdAt', 'DESC']];
    if (sort === 'rating') order = [['rating', 'DESC']];
    if (sort === 'costLow') order = [['costForTwo', 'ASC']];
    if (sort === 'costHigh') order = [['costForTwo', 'DESC']];

    const offset = (parseInt(page) - 1) * parseInt(limit);

    const { count, rows } = await Restaurant.findAndCountAll({
      where,
      order,
      limit: parseInt(limit),
      offset,
      include: [{ model: Review, as: 'reviews', attributes: ['rating'] }],
    });

    res.json({
      restaurants: rows,
      total: count,
      page: parseInt(page),
      totalPages: Math.ceil(count / parseInt(limit)),
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/restaurants/:id
const getRestaurantById = async (req, res, next) => {
  try {
    const restaurant = await Restaurant.findByPk(req.params.id, {
      include: [
        { model: MenuItem, as: 'menuItems' },
        {
          model: Review,
          as: 'reviews',
          include: [{ model: User, as: 'user', attributes: ['id', 'name'] }],
        },
        { model: User, as: 'owner', attributes: ['id', 'name', 'email'] },
      ],
    });

    if (!restaurant) {
      return res.status(404).json({ message: 'Restaurant not found' });
    }

    res.json(restaurant);
  } catch (error) {
    next(error);
  }
};

// POST /api/restaurants
const createRestaurant = async (req, res, next) => {
  try {
    const data = { ...req.body, ownerId: req.user.id };
    if (req.file) data.image = `/uploads/restaurants/${req.file.filename}`;
    const restaurant = await Restaurant.create(data);
    res.status(201).json(restaurant);
  } catch (error) {
    next(error);
  }
};

// PUT /api/restaurants/:id
const updateRestaurant = async (req, res, next) => {
  try {
    const restaurant = await Restaurant.findByPk(req.params.id);

    if (!restaurant) {
      return res.status(404).json({ message: 'Restaurant not found' });
    }

    if (restaurant.ownerId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to update this restaurant' });
    }

    const data = { ...req.body };
    if (req.file) data.image = `/uploads/restaurants/${req.file.filename}`;

    await restaurant.update(data);
    res.json(restaurant);
  } catch (error) {
    next(error);
  }
};

// DELETE /api/restaurants/:id
const deleteRestaurant = async (req, res, next) => {
  try {
    const restaurant = await Restaurant.findByPk(req.params.id);

    if (!restaurant) {
      return res.status(404).json({ message: 'Restaurant not found' });
    }

    if (restaurant.ownerId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to delete this restaurant' });
    }

    await restaurant.destroy();
    res.json({ message: 'Restaurant deleted' });
  } catch (error) {
    next(error);
  }
};

// GET /api/restaurants/nearby
const getNearbyRestaurants = async (req, res, next) => {
  try {
    const { lat, lng, radius = 5, limit = 50 } = req.query;
    if (!lat || !lng) {
      return res.status(400).json({ message: 'lat and lng query params are required' });
    }

    const userLat = parseFloat(lat);
    const userLng = parseFloat(lng);
    const maxRadius = Math.min(parseFloat(radius), 50); // cap at 50 km

    // Haversine formula in SQL to compute distance in km
    const haversine = `(
      6371 * acos(
        cos(radians(${userLat}))
        * cos(radians(latitude))
        * cos(radians(longitude) - radians(${userLng}))
        + sin(radians(${userLat}))
        * sin(radians(latitude))
      )
    )`;

    const restaurants = await Restaurant.findAll({
      attributes: {
        include: [[literal(haversine), 'distance']],
      },
      where: {
        latitude: { [Op.ne]: null },
        longitude: { [Op.ne]: null },
        [Op.and]: literal(`${haversine} <= ${maxRadius}`),
      },
      order: literal('distance ASC'),
      limit: parseInt(limit),
      include: [{ model: Review, as: 'reviews', attributes: ['rating'] }],
    });

    res.json({ restaurants, center: { lat: userLat, lng: userLng }, radius: maxRadius });
  } catch (error) {
    next(error);
  }
};

module.exports = { getRestaurants, getRestaurantById, createRestaurant, updateRestaurant, deleteRestaurant, getNearbyRestaurants };
