const Order = require('../models/Order');
const Product = require('../models/Product');
const Entrepreneur = require('../models/Entrepreneur');

const createOrder = async (req, res) => {
  try {
    const { product, quantity, deliveryAddress } = req.body;

    if (!product || !deliveryAddress) {
      return res.status(400).json({ message: 'Please provide order details' });
    }

    const qty = Number(quantity) || 1;
    if (qty < 1) {
      return res.status(400).json({ message: 'Quantity must be at least 1' });
    }

    const foundProduct = await Product.findById(product).populate('entrepreneur', 'businessName');
    if (!foundProduct) {
      return res.status(404).json({ message: 'Product not found' });
    }

    if (!foundProduct.isAvailable || foundProduct.stock < qty) {
      return res.status(400).json({ message: 'Not enough stock available' });
    }

    const totalPrice = Number(foundProduct.price) * qty;

    const order = await Order.create({
      customer: req.user._id,
      // Derive entrepreneur from the product itself rather than trusting the
      // client-supplied value, so an order can never be attributed to the
      // wrong seller.
      entrepreneur: foundProduct.entrepreneur._id,
      product,
      quantity: qty,
      totalPrice,
      deliveryAddress,
      paymentStatus: 'paid'
    });

    const updatedStock = foundProduct.stock - qty;
    await Product.findByIdAndUpdate(product, {
      stock: updatedStock,
      isAvailable: updatedStock > 0
    });

    res.status(201).json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ customer: req.user._id })
      .populate('entrepreneur', 'businessName location')
      .populate('product', 'name price');

    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate('customer', 'name email')
      .populate('entrepreneur', 'businessName location')
      .populate('product', 'name price');

    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateOrderStatus = async (req, res) => {
  try {
    const { status, paymentStatus } = req.body;
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    const entrepreneur = await Entrepreneur.findOne({ user: req.user._id });
    const isCustomer = order.customer.toString() === req.user._id.toString();
    const isEntrepreneur = entrepreneur && order.entrepreneur.toString() === entrepreneur._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isAdmin && !isCustomer && !isEntrepreneur) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const prevStatus = order.status;
    if (status) {
      order.status = status;
      // If marked as delivered, update entrepreneur totalEarnings
      if (status === 'delivered' && prevStatus !== 'delivered') {
        const orderEnt = entrepreneur && order.entrepreneur.toString() === entrepreneur._id.toString()
          ? entrepreneur
          : await Entrepreneur.findById(order.entrepreneur);
        
        if (orderEnt) {
          orderEnt.totalEarnings = (orderEnt.totalEarnings || 0) + order.totalPrice;
          await orderEnt.save();
        }
      }
    }
    if (paymentStatus) order.paymentStatus = paymentStatus;
    await order.save();

    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getEntrepreneurOrders = async (req, res) => {
  try {
    const entrepreneur = await Entrepreneur.findOne({ user: req.user._id });
    if (!entrepreneur) {
      return res.status(404).json({ message: 'Entrepreneur profile not found' });
    }

    const orders = await Order.find({ entrepreneur: entrepreneur._id })
      .populate('customer', 'name email phone location')
      .populate('product', 'name price category')
      .sort({ createdAt: -1 });

    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createOrder,
  getMyOrders,
  getAllOrders,
  updateOrderStatus,
  getEntrepreneurOrders
};
