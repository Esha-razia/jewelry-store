const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

const run = async () => {
  await connectDB();
  const Product = require('./models/Product');
  
  console.log('Querying by slug...');
  try {
    const p1 = await Product.findOne({ slug: 'diamond-solitaire-ring' });
    console.log('Result for slug query:', p1 ? p1.name : 'Not found');
  } catch (err) {
    console.error('ERROR querying by slug:', err);
  }
  
  process.exit(0);
};

run();
