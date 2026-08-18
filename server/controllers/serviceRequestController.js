const ServiceRequest = require('../models/ServiceRequest');
const Entrepreneur = require('../models/Entrepreneur');

const createServiceRequest = async (req, res) => {
  try {
    const { entrepreneur, description, preferredDate, address, budget } = req.body;

    if (!entrepreneur || !description || !address) {
      return res.status(400).json({ message: 'Please provide all required service request details' });
    }

    const profile = await Entrepreneur.findById(entrepreneur);
    if (!profile) {
      return res.status(404).json({ message: 'Entrepreneur not found' });
    }

    const serviceRequest = await ServiceRequest.create({
      customer: req.user._id,
      entrepreneur,
      description,
      preferredDate,
      address,
      budget: budget || 0,
      status: 'pending'
    });

    res.status(201).json(serviceRequest);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getMyRequests = async (req, res) => {
  try {
    const serviceRequests = await ServiceRequest.find({ customer: req.user._id })
      .populate('entrepreneur', 'businessName location');

    res.json(serviceRequests);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getEntrepreneurRequests = async (req, res) => {
  try {
    const entrepreneur = await Entrepreneur.findOne({ user: req.user._id });
    if (!entrepreneur) return res.status(404).json({ message: 'Entrepreneur profile not found' });

    const serviceRequests = await ServiceRequest.find({ entrepreneur: entrepreneur._id })
      .populate('customer', 'name email phone location')
      .sort({ createdAt: -1 });
    res.json(serviceRequests);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateServiceRequestStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const serviceRequest = await ServiceRequest.findById(req.params.id);

    if (!serviceRequest) {
      return res.status(404).json({ message: 'Service request not found' });
    }

    const entrepreneur = req.user.role === 'entrepreneur'
      ? await Entrepreneur.findOne({ user: req.user._id })
      : null;
    const isCustomer = serviceRequest.customer.toString() === req.user._id.toString();
    const isAssignedEntrepreneur = entrepreneur && serviceRequest.entrepreneur.toString() === entrepreneur._id.toString();

    if (req.user.role !== 'admin' && !isCustomer && !isAssignedEntrepreneur) {
      return res.status(403).json({ message: 'Access denied' });
    }

    if (req.user.role === 'entrepreneur' && !['accepted', 'rejected', 'completed'].includes(status)) {
      return res.status(400).json({ message: 'Invalid request status' });
    }

    serviceRequest.status = status || serviceRequest.status;
    await serviceRequest.save();

    res.json(serviceRequest);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createServiceRequest,
  getMyRequests,
  getEntrepreneurRequests,
  updateServiceRequestStatus
};
