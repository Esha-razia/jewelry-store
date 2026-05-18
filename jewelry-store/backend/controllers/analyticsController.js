const asyncHandler = require('express-async-handler');
const Order = require('../models/Order.js');
const Product = require('../models/Product.js');
const { predictWithAI } = require('../utils/aiService.js');

// @desc    Get AI-driven Dashboard Analytics
// @route   GET /api/analytics/dashboard
// @access  Private/Admin
const getDashboardAnalytics = asyncHandler(async (req, res) => {
  const orders = await Order.find({}).populate('orderItems.product');
  const products = await Product.find({});

  const aiPredictions = predictWithAI(orders, products);
  res.json(aiPredictions);
});

module.exports = { getDashboardAnalytics };
