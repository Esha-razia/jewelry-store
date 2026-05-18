const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const User = require('./models/User');

dotenv.config();

const fixAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB Connected');

    const admin = await User.findOne({ email: 'admin@example.com' });

    if (admin) {
      console.log('Found Admin User. Re-hashing password...');
      // Re-saving the user will trigger the pre('save') hook in User.js which hashes the password
      admin.password = 'password';
      admin.isAdmin = true;
      await admin.save();
      console.log('Admin password hashed and saved.');
    } else {
      console.log('Admin user not found. Creating new admin...');
      await User.create({
        name: 'Admin User',
        email: 'admin@example.com',
        password: 'password',
        isAdmin: true
      });
      console.log('New Admin User created with hashed password.');
    }

    process.exit();
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

fixAdmin();
