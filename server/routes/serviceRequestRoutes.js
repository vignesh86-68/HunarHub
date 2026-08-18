const express = require('express');
const router = express.Router();
const {
  createServiceRequest,
  getMyRequests,
  getEntrepreneurRequests,
  updateServiceRequestStatus
} = require('../controllers/serviceRequestController');
const { protect } = require('../middleware/authMiddleware');

router.post('/', protect, createServiceRequest);
router.get('/my-requests', protect, getMyRequests);
router.get('/entrepreneur-requests', protect, getEntrepreneurRequests);
router.put('/:id', protect, updateServiceRequestStatus);

module.exports = router;
