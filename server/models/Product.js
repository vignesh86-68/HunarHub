const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  entrepreneur: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Entrepreneur',
    required: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  category: {
    type: String,
    required: true
  },
  images: [{
    type: String
  }],
  stock: {
    type: Number,
    default: 1
  },
  isAvailable: {
    type: Boolean,
    default: true
  },
  averageRating: {
    type: Number,
    default: 0
  }
}, { timestamps: true });

module.exports = mongoose.model('Product', productSchema);