const express = require('express');
const router = express.Router();
const { submitContact } = require('../controllers/contactController.js');

router.post('/', submitContact);

module.exports = router;
