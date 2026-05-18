const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const User = require('./models/User');

dotenv.config();

const forceFix = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB Connected');

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('password', salt);

    // Update ALL admins to have the password 'password'
    const result = await User.updateMany(
      { isAdmin: true },
      { $set: { password: hashedPassword } }
    );
    console.log(`Updated ${result.modifiedCount} admin passwords to 'password'.`);

    // Ensure admin@example.com exists and is admin
    const admin = await User.findOne({ email: 'admin@example.com' });
    if (!admin) {
        await User.create({
            name: 'Admin User',
            email: 'admin@example.com',
            password: 'password', // will be hashed by pre-save
            isAdmin: true
        });
        console.log('Created admin@example.com');
    }

    // Check for esharazia534@gmail.com and make admin if exists
    const user = await User.findOne({ email: 'esharazia534@gmail.com' });
    if (user) {
        user.isAdmin = true;
        user.password = 'password';
        await user.save();
        console.log('Made esharazia534@gmail.com an admin.');
    }

    process.exit();
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

forceFix();
