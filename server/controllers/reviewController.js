const Review = require('../models/Review');
const Entrepreneur = require('../models/Entrepreneur');

const createReview = async (req, res) => {
  try {
    const { entrepreneur, product, rating, comment } = req.body;

    if (!entrepreneur || !rating) {
      return res.status(400).json({ message: 'Entrepreneur and rating are required' });
    }

    const review = await Review.create({
      customer: req.user._id,
      entrepreneur,
      product,
      rating,
      comment: comment || ''
    });

    const entrepreneurDoc = await Entrepreneur.findById(entrepreneur);
    if (entrepreneurDoc) {
      const reviews = await Review.find({ entrepreneur });
      const totalRating = reviews.reduce((sum, item) => sum + item.rating, 0);
      entrepreneurDoc.averageRating = Number((totalRating / reviews.length).toFixed(1));
      entrepreneurDoc.totalReviews = reviews.length;
      await entrepreneurDoc.save();
    }

    res.status(201).json(review);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getReviewsByEntrepreneur = async (req, res) => {
  try {
    const reviews = await Review.find({ entrepreneur: req.params.id })
      .populate('customer', 'name');

    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createReview,
  getReviewsByEntrepreneur
};
