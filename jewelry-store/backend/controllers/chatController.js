const asyncHandler = require('express-async-handler');
const Product = require('../models/Product.js');
const Order = require('../models/Order.js');

// Helper to simulate Natural Language Understanding
const parseIntent = (message) => {
  const msg = message.toLowerCase().trim();
  
  if (msg.includes('order') || msg.includes('tracking') || msg.includes('status')) {
    return { type: 'order_tracking' };
  }
  
  if (msg.includes('shipping') || msg.includes('return') || msg.includes('payment') || msg.includes('policy')) {
    return { type: 'faq', query: msg };
  }

  // Detect category (checking Earrings and Pendants before Rings to avoid "ear ring" matching "Rings")
  let category = null;
  if (/\bearrings?\b|\bear\s+rings?\b|\bstuds?\b/i.test(msg)) {
    category = 'Earrings';
  } else if (/\brings?\b/i.test(msg)) {
    category = 'Rings';
  } else if (/\bnecklaces?\b|\bchains?\b|\bpendants?\b/i.test(msg)) {
    category = 'Necklaces';
  } else if (/\bbracelets?\b|\bcuffs?\b/i.test(msg)) {
    category = 'Bracelets';
  } else if (/\bbangles?\b/i.test(msg)) {
    category = 'Bangles';
  }

  // Detect material
  let material = null;
  if (/\bgold\b/i.test(msg)) material = 'Gold';
  else if (/\bdiamonds?\b/i.test(msg)) material = 'Diamond';
  else if (/\bsilver\b/i.test(msg)) material = 'Silver';
  else if (/\bplatinum\b/i.test(msg)) material = 'Platinum';
  else if (/\bpearls?\b/i.test(msg)) material = 'Pearl';
  else if (/\bsapphires?\b/i.test(msg)) material = 'Sapphire';

  // Detect price limits (e.g. under 2000, below 500, under rs 1000, budget 1500)
  let maxPrice = null;
  const priceRegex = /(?:under|less\s+than|below|rs\.?\s*|price\s*|budget\s*|amount\s*|of\s*|for\s*)\s*(\d+)/i;
  const match = msg.match(priceRegex);
  if (match) {
    maxPrice = parseInt(match[1], 10);
  } else {
    // Check if there is any bare number between 10 and 100000
    const anyNumMatch = msg.match(/\b(\d{2,6})\b/);
    if (anyNumMatch) {
      maxPrice = parseInt(anyNumMatch[1], 10);
    }
  }

  // Detect keyword search (words that are not stop words, and exclude already parsed price/category/material info)
  let keyword = null;
  const stopWords = ['show', 'me', 'the', 'of', 'under', 'below', 'less', 'than', 'rs', 'price', 'in', 'stock', 'for', 'gold', 'diamond', 'silver', 'platinum', 'pearl', 'sapphire', 'ring', 'rings', 'necklace', 'necklaces', 'bracelet', 'bracelets', 'earring', 'earrings', 'bangle', 'bangles', 'pendant', 'pendants', 'chain', 'chains', 'a', 'an', 'please', 'with', 'and', 'or', 'is', 'are', 'what', 'have', 'you', 'cheap', 'budget', 'about', 'to', 'can', 'find'];
  
  const excludeList = [...stopWords];
  if (maxPrice) excludeList.push(maxPrice.toString());
  if (category) {
    excludeList.push(category.toLowerCase());
    excludeList.push(category.toLowerCase().replace(/s$/, '')); // singular form
  }
  if (material) {
    excludeList.push(material.toLowerCase());
  }

  const words = msg.split(/\s+/);
  const searchWords = words.filter(w => !excludeList.includes(w) && w.length > 2);
  if (searchWords.length > 0) {
    keyword = searchWords[0];
  }

  // If any product criteria detected, perform search
  if (category || material || maxPrice || keyword) {
    return {
      type: 'product_search',
      category,
      material,
      maxPrice,
      keyword
    };
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
      if (intent.query.includes('shipping')) return res.json({ text: "We offer free FedEx Priority overnight shipping on all orders over Rs. 100.", type: 'text' });
      if (intent.query.includes('return')) return res.json({ text: "We have a hassle-free 30-day money-back guarantee. No questions asked return policy.", type: 'text' });
      if (intent.query.includes('payment')) return res.json({ text: "We accept all major credit cards, PayPal, and Apple Pay.", type: 'text' });
      return res.json({ text: "I can help with Shipping, Returns, or Payment policies. Let me know which you need help with!", type: 'text' });

    case 'product_search':
      let query = {};
      
      if (intent.category) {
        query.category = { $regex: '^' + intent.category + '$', $options: 'i' };
      }
      
      if (intent.material) {
        query.material = { $regex: intent.material, $options: 'i' };
      }
      
      if (intent.maxPrice) {
        query.price = { $lte: intent.maxPrice };
      }

      if (intent.keyword) {
        query.$or = [
          { name: { $regex: intent.keyword, $options: 'i' } },
          { description: { $regex: intent.keyword, $options: 'i' } }
        ];
      }

      console.log(`[ChatBot] Running query:`, JSON.stringify(query));
      const products = await Product.find(query).limit(5);
      
      if (products.length > 0) {
        let categoryLabel = intent.category ? ` ${intent.category.toLowerCase()}` : " pieces";
        let materialLabel = intent.material ? ` ${intent.material.toLowerCase()}` : "";
        let priceLabel = intent.maxPrice ? ` under Rs. ${intent.maxPrice}` : "";
        return res.json({ 
          text: `Here are the gorgeous${materialLabel}${categoryLabel}${priceLabel} I found for you:`, 
          type: 'products',
          payload: products
        });
      } else {
        // Fallback: search general items in category if too specific
        if (intent.category) {
          const fallbackProducts = await Product.find({ category: { $regex: '^' + intent.category + '$', $options: 'i' } }).limit(3);
          if (fallbackProducts.length > 0) {
            return res.json({
              text: `I couldn't find any items matching your exact specifications, but here are some popular ${intent.category.toLowerCase()} from our collection:`,
              type: 'products',
              payload: fallbackProducts
            });
          }
        }
        return res.json({ text: "I'm sorry, I couldn't find any jewelry matching those specific criteria. Try asking for a category like rings, necklaces, or bracelets!", type: 'text' });
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
