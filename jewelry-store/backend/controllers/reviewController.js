const asyncHandler = require('express-async-handler');
const StoreReview = require('../models/StoreReview.js');

// Default initial reviews to seed if DB is empty
const defaultReviews = [
  {
    name: 'Sarah M.',
    rating: 5,
    comment: 'Absolutely gorgeous design. The gold solitaire ring is even more stunning in person than on the site. Perfect fit!',
    verified: true,
  },
  {
    name: 'Zayd H.',
    rating: 5,
    comment: 'Fast shipping to Lahore and superb packaging. The diamond clarity is perfect. Customer support was incredibly helpful.',
    verified: true,
  },
  {
    name: 'Ayesha A.',
    rating: 5,
    comment: 'Unmatched polish and durability. I wear my stainless steel band daily, and it still shines like day one. Recommended!',
    verified: true,
  }
];

// @desc    Get all store reviews
// @route   GET /api/reviews
// @access  Public
const getReviews = asyncHandler(async (req, res) => {
  let reviews = await StoreReview.find({}).sort({ createdAt: -1 });
  
  // Seed default reviews if empty
  if (reviews.length === 0) {
    try {
      await StoreReview.insertMany(defaultReviews);
      reviews = await StoreReview.find({}).sort({ createdAt: -1 });
    } catch (err) {
      console.error('Error seeding default reviews:', err);
    }
  }
  
  res.json(reviews);
});

// @desc    Create a store review
// @route   POST /api/reviews
// @access  Public
const createReview = asyncHandler(async (req, res) => {
  const { name, rating, comment } = req.body;

  if (!name || !rating || !comment) {
    res.status(400);
    throw new Error('Please provide name, rating, and comment');
  }

  const review = await StoreReview.create({
    name,
    rating: Number(rating),
    comment,
    verified: true // Mark new reviews as verified buyers by default for demo ease
  });

  res.status(201).json(review);
});

module.exports = { getReviews, createReview };
