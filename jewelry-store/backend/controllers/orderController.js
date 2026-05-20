const mongoose = require('mongoose');
const asyncHandler = require('express-async-handler');
const Order = require('../models/Order.js');

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
const addOrderItems = asyncHandler(async (req, res) => {
  const {
    orderItems,
    shippingAddress,
    paymentMethod,
    itemsPrice,
    taxPrice,
    shippingPrice,
    totalPrice,
  } = req.body;

  if (orderItems && orderItems.length === 0) {
    res.status(400);
    throw new Error('No order items');
    return;
  } else {
    const order = new Order({
      orderItems,
      user: req.user._id,
      shippingAddress,
      paymentMethod,
      itemsPrice,
      taxPrice,
      shippingPrice,
      totalPrice,
    });

    const createdOrder = await order.save();
    res.status(201).json(createdOrder);
  }
});

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Private
const getOrderById = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id).populate('user', 'name email');

  if (order) {
    res.json(order);
  } else {
    res.status(404);
    throw new Error('Order not found');
  }
});

// @desc    Get logged in user orders
// @route   GET /api/orders/myorders
// @access  Private
const getMyOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ user: req.user._id });
  res.json(orders);
});

// @desc    Get all orders
// @route   GET /api/orders
// @access  Private/Admin
const getOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({}).populate('user', 'id name');
  res.json(orders);
});

// @desc    Lookup order status with order id + email (same as account checkout email)
// @route   POST /api/orders/track
// @access  Public
const trackOrderPublic = asyncHandler(async (req, res) => {
  const { orderId, email } = req.body || {};
  if (!orderId || typeof orderId !== 'string' || !mongoose.Types.ObjectId.isValid(orderId.trim())) {
    res.status(400);
    throw new Error('Enter a valid order ID');
  }
  if (!email || typeof email !== 'string' || email.trim().length < 5) {
    res.status(400);
    throw new Error('Enter the email used on checkout');
  }

  const normalizedEmail = email.trim().toLowerCase();
  const order = await Order.findById(orderId.trim()).populate('user', 'email name');

  if (!order || !order.user || !order.user.email) {
    res.status(404);
    throw new Error('Order not found');
  }

  const accountEmail = (order.user.email || '').trim().toLowerCase();
  if (accountEmail !== normalizedEmail) {
    res.status(404);
    throw new Error('Order not found for this email');
  }

  const safeSummary = {
    _id: order._id,
    createdAt: order.createdAt,
    updatedAt: order.updatedAt,
    totalPrice: order.totalPrice,
    isPaid: order.isPaid,
    paidAt: order.paidAt,
    isDelivered: order.isDelivered,
    deliveredAt: order.deliveredAt,
    shippingAddress: order.shippingAddress,
    paymentMethod: order.paymentMethod,
    orderItems: (order.orderItems || []).map((it) => ({
      name: it.name,
      qty: it.qty,
      price: it.price,
      image: it.image,
    })),
  };

  res.json(safeSummary);
});

// @desc    Update order to paid (manual override)
// @route   PUT /api/orders/:id/pay
// @access  Private/Admin
const updateOrderToPaid = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);

  if (order) {
    order.isPaid = true;
    order.paidAt = Date.now();
    order.paymentResult = {
      id: 'MANUAL',
      status: 'COMPLETED',
      update_time: new Date().toISOString(),
      email_address: req.user.email,
    };

    const updatedOrder = await order.save();

    res.json(updatedOrder);
  } else {
    res.status(404);
    throw new Error('Order not found');
  }
});

// @desc    Update order to delivered
// @route   PUT /api/orders/:id/deliver
// @access  Private/Admin
const updateOrderToDelivered = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);

  if (order) {
    order.isDelivered = true;
    order.deliveredAt = Date.now();

    const updatedOrder = await order.save();

    res.json(updatedOrder);
  } else {
    res.status(404);
    throw new Error('Order not found');
  }
});

module.exports = { 
  addOrderItems, 
  getOrderById, 
  getMyOrders, 
  getOrders,
  trackOrderPublic,
  updateOrderToDelivered, 
  updateOrderToPaid 
};
