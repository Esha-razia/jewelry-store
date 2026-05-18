const jwt = require('jsonwebtoken');
const asyncHandler = require('express-async-handler');
const User = require('../models/User.js');

const protect = asyncHandler(async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1];

      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      req.user = await User.findById(decoded.id).select('-password');

      if (!req.user) {
        console.error(`AUTH FAILURE: User with ID ${decoded.id} not found in database.`);
        res.status(401);
        throw new Error('Not authorized, user not found');
      }

      next();
    } catch (error) {
      console.error(`AUTH FAILURE: ${error.message}`);
      res.status(401);
      throw new Error('Not authorized, token failed');
    }
  }

  if (!token) {
    console.error('AUTH FAILURE: No token provided in headers');
    res.status(401);
    throw new Error('Not authorized, no token');
  }
});

const admin = (req, res, next) => {
  if (req.user && req.user.isAdmin) {
    next();
  } else {
    console.error(`ADMIN CHECK FAILURE: User ${req.user?._id} (${req.user?.email}) is NOT an admin. isAdmin value: ${req.user?.isAdmin}`);
    res.status(401);
    throw new Error('Not authorized as an admin');
  }
};

module.exports = { protect, admin };
