const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');

dotenv.config();

const listAdmins = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    const admins = await User.find({ isAdmin: true });
    console.log('Admins in DB:');
    admins.forEach(u => console.log(`- ${u.name} (${u.email})`));
    process.exit();
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

listAdmins();
