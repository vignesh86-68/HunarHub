const express = require('express');
const router = express.Router();
const {
  createEntrepreneurProfile,
  getAllEntrepreneurs,
  getEntrepreneurById,
  updateEntrepreneurProfile,
  getMyProfile,
  getMyProducts
} = require('../controllers/entrepreneurController');
const { protect, entrepreneurOnly } = require('../middleware/authMiddleware');

router.get('/', getAllEntrepreneurs);
router.get('/my-profile', protect, getMyProfile);
router.get('/my-products', protect, entrepreneurOnly, getMyProducts);
router.post('/', protect, createEntrepreneurProfile);
router.put('/:id', protect, updateEntrepreneurProfile);
router.get('/:id', getEntrepreneurById);

module.exports = router;
