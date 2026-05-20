const express = require('express');
const { getPosts, getPostBySlug, createPost, updatePost, deletePost } = require('../controllers/blogController');
const { protect, admin } = require('../middleware/authMiddleware');

const router = express.Router();

// Public routes
router.get('/', getPosts);
router.get('/:slug', getPostBySlug);

// Admin routes (protected)
router.post('/', protect, admin, createPost);
router.put('/:id', protect, admin, updatePost);
router.delete('/:id', protect, admin, deletePost);

module.exports = router;
