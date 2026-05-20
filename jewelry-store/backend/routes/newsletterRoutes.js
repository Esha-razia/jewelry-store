const express = require('express');
const router = express.Router();
const { subscribeNewsletter } = require('../controllers/newsletterController.js');

router.post('/subscribe', subscribeNewsletter);

module.exports = router;
