const mongoose = require('mongoose');

const serviceRequestSchema = new mongoose.Schema({
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  entrepreneur: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Entrepreneur',
    required: true
  },
  description: {
    type: String,
    required: true
  },
  preferredDate: {
    type: Date
  },
  address: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected', 'completed'],
    default: 'pending'
  },
  budget: {
    type: Number,
    default: 0
  }
}, { timestamps: true });

module.exports = mongoose.model('ServiceRequest', serviceRequestSchema);