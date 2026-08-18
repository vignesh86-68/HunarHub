const express = require('express');
const router = express.Router();
const {
  createProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct
} = require('../controllers/productController');
const { protect, entrepreneurOnly, adminOnly } = require('../middleware/authMiddleware');

router.get('/', getAllProducts);
router.get('/:id', getProductById);
router.post('/', protect, entrepreneurOnly, createProduct);
router.put('/:id', protect, updateProduct);
router.delete('/:id', protect, deleteProduct);

module.exports = router;
