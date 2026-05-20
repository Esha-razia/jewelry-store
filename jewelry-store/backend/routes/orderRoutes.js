const express = require('express');
const router = express.Router();
const { 
  addOrderItems,
  getOrderByNumber,
  getOrderById, 
  getMyOrders, 
  getOrders,
  trackOrderPublic,
  updateOrderToDelivered,
  updateOrderToPaid
} = require('../controllers/orderController.js');
const { protect, admin } = require('../middleware/authMiddleware.js');

router.post('/track', trackOrderPublic);
router.post('/', protect, addOrderItems);
router.get('/', protect, admin, getOrders);
router.get('/myorders', protect, getMyOrders);
router.route('/by-number/:orderNumber').get(protect, getOrderByNumber);
router.route('/:id').get(protect, getOrderById);
router.route('/:id/deliver').put(protect, admin, updateOrderToDelivered);
router.route('/:id/pay').put(protect, admin, updateOrderToPaid);

module.exports = router;
