const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const Product = require('./models/Product');
const Order = require('./models/Order');
const connectDB = require('./config/db');

dotenv.config();

connectDB();

const importData = async () => {
  try {
    await Order.deleteMany();
    await Product.deleteMany();
    await User.deleteMany();

    const createdUsers = await User.insertMany([
      { name: 'Admin User', email: 'admin@example.com', password: 'password', isAdmin: true },
      { name: 'Test User', email: 'test@example.com', password: 'password', isAdmin: false }
    ]);

    const adminUser = createdUsers[0]._id;

    const sampleProducts = [
      {
        name: 'Diamond Engagement Ring',
        image: '/images/diamond_ring.png',
        description: 'A highly realistic, premium sparkling diamond engagement ring. Perfect for life\'s biggest moments.',
        brand: 'Aurora Custom',
        category: 'Rings',
        price: 2499.99,
        countInStock: 5,
        material: 'White Gold & Diamond',
        user: adminUser,
        seoTags: ['ring', 'diamond', 'engagement'],
        metaTitle: 'Diamond Engagement Ring | JEWELSAFA',
        metaDescription: 'Buy a stunning diamond engagement ring.'
      },
      {
        name: '24k Gold Chain Necklace',
        image: '/images/gold_necklace.png',
        description: 'A stunning luxury 24k gold chain necklace resting on a premium velvet display.',
        brand: 'Aurora Classic',
        category: 'Necklaces',
        price: 899.99,
        countInStock: 10,
        material: '24k Solid Gold',
        user: adminUser,
        seoTags: ['necklace', 'gold', 'chain'],
        metaTitle: '24k Gold Chain | JEWELSAFA',
        metaDescription: 'Solid 24k gold chain for everyday elegance.'
      },
      {
        name: 'Brilliant Sapphire Pendant',
        image: '/images/sapphire_pendant.png',
        description: 'Close up of a brilliant blue sapphire pendant necklace with small diamonds around it.',
        brand: 'Aurora Custom',
        category: 'Pendants',
        price: 1299.99,
        countInStock: 3,
        material: 'Sapphire & Diamonds',
        user: adminUser,
        seoTags: ['pendant', 'sapphire', 'blue'],
        metaTitle: 'Sapphire Pendant | JEWELSAFA',
        metaDescription: 'Beautiful sapphire pendant surrounded by diamonds.'
      },
      {
        name: 'Platinum Diamond Bracelet',
        image: '/images/platinum_bracelet.png',
        description: 'A modern elegant platinum tennis bracelet encrusted with diamonds.',
        brand: 'Aurora Modern',
        category: 'Bracelets',
        price: 3499.99,
        countInStock: 2,
        material: 'Platinum & Diamond',
        user: adminUser,
        seoTags: ['bracelet', 'platinum', 'tennis'],
        metaTitle: 'Platinum Tennis Bracelet | JEWELSAFA',
        metaDescription: 'Modern platinum tennis bracelet.'
      }
    ];

    await Product.insertMany(sampleProducts);

    console.log('Data Imported!');
    process.exit();
  } catch (error) {
    console.error(`${error}`);
    process.exit(1);
  }
};

importData();
