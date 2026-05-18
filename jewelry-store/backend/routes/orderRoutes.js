const express = require('express');
const router = express.Router();
const { 
  addOrderItems, 
  getOrderById, 
  getMyOrders, 
  getOrders,
  updateOrderToDelivered,
  updateOrderToPaid
} = require('../controllers/orderController.js');
const { protect, admin } = require('../middleware/authMiddleware.js');

router.route('/').post(protect, addOrderItems).get(protect, admin, getOrders);
router.route('/myorders').get(protect, getMyOrders);
router.route('/:id').get(protect, getOrderById);
router.route('/:id/deliver').put(protect, admin, updateOrderToDelivered);
router.route('/:id/pay').put(protect, admin, updateOrderToPaid);

module.exports = router;
