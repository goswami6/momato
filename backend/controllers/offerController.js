const { Offer, Restaurant } = require('../models');
const { Op } = require('sequelize');

// GET /api/restaurants/:restaurantId/offers
const getOffers = async (req, res, next) => {
  try {
    const now = new Date();
    const offers = await Offer.findAll({
      where: {
        restaurantId: req.params.restaurantId,
        isActive: true,
        [Op.or]: [
          { validTo: null },
          { validTo: { [Op.gte]: now } },
        ],
      },
      order: [['createdAt', 'DESC']],
    });
    res.json(offers);
  } catch (error) {
    next(error);
  }
};

// POST /api/owner/offers
const createOffer = async (req, res, next) => {
  try {
    const restaurant = await Restaurant.findByPk(req.body.restaurantId);
    if (!restaurant) return res.status(404).json({ message: 'Restaurant not found' });
    if (restaurant.ownerId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const { code, title, description, discountType, discountValue, minOrderValue, maxDiscount, validFrom, validTo, usageLimit } = req.body;
    if (!code || !title || !discountValue) {
      return res.status(400).json({ message: 'code, title, and discountValue are required' });
    }

    const offer = await Offer.create({
      restaurantId: req.body.restaurantId,
      code: code.toUpperCase(),
      title,
      description: description || null,
      discountType: discountType || 'percentage',
      discountValue: parseFloat(discountValue),
      minOrderValue: minOrderValue ? parseFloat(minOrderValue) : 0,
      maxDiscount: maxDiscount ? parseFloat(maxDiscount) : null,
      validFrom: validFrom || null,
      validTo: validTo || null,
      usageLimit: usageLimit ? parseInt(usageLimit) : null,
    });

    res.status(201).json(offer);
  } catch (error) {
    next(error);
  }
};

// PUT /api/owner/offers/:id
const updateOffer = async (req, res, next) => {
  try {
    const offer = await Offer.findByPk(req.params.id, {
      include: [{ model: Restaurant, as: 'restaurant' }],
    });
    if (!offer) return res.status(404).json({ message: 'Offer not found' });
    if (offer.restaurant.ownerId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const data = { ...req.body };
    if (data.code) data.code = data.code.toUpperCase();
    await offer.update(data);
    res.json(offer);
  } catch (error) {
    next(error);
  }
};

// DELETE /api/owner/offers/:id
const deleteOffer = async (req, res, next) => {
  try {
    const offer = await Offer.findByPk(req.params.id, {
      include: [{ model: Restaurant, as: 'restaurant' }],
    });
    if (!offer) return res.status(404).json({ message: 'Offer not found' });
    if (offer.restaurant.ownerId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    await offer.destroy();
    res.json({ message: 'Offer deleted' });
  } catch (error) {
    next(error);
  }
};

// POST /api/offers/validate
const validateCoupon = async (req, res, next) => {
  try {
    const { code, restaurantId, orderTotal } = req.body;
    if (!code || !restaurantId) {
      return res.status(400).json({ message: 'code and restaurantId are required' });
    }

    const now = new Date();
    const offer = await Offer.findOne({
      where: {
        code: code.toUpperCase(),
        restaurantId,
        isActive: true,
        [Op.and]: [
          { [Op.or]: [{ validFrom: null }, { validFrom: { [Op.lte]: now } }] },
          { [Op.or]: [{ validTo: null }, { validTo: { [Op.gte]: now } }] },
        ],
      },
    });

    if (!offer) return res.status(404).json({ message: 'Invalid or expired coupon code' });

    if (offer.usageLimit && offer.usageCount >= offer.usageLimit) {
      return res.status(400).json({ message: 'Coupon usage limit reached' });
    }

    const total = parseFloat(orderTotal) || 0;
    if (total < offer.minOrderValue) {
      return res.status(400).json({ message: `Minimum order value is Rs.${offer.minOrderValue}` });
    }

    let discount = 0;
    if (offer.discountType === 'percentage') {
      discount = (total * offer.discountValue) / 100;
      if (offer.maxDiscount) discount = Math.min(discount, offer.maxDiscount);
    } else {
      discount = offer.discountValue;
    }
    discount = Math.min(discount, total);

    res.json({
      valid: true,
      offer: { id: offer.id, code: offer.code, title: offer.title, discountType: offer.discountType, discountValue: offer.discountValue },
      discount: Math.round(discount),
      finalTotal: Math.round(total - discount),
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getOffers, createOffer, updateOffer, deleteOffer, validateCoupon };
