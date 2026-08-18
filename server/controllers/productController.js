const Product = require('../models/Product');
const Entrepreneur = require('../models/Entrepreneur');

const createProduct = async (req, res) => {
  try {
    const { name, description, price, category, images, stock } = req.body;

    if (!name || !description || !price || !category) {
      return res.status(400).json({ message: 'Please provide all required product fields' });
    }

    const entrepreneurProfile = await Entrepreneur.findOne({ user: req.user._id });
    if (!entrepreneurProfile) {
      return res.status(404).json({ message: 'Entrepreneur profile not found' });
    }

    const product = await Product.create({
      entrepreneur: entrepreneurProfile._id,
      name,
      description,
      price,
      category,
      images: images || [],
      stock: stock || 1,
      isAvailable: true
    });

    res.status(201).json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getAllProducts = async (req, res) => {
  try {
    const { category, search, entrepreneurId } = req.query;
    const filter = {};

    if (category) filter.category = category;
    if (search) filter.name = { $regex: search, $options: 'i' };

    if (entrepreneurId) {
      const ent = await Entrepreneur.findById(entrepreneurId);
      if (!ent || !ent.isApproved) {
        return res.json([]);
      }
      filter.entrepreneur = entrepreneurId;
    } else {
      const approvedEntrepreneurs = await Entrepreneur.find({ isApproved: true }).select('_id');
      const approvedIds = approvedEntrepreneurs.map(e => e._id);
      filter.entrepreneur = { $in: approvedIds };
    }

    const products = await Product.find(filter)
      .populate('entrepreneur', 'businessName profileImage skillCategory');

    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate('entrepreneur', 'businessName profileImage skillCategory location');

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate('entrepreneur', 'user');
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    if (req.user.role !== 'admin' && product.entrepreneur.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const updatedProduct = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updatedProduct);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate('entrepreneur', 'user');
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    if (req.user.role !== 'admin' && product.entrepreneur.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    await product.deleteOne();
    res.json({ message: 'Product removed successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct
};
