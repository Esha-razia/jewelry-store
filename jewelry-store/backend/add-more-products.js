const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const Product = require('./models/Product');
const connectDB = require('./config/db');

dotenv.config();

connectDB();

const addMoreProducts = async () => {
  try {
    const adminUser = await User.findOne({ isAdmin: true });
    if (!adminUser) {
      console.error('No admin user found!');
      process.exit(1);
    }

    const newProducts = [
      {
        name: 'Emerald Cut Emerald Ring',
        image: '/images/emerald_ring.png',
        description: 'A highly realistic close-up photo of a premium emerald jewelry ring.',
        brand: 'Aurora Royal',
        category: 'Rings',
        price: 3100.00,
        countInStock: 3,
        material: '18k Gold & Emerald',
        user: adminUser._id,
        seoTags: ['ring', 'emerald', 'gold'],
        metaTitle: 'Emerald Ring | Aurora Jewels',
        metaDescription: 'Stunning emerald cut ring.'
      },
      {
        name: 'Classic Pearl Drop Necklace',
        image: '/images/pearl_necklace.png',
        description: 'A luxurious pearl necklace featuring perfectly round and lustrous white pearls.',
        brand: 'Aurora Classic',
        category: 'Necklaces',
        price: 1550.00,
        countInStock: 8,
        material: 'Freshwater Pearls & Silver',
        user: adminUser._id,
        seoTags: ['necklace', 'pearl'],
        metaTitle: 'Pearl Necklace | Aurora Jewels',
        metaDescription: 'Classic pearl necklace for elegance.'
      },
      {
        name: 'Rose Gold Ruby Pendant',
        image: '/images/sapphire_pendant.png',
        description: 'A beautiful ruby-like pendant set in rose gold.',
        brand: 'Aurora Custom',
        category: 'Pendants',
        price: 950.00,
        countInStock: 12,
        material: 'Rose Gold & Ruby',
        user: adminUser._id,
        seoTags: ['pendant', 'ruby', 'rose gold'],
        metaTitle: 'Ruby Pendant | Aurora Jewels',
        metaDescription: 'Rose gold ruby pendant.'
      },
      {
        name: 'Opal & Diamond Bracelet',
        image: '/images/platinum_bracelet.png',
        description: 'A magical opal and diamond bracelet.',
        brand: 'Aurora Modern',
        category: 'Bracelets',
        price: 2100.00,
        countInStock: 4,
        material: 'Platinum & Opal',
        user: adminUser._id,
        seoTags: ['bracelet', 'opal', 'diamond'],
        metaTitle: 'Opal Bracelet | Aurora Jewels',
        metaDescription: 'Magical opal bracelet.'
      },
      {
        name: 'Vintage Diamond Choker',
        image: '/images/gold_necklace.png',
        description: 'A vintage inspired diamond choker resting on velvet.',
        brand: 'Aurora Heritage',
        category: 'Necklaces',
        price: 4500.00,
        countInStock: 1,
        material: 'White Gold & Diamond',
        user: adminUser._id,
        seoTags: ['choker', 'diamond', 'vintage'],
        metaTitle: 'Vintage Diamond Choker | Aurora Jewels',
        metaDescription: 'Authentic vintage choker.'
      },
      {
        name: 'Solitaire Promise Ring',
        image: '/images/diamond_ring.png',
        description: 'A delicate and beautiful promise ring for your loved one.',
        brand: 'Aurora Minimal',
        category: 'Rings',
        price: 1200.00,
        countInStock: 6,
        material: 'Silver & Diamond',
        user: adminUser._id,
        seoTags: ['ring', 'solitaire', 'promise'],
        metaTitle: 'Solitaire Ring | Aurora Jewels',
        metaDescription: 'Beautiful promise ring.'
      }
    ];

    await Product.insertMany(newProducts);
    console.log('6 new products added to the database successfully!');
    process.exit();
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

addMoreProducts();
