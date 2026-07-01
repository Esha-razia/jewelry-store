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
        metaDescription: 'Buy a stunning diamond engagement ring.',
        faqs: [
          { question: "What diamond cut and clarity is used in this ring?", answer: "This ring is adorned with a hand-selected Round Brilliant cut diamond, featuring G-H color and VS1-VS2 clarity for maximum fire and brilliance." },
          { question: "Can I resize this engagement ring?", answer: "Yes, we offer one complimentary resizing within 60 days of purchase. It can be resized up or down by up to 2 sizes." },
          { question: "Does it come with a grading certificate?", answer: "Yes, this engagement ring comes with an official JEWELSAFA Gemological Certificate detailing the diamond's carat weight, color, clarity, and gold purity." }
        ]
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
        metaDescription: 'Solid 24k gold chain for everyday elegance.',
        faqs: [
          { question: "Is this chain made of pure 24k solid gold?", answer: "Absolutely. This necklace is crafted entirely from solid 24k gold (99.9% purity), stamped for authenticity." },
          { question: "What is the clasp type used on this gold chain?", answer: "It features a premium, heavy-duty lobster clasp designed for both absolute security and effortless ease of use." },
          { question: "How should I store this 24k gold chain?", answer: "Since 24k gold is relatively soft and malleable, we advise storing this chain flat in its velvet jewelry box, away from harder metal pieces to avoid scratches." }
        ]
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
        metaDescription: 'Beautiful sapphire pendant surrounded by diamonds.',
        faqs: [
          { question: "Are the sapphires natural or lab-created?", answer: "The central blue sapphire is 100% natural and ethically sourced, selected specifically for its rich royal blue hue and exceptional clarity." },
          { question: "Is the pendant chain included with this purchase?", answer: "Yes, the pendant comes complete with an elegant 18-inch matching white gold chain." }
        ]
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
        metaDescription: 'Modern platinum tennis bracelet.',
        faqs: [
          { question: "How many diamonds are set in this tennis bracelet?", answer: "This platinum tennis bracelet features 48 individually prong-set round diamonds, totaling approximately 5.5 carats in weight." },
          { question: "Does this bracelet have a safety lock?", answer: "Yes, it is designed with a premium custom double-secure box clasp and safety latch to ensure it stays safely on your wrist." }
        ]
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
