const User = require('../models/User');
const Entrepreneur = require('../models/Entrepreneur');
const Product = require('../models/Product');
const Order = require('../models/Order');
const ServiceRequest = require('../models/ServiceRequest');

const getDashboard = async (req, res) => {
  try {
    const [customers, entrepreneurs, products, orders, requests, pendingProfiles, recentProfiles] = await Promise.all([
      User.countDocuments({ role: 'customer' }),
      User.countDocuments({ role: 'entrepreneur' }),
      Product.countDocuments(),
      Order.countDocuments(),
      ServiceRequest.countDocuments(),
      Entrepreneur.countDocuments({ isApproved: false }),
      Entrepreneur.find().populate('user', 'name email').sort({ createdAt: -1 }).limit(8)
    ]);

    res.json({
      metrics: { customers, entrepreneurs, products, orders, requests, pendingProfiles },
      recentProfiles
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateApproval = async (req, res) => {
  try {
    const entrepreneur = await Entrepreneur.findByIdAndUpdate(
      req.params.id,
      { isApproved: Boolean(req.body.isApproved) },
      { new: true }
    ).populate('user', 'name email');

    if (!entrepreneur) return res.status(404).json({ message: 'Entrepreneur not found' });
    res.json(entrepreneur);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getDashboard, updateApproval };
