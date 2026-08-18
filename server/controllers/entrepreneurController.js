const Entrepreneur = require('../models/Entrepreneur');
const Product = require('../models/Product');

// @desc    Create entrepreneur profile
// @route   POST /api/entrepreneurs
const createEntrepreneurProfile = async (req, res) => {
  try {
    const { businessName, skillCategory, description, experience, location, phone } = req.body;

    const existing = await Entrepreneur.findOne({ user: req.user._id });
    if (existing) {
      return res.status(400).json({ message: 'Entrepreneur profile already exists' });
    }

    const entrepreneur = await Entrepreneur.create({
      user: req.user._id,
      businessName,
      skillCategory,
      description,
      experience,
      location,
      phone
    });

    res.status(201).json(entrepreneur);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all approved entrepreneurs
// @route   GET /api/entrepreneurs
const getAllEntrepreneurs = async (req, res) => {
  try {
    const { category, location, search } = req.query;
    let filter = { isApproved: true };

    if (category) filter.skillCategory = category;
    if (location) filter.location = { $regex: location, $options: 'i' };
    if (search) filter.businessName = { $regex: search, $options: 'i' };

    const entrepreneurs = await Entrepreneur.find(filter).populate('user', 'name email profileImage');
    res.json(entrepreneurs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single entrepreneur by ID
// @route   GET /api/entrepreneurs/:id
const getEntrepreneurById = async (req, res) => {
  try {
    const entrepreneur = await Entrepreneur.findById(req.params.id)
      .populate('user', 'name email profileImage');

    if (!entrepreneur) {
      return res.status(404).json({ message: 'Entrepreneur not found' });
    }

    res.json(entrepreneur);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update entrepreneur profile
// @route   PUT /api/entrepreneurs/:id
const updateEntrepreneurProfile = async (req, res) => {
  try {
    const entrepreneur = await Entrepreneur.findOne({ user: req.user._id });

    if (!entrepreneur) {
      return res.status(404).json({ message: 'Entrepreneur not found' });
    }

    const updated = await Entrepreneur.findByIdAndUpdate(
      entrepreneur._id,
      req.body,
      { new: true }
    );

    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get logged-in entrepreneur's own profile
// @route   GET /api/entrepreneurs/my-profile
const getMyProfile = async (req, res) => {
  try {
    const entrepreneur = await Entrepreneur.findOne({ user: req.user._id })
      .populate('user', 'name email');

    if (!entrepreneur) {
      return res.status(404).json({ message: 'Profile not found' });
    }

    res.json(entrepreneur);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get logged-in entrepreneur's own products
// @route   GET /api/entrepreneurs/my-products
const getMyProducts = async (req, res) => {
  try {
    const entrepreneur = await Entrepreneur.findOne({ user: req.user._id });
    if (!entrepreneur) {
      return res.status(404).json({ message: 'Entrepreneur profile not found' });
    }

    const products = await Product.find({ entrepreneur: entrepreneur._id }).sort({ createdAt: -1 });
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createEntrepreneurProfile,
  getAllEntrepreneurs,
  getEntrepreneurById,
  updateEntrepreneurProfile,
  getMyProfile,
  getMyProducts
};
