const express = require('express');
const router = express.Router();
const {
  createOrder,
  getMyOrders,
  getAllOrders,
  updateOrderStatus,
  getEntrepreneurOrders
} = require('../controllers/orderController');
const { protect, adminOnly, entrepreneurOnly } = require('../middleware/authMiddleware');

router.post('/', protect, createOrder);
router.get('/my-orders', protect, getMyOrders);
router.get('/entrepreneur', protect, entrepreneurOnly, getEntrepreneurOrders);
router.get('/', protect, adminOnly, getAllOrders);
router.put('/:id', protect, updateOrderStatus);

module.exports = router;
