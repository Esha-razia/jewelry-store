const asyncHandler = require('express-async-handler');
const Subscriber = require('../models/Subscriber.js');

// @route   POST /api/newsletter/subscribe
const subscribeNewsletter = asyncHandler(async (req, res) => {
  const raw = req.body.email;
  if (!raw || typeof raw !== 'string') {
    res.status(400);
    throw new Error('Email is required');
  }
  const email = raw.trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    res.status(400);
    throw new Error('Please enter a valid email');
  }

  await Subscriber.findOneAndUpdate(
    { email },
    { $setOnInsert: { email } },
    { upsert: true, new: true }
  );

  res.json({ ok: true, message: 'You are subscribed. Thank you!' });
});

module.exports = { subscribeNewsletter };
