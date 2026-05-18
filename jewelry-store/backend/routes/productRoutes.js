const express = require('express');
const router = express.Router();
const { getProducts, getProductById, deleteProduct, createProduct, updateProduct, generateProductSEO } = require('../controllers/productController.js');
const { protect, admin } = require('../middleware/authMiddleware.js');

router.route('/').get(getProducts).post(protect, admin, createProduct);
router.route('/:id').get(getProductById).delete(protect, admin, deleteProduct).put(protect, admin, updateProduct);
router.route('/:id/generate-seo').post(protect, admin, generateProductSEO);

module.exports = router;

