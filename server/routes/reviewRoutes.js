const express = require('express');
const router = express.Router();
const { createReview, getReviewsByEntrepreneur } = require('../controllers/reviewController');
const { protect } = require('../middleware/authMiddleware');

router.post('/', protect, createReview);
router.get('/entrepreneur/:id', getReviewsByEntrepreneur);

module.exports = router;
