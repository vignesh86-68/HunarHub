const mongoose = require('mongoose');

const entrepreneurSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  businessName: {
    type: String,
    required: true,
    trim: true
  },
  skillCategory: {
    type: String,
    enum: ['Cobbler', 'Potter', 'Tailor', 'Artisan', 'Small Vendor', 'Other'],
    required: true
  },
  description: {
    type: String,
    default: ''
  },
  experience: {
    type: Number,
    default: 0
  },
  location: {
    type: String,
    required: true
  },
  phone: {
    type: String,
    required: true
  },
  profileImage: {
    type: String,
    default: ''
  },
  gallery: [{
    type: String
  }],
  isApproved: {
    type: Boolean,
    default: false
  },
  isAvailable: {
    type: Boolean,
    default: true
  },
  averageRating: {
    type: Number,
    default: 0
  },
  totalReviews: {
    type: Number,
    default: 0
  },
  totalEarnings: {
    type: Number,
    default: 0
  }
}, { timestamps: true });

module.exports = mongoose.model('Entrepreneur', entrepreneurSchema);