const express = require('express');
const router = express.Router();
const { 
  authUser, 
  registerUser, 
  toggleWishlist,
  getWishlist,
  getUsers,
  deleteUser,
  getUserById,
  updateUser
} = require('../controllers/userController.js');
const { protect, admin } = require('../middleware/authMiddleware.js');

router.route('/').post(registerUser).get(protect, admin, getUsers);
router.post('/login', authUser);
router.route('/wishlist').get(protect, getWishlist);
router.route('/wishlist/:id').post(protect, toggleWishlist);
router
  .route('/:id')
  .delete(protect, admin, deleteUser)
  .get(protect, admin, getUserById)
  .put(protect, admin, updateUser);

module.exports = router;