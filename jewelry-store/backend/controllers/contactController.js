const asyncHandler = require('express-async-handler');
const ContactMessage = require('../models/ContactMessage.js');

// @route   POST /api/contact
const submitContact = asyncHandler(async (req, res) => {
  const { name, email, message } = req.body;
  if (!name || typeof name !== 'string' || name.trim().length < 2) {
    res.status(400);
    throw new Error('Please enter your name');
  }
  if (!email || typeof email !== 'string') {
    res.status(400);
    throw new Error('Email is required');
  }
  if (!message || typeof message !== 'string' || message.trim().length < 5) {
    res.status(400);
    throw new Error('Please write a longer message');
  }

  await ContactMessage.create({
    name: name.trim(),
    email: email.trim().toLowerCase(),
    message: message.trim(),
  });

  res.status(201).json({ ok: true, message: 'Thanks! We received your message and will reply soon.' });
});

module.exports = { submitContact };
