const asyncHandler = require('express-async-handler');
const Product = require('../models/Product.js');
const Order = require('../models/Order.js');

// Helper to simulate Natural Language Understanding
const parseIntent = (message) => {
  const msg = message.toLowerCase();
  
  if (msg.includes('order') || msg.includes('tracking') || msg.includes('status')) {
    return { type: 'order_tracking' };
  }
  
  if (msg.includes('shipping') || msg.includes('return') || msg.includes('payment') || msg.includes('policy')) {
    return { type: 'faq', query: msg };
  }

  // Product Search Heuristics
  let maxPrice = null;
  let categoryStr = null;
  
  if (msg.includes('under') || msg.includes('cheap') || msg.includes('less than')) {
    const arr = msg.split(' ');
    // Extract a number
    const num = arr.find(word => word.startsWith('$') || !isNaN(word));
    if (num) maxPrice = parseInt(num.replace('$', ''));
  }

  if (msg.includes('ring')) categoryStr = 'ring';
  if (msg.includes('necklace') || msg.includes('chain')) categoryStr = 'necklace';
  if (msg.includes('bracelet')) categoryStr = 'bracelet';
  if (msg.includes('earring') || msg.includes('pendant')) categoryStr = 'pendant';

  if (categoryStr || maxPrice) {
    return { type: 'product_search', maxPrice, category: categoryStr };
  }

  return { type: 'unknown' };
};

// @desc    Handle chat message
// @route   POST /api/chat
// @access  Public (Optionally Private for Orders)
const handleChatMessage = asyncHandler(async (req, res) => {
  const { message, userId } = req.body;
  const intent = parseIntent(message);

  switch (intent.type) {
    case 'order_tracking':
      if (!userId) {
        return res.json({ text: "Please log in to check your order status.", type: 'text' });
      }
      const recentOrder = await Order.findOne({ user: userId }).sort({ createdAt: -1 });
      if (recentOrder) {
        return res.json({ 
          text: `Your most recent order (${recentOrder._id.toString().substring(18)}) is currently ${recentOrder.isDelivered ? 'Delivered ✅' : 'Processing 🚚'}.`,
          type: 'order_status',
          payload: recentOrder
        });
      } else {
        return res.json({ text: "I couldn't find any recent orders for your account.", type: 'text' });
      }

    case 'faq':
      if (intent.query.includes('shipping')) return res.json({ text: "We offer free FedEx Priority overnight shipping on all orders over $100.", type: 'text' });
      if (intent.query.includes('return')) return res.json({ text: "We have a hassle-free 30-day money-back guarantee. No questions asked return policy.", type: 'text' });
      if (intent.query.includes('payment')) return res.json({ text: "We accept all major credit cards, PayPal, and Apple Pay.", type: 'text' });
      return res.json({ text: "I can help with Shipping, Returns, or Payment policies. Let me know which you need help with!", type: 'text' });

    case 'product_search':
        let query = {};
        if (intent.category) query.name = { $regex: intent.category, $options: 'i' };
        if (intent.maxPrice) query.price = { $lte: intent.maxPrice };

        const products = await Product.find(query).limit(3);
        if (products.length > 0) {
            return res.json({ 
                text: "Here are some gorgeous pieces I found for you:", 
                type: 'products',
                payload: products
            });
        } else {
            return res.json({ text: "I'm sorry, I couldn't find any pieces matching that exact criteria. Try broadening your search!", type: 'text' });
        }

    default:
      return res.json({ 
        text: "I'm your JEWELSAFA assistant! I'm still learning, but I can help you search for jewelry, check your order status, or answer shipping/return FAQs.", 
        type: 'text' 
      });
  }
});

// @desc   Get AI recommendations
// @route  GET /api/chat/recommendations
// @access Public
const getRecommendations = asyncHandler(async (req, res) => {
    // Trending logic: Just pull 3 random items
    const products = await Product.aggregate([{ $sample: { size: 3 } }]);
    res.json(products);
});

module.exports = { handleChatMessage, getRecommendations };
