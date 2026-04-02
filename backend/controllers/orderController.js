const { Cart, MenuItem, Restaurant, Order, Offer } = require('../models');

// ─── Cart ────────────────────────────────────────────────────────────────────

// GET /api/cart
const getCart = async (req, res) => {
  try {
    const items = await Cart.findAll({
      where: { userId: req.user.id },
      include: [
        { model: MenuItem, as: 'menuItem' },
        { model: Restaurant, as: 'restaurant', attributes: ['id', 'name', 'image', 'address', 'deliveryTime'] },
      ],
      order: [['createdAt', 'ASC']],
    });
    res.json(items);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /api/cart
const addToCart = async (req, res) => {
  try {
    const { menuItemId, quantity = 1 } = req.body;
    const menuItem = await MenuItem.findByPk(menuItemId);
    if (!menuItem) return res.status(404).json({ message: 'Menu item not found' });

    // Check if user has items from a different restaurant already
    const existing = await Cart.findOne({ where: { userId: req.user.id } });
    if (existing && existing.restaurantId !== menuItem.restaurantId) {
      return res.status(400).json({
        message: 'Your cart has items from another restaurant. Clear it first to add from this one.',
        conflict: true,
      });
    }

    // Upsert
    const [cartItem, created] = await Cart.findOrCreate({
      where: { userId: req.user.id, menuItemId },
      defaults: { restaurantId: menuItem.restaurantId, quantity },
    });
    if (!created) {
      cartItem.quantity += quantity;
      await cartItem.save();
    }

    const full = await Cart.findByPk(cartItem.id, {
      include: [
        { model: MenuItem, as: 'menuItem' },
        { model: Restaurant, as: 'restaurant', attributes: ['id', 'name', 'image', 'address', 'deliveryTime'] },
      ],
    });
    res.status(created ? 201 : 200).json(full);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PUT /api/cart/:id
const updateCartItem = async (req, res) => {
  try {
    const item = await Cart.findOne({ where: { id: req.params.id, userId: req.user.id } });
    if (!item) return res.status(404).json({ message: 'Cart item not found' });

    const { quantity } = req.body;
    if (quantity < 1) {
      await item.destroy();
      return res.json({ message: 'Item removed' });
    }
    item.quantity = quantity;
    await item.save();
    res.json(item);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// DELETE /api/cart/:id
const removeFromCart = async (req, res) => {
  try {
    const item = await Cart.findOne({ where: { id: req.params.id, userId: req.user.id } });
    if (!item) return res.status(404).json({ message: 'Cart item not found' });
    await item.destroy();
    res.json({ message: 'Item removed from cart' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// DELETE /api/cart
const clearCart = async (req, res) => {
  try {
    await Cart.destroy({ where: { userId: req.user.id } });
    res.json({ message: 'Cart cleared' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ─── Orders ──────────────────────────────────────────────────────────────────

// POST /api/orders  (checkout)
const placeOrder = async (req, res) => {
  try {
    const { deliveryAddress, paymentMethod = 'cod', note, tip = 0, deliveryInstructions, couponCode, couponDiscount = 0 } = req.body;
    if (!deliveryAddress) return res.status(400).json({ message: 'Delivery address is required' });

    const cartItems = await Cart.findAll({
      where: { userId: req.user.id },
      include: [{ model: MenuItem, as: 'menuItem' }],
    });
    if (cartItems.length === 0) return res.status(400).json({ message: 'Cart is empty' });

    const restaurantId = cartItems[0].restaurantId;
    const items = cartItems.map((c) => ({
      menuItemId: c.menuItemId,
      name: c.menuItem.name,
      price: c.menuItem.price,
      quantity: c.quantity,
      image: c.menuItem.image,
    }));
    const totalAmount = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
    const deliveryFee = 40;
    const taxableAmount = totalAmount - couponDiscount;
    const tax = Math.round(taxableAmount * 0.05 * 100) / 100;
    const grandTotal = taxableAmount + deliveryFee + tax + (tip || 0);

    const order = await Order.create({
      userId: req.user.id,
      restaurantId,
      items,
      totalAmount: grandTotal,
      deliveryAddress,
      paymentMethod,
      paymentStatus: paymentMethod === 'cod' ? 'pending' : 'paid',
      note,
      tip: tip || 0,
      deliveryInstructions,
      couponCode,
      couponDiscount: couponDiscount || 0,
    });

    // Clear cart after order
    await Cart.destroy({ where: { userId: req.user.id } });

    // Increment coupon usage count
    if (couponCode) {
      await Offer.increment('usageCount', { where: { code: couponCode.toUpperCase(), restaurantId } });
    }

    res.status(201).json(order);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/orders
const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.findAll({
      where: { userId: req.user.id },
      include: [{ model: Restaurant, as: 'restaurant', attributes: ['id', 'name', 'image', 'address'] }],
      order: [['createdAt', 'DESC']],
    });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/orders/:id
const getOrderById = async (req, res) => {
  try {
    const order = await Order.findOne({
      where: { id: req.params.id, userId: req.user.id },
      include: [{ model: Restaurant, as: 'restaurant', attributes: ['id', 'name', 'image', 'address', 'phone', 'deliveryTime'] }],
    });
    if (!order) return res.status(404).json({ message: 'Order not found' });
    res.json(order);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PUT /api/orders/:id/cancel
const cancelOrder = async (req, res) => {
  try {
    const order = await Order.findOne({ where: { id: req.params.id, userId: req.user.id } });
    if (!order) return res.status(404).json({ message: 'Order not found' });
    if (!['placed', 'confirmed'].includes(order.status)) {
      return res.status(400).json({ message: 'Order cannot be cancelled at this stage' });
    }
    order.status = 'cancelled';
    await order.save();
    res.json(order);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ─── Owner: update order status ──────────────────────────────────────────────
// PUT /api/owner/orders/:id/status
const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ['confirmed', 'preparing', 'out_for_delivery', 'delivered', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const order = await Order.findByPk(req.params.id, {
      include: [{ model: Restaurant, as: 'restaurant' }],
    });
    if (!order) return res.status(404).json({ message: 'Order not found' });
    if (order.restaurant.ownerId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    order.status = status;
    if (status === 'delivered') order.paymentStatus = 'paid';
    await order.save();
    res.json(order);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/owner/orders
const getOwnerOrders = async (req, res) => {
  try {
    const restaurants = await Restaurant.findAll({
      where: { ownerId: req.user.id },
      attributes: ['id'],
    });
    const restaurantIds = restaurants.map((r) => r.id);

    const { Op } = require('sequelize');
    const where = { restaurantId: { [Op.in]: restaurantIds } };
    if (req.query.status) where.status = req.query.status;

    const orders = await Order.findAll({
      where,
      include: [
        { model: Restaurant, as: 'restaurant', attributes: ['id', 'name'] },
        { model: require('../models/User'), as: 'user', attributes: ['id', 'name', 'phone'] },
      ],
      order: [['createdAt', 'DESC']],
    });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /api/orders/:id/reorder
const reorderFromOrder = async (req, res) => {
  try {
    const order = await Order.findOne({ where: { id: req.params.id, userId: req.user.id } });
    if (!order) return res.status(404).json({ message: 'Order not found' });

    const items = Array.isArray(order.items) ? order.items : JSON.parse(order.items || '[]');
    if (!items.length) return res.status(400).json({ message: 'No items in this order' });

    // Verify menu items still exist
    const menuItemIds = items.map(i => i.menuItemId).filter(Boolean);
    const menuItems = await MenuItem.findAll({ where: { id: menuItemIds } });
    if (!menuItems.length) return res.status(400).json({ message: 'Menu items are no longer available' });

    // Clear existing cart
    await Cart.destroy({ where: { userId: req.user.id } });

    // Add each item to cart
    const restaurantId = order.restaurantId;
    for (const mi of menuItems) {
      const orig = items.find(i => i.menuItemId === mi.id);
      await Cart.create({
        userId: req.user.id,
        restaurantId,
        menuItemId: mi.id,
        quantity: orig?.quantity || 1,
      });
    }

    // Return full cart
    const cart = await Cart.findAll({
      where: { userId: req.user.id },
      include: [
        { model: MenuItem, as: 'menuItem' },
        { model: Restaurant, as: 'restaurant', attributes: ['id', 'name', 'image', 'address', 'deliveryTime'] },
      ],
      order: [['createdAt', 'ASC']],
    });
    res.json(cart);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  getCart, addToCart, updateCartItem, removeFromCart, clearCart,
  placeOrder, getMyOrders, getOrderById, cancelOrder, reorderFromOrder,
  updateOrderStatus, getOwnerOrders,
};
