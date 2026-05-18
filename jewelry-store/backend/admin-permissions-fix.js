const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');

dotenv.config();

const fixPermissions = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('--- PERMISSIONS REPAIR START ---');

    const emails = ['admin@example.com', 'esharazia534@gmail.com'];
    
    for (const email of emails) {
      const result = await User.findOneAndUpdate(
        { email: email },
        { $set: { isAdmin: true } },
        { new: true }
      );
      
      if (result) {
        console.log(`SUCCESS: ${email} is now an Admin (ID: ${result._id})`);
      } else {
        console.log(`WARNING: User not found with email ${email}`);
      }
    }

    console.log('--- PERMISSIONS REPAIR COMPLETE ---');
    process.exit();
  } catch (error) {
    console.error('CRITICAL ERROR during permissions repair:', error);
    process.exit(1);
  }
};

fixPermissions();
