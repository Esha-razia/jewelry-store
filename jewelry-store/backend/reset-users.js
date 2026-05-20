const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');

dotenv.config();

const resetUsers = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB Connected successfully.');

    // Clear existing users to avoid conflicts and stale/unhashed passwords
    await User.deleteMany({});
    console.log('Cleared all existing users.');

    // Create Admin User 1
    const admin1 = await User.create({
      name: 'Admin User',
      email: 'admin@example.com',
      password: 'password',
      isAdmin: true,
    });
    console.log(`Created admin@example.com (ID: ${admin1._id}, isAdmin: ${admin1.isAdmin})`);

    // Create Admin User 2 (Your custom account)
    const admin2 = await User.create({
      name: 'Esha Razia',
      email: 'esharazia534@gmail.com',
      password: 'password',
      isAdmin: true,
    });
    console.log(`Created esharazia534@gmail.com (ID: ${admin2._id}, isAdmin: ${admin2.isAdmin})`);

    // Create Test User
    const testUser = await User.create({
      name: 'Test User',
      email: 'test@example.com',
      password: 'password',
      isAdmin: false,
    });
    console.log(`Created test@example.com (ID: ${testUser._id}, isAdmin: ${testUser.isAdmin})`);

    console.log('--- USER RESET SUCCESSFUL & ALL PASSWORDS HASHED ---');
    process.exit(0);
  } catch (error) {
    console.error('Error resetting users:', error);
    process.exit(1);
  }
};

resetUsers();
