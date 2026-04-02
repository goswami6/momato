const { Address } = require('../models');

// GET /api/addresses
const getAddresses = async (req, res) => {
  try {
    const addresses = await Address.findAll({
      where: { userId: req.user.id },
      order: [['isDefault', 'DESC'], ['createdAt', 'DESC']],
    });
    res.json(addresses);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /api/addresses
const addAddress = async (req, res) => {
  try {
    const { label = 'Home', address, landmark, isDefault } = req.body;
    if (!address || !address.trim()) return res.status(400).json({ message: 'Address is required' });

    // If setting as default, unset others
    if (isDefault) {
      await Address.update({ isDefault: false }, { where: { userId: req.user.id } });
    }

    const newAddr = await Address.create({
      userId: req.user.id,
      label,
      address: address.trim(),
      landmark: landmark ? landmark.trim() : null,
      isDefault: !!isDefault,
    });
    res.status(201).json(newAddr);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PUT /api/addresses/:id
const updateAddress = async (req, res) => {
  try {
    const addr = await Address.findOne({ where: { id: req.params.id, userId: req.user.id } });
    if (!addr) return res.status(404).json({ message: 'Address not found' });

    const { label, address, landmark, isDefault } = req.body;
    if (isDefault) {
      await Address.update({ isDefault: false }, { where: { userId: req.user.id } });
    }

    if (label !== undefined) addr.label = label;
    if (address !== undefined) addr.address = address.trim();
    if (landmark !== undefined) addr.landmark = landmark ? landmark.trim() : null;
    if (isDefault !== undefined) addr.isDefault = isDefault;
    await addr.save();
    res.json(addr);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// DELETE /api/addresses/:id
const deleteAddress = async (req, res) => {
  try {
    const addr = await Address.findOne({ where: { id: req.params.id, userId: req.user.id } });
    if (!addr) return res.status(404).json({ message: 'Address not found' });
    await addr.destroy();
    res.json({ message: 'Address deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { getAddresses, addAddress, updateAddress, deleteAddress };
