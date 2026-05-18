const express = require('express');
const router = express.Router();
const { getDashboardAnalytics } = require('../controllers/analyticsController.js');
const { protect, admin } = require('../middleware/authMiddleware.js');

router.route('/dashboard').get(protect, admin, getDashboardAnalytics);

module.exports = router;
