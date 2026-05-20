const mongoose = require('mongoose');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

dotenv.config();

const slugify = (text) => {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-');
};

const migrateSlug = async () => {
  try {
    await connectDB();
    const Product = require('./models/Product');
    
    // Use lean() to get plain objects, bypassing validation
    const products = await Product.find({}).lean();
    console.log(`Found ${products.length} products to migrate...`);

    for (const product of products) {
      if (!product.slug) {
        const slug = slugify(product.name);
        await Product.updateOne(
          { _id: product._id },
          { $set: { slug } }
        );
        console.log(`  ✔ ${product.name} → /product/${slug}`);
      } else {
        console.log(`  ⏭ ${product.name} already has slug: ${product.slug}`);
      }
    }

    console.log('\nMigration complete!');
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
};

migrateSlug();
