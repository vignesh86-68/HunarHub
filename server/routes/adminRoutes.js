const express = require('express');
const router = express.Router();
const { protect, adminOnly } = require('../middleware/authMiddleware');
const { getDashboard, updateApproval } = require('../controllers/adminController');

router.get('/dashboard', protect, adminOnly, getDashboard);
router.put('/entrepreneurs/:id/approval', protect, adminOnly, updateApproval);

module.exports = router;
