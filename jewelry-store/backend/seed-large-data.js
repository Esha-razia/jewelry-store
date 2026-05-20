const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Product = require('./models/Product');
const Order = require('./models/Order');

dotenv.config();

const daysAgo = (n) => {
  const d = new Date();
  d.setDate(d.getDate() - n);
  // Introduce a slight random time component
  d.setHours(Math.floor(Math.random() * 24), Math.floor(Math.random() * 60), Math.floor(Math.random() * 60));
  return d;
};

const mockCustomers = [
  { name: 'Ali Khan', email: 'ali.khan@gmail.com' },
  { name: 'Ayesha Ahmed', email: 'ayesha.a@yahoo.com' },
  { name: 'Sana Malik', email: 'sana.malik@outlook.com' },
  { name: 'Zainab Fatima', email: 'zainab.f@gmail.com' },
  { name: 'Hamza Yusuf', email: 'hamza.yusuf@gmail.com' },
  { name: 'Bilal Siddiqui', email: 'bilal.sid@gmail.com' },
  { name: 'Amna Bibi', email: 'amna.b@outlook.com' },
  { name: 'Usman Raza', email: 'usman.raza@gmail.com' },
  { name: 'Fatima Zahra', email: 'fatima.zahra@hotmail.com' },
  { name: 'Omar Farooq', email: 'omar.f@yahoo.com' },
  { name: 'Muhammad Ibrahim', email: 'ibrahim.m@gmail.com' },
  { name: 'Hania Amir', email: 'hania.amir@gmail.com' },
  { name: 'Sarah Khan', email: 'sarah.k@gmail.com' },
  { name: 'Zayd Hussain', email: 'zayd.h@gmail.com' },
  { name: 'Mariam Tariq', email: 'mariam.t@gmail.com' }
];

const seedLargeData = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB Connected for large seeding.');

    // Clear existing users and orders (preserving products!)
    await Order.deleteMany({});
    await User.deleteMany({});
    console.log('Cleared existing orders and users.');

    // Recreate Admin User 1 (esharazia534@gmail.com)
    const admin1 = await User.create({
      name: 'Esha Razia',
      email: 'esharazia534@gmail.com',
      password: 'password',
      isAdmin: true,
    });
    console.log(`Restored Admin Account: ${admin1.email}`);

    // Recreate Admin User 2 (admin@example.com)
    const admin2 = await User.create({
      name: 'Admin User',
      email: 'admin@example.com',
      password: 'password',
      isAdmin: true,
    });
    console.log(`Restored Admin Account: ${admin2.email}`);

    // Create 15 Mock Customers with hashed passwords
    const createdUsers = [];
    for (const customer of mockCustomers) {
      const u = await User.create({
        name: customer.name,
        email: customer.email,
        password: 'password',
        isAdmin: false
      });
      createdUsers.push(u);
    }
    console.log(`Created ${createdUsers.length} mock customer accounts.`);

    // Fetch all products to create orders from
    const products = await Product.find({});
    if (products.length === 0) {
      console.error('No products found in DB! Please run scratch-seed.js first.');
      process.exit(1);
    }
    console.log(`Found ${products.length} products to create order items.`);

    const cities = ['Karachi', 'Lahore', 'Islamabad', 'Faisalabad', 'Rawalpindi', 'Multan', 'Peshawar', 'Quetta', 'Sialkot', 'Gujranwala'];
    const paymentMethods = ['Credit Card', 'COD', 'JazzCash', 'EasyPaisa'];

    // Generate 55 mock orders spanning the last 45 days
    let ordersCreated = 0;
    for (let i = 0; i < 55; i++) {
      const randomUser = createdUsers[Math.floor(Math.random() * createdUsers.length)];
      
      // Determine number of items in this order (1 to 3)
      const itemCount = Math.floor(Math.random() * 3) + 1;
      const orderItems = [];
      let itemsPrice = 0;
      
      // Shuffle products to pick unique ones
      const shuffledProducts = [...products].sort(() => 0.5 - Math.random());
      
      for (let j = 0; j < itemCount; j++) {
        const prod = shuffledProducts[j];
        const qty = Math.floor(Math.random() * 2) + 1; // 1 or 2 units
        orderItems.push({
          name: prod.name,
          qty,
          image: prod.image,
          price: prod.price,
          product: prod._id
        });
        itemsPrice += prod.price * qty;
      }

      const shippingPrice = itemsPrice > 2000 ? 0 : 150;
      const taxPrice = parseFloat((itemsPrice * 0.05).toFixed(2));
      const totalPrice = parseFloat((itemsPrice + shippingPrice + taxPrice).toFixed(2));

      // Order date between 0 and 45 days ago
      const orderDate = daysAgo(Math.floor(Math.random() * 45));

      // Shipping address details
      const city = cities[Math.floor(Math.random() * cities.length)];
      const postalCode = String(Math.floor(Math.random() * 89999) + 10000);
      const address = `${Math.floor(Math.random() * 500) + 1} House, Sector ${String.fromCharCode(65 + Math.floor(Math.random() * 6))}, ${city}`;

      const paymentMethod = paymentMethods[Math.floor(Math.random() * paymentMethods.length)];

      let isPaid = false;
      let paidAt = null;
      let isDelivered = false;
      let deliveredAt = null;

      // Logic for delivery based on age of order
      const diffTime = Math.abs(new Date() - orderDate);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays > 5) {
        // Old orders are 90% likely to be delivered
        isDelivered = Math.random() > 0.1;
        if (isDelivered) {
          deliveredAt = new Date(orderDate);
          deliveredAt.setDate(deliveredAt.getDate() + Math.floor(Math.random() * 3) + 2); // 2-4 days delivery time
        }
      } else {
        // Recent orders are 30% likely to be delivered
        isDelivered = Math.random() < 0.3;
        if (isDelivered) {
          deliveredAt = new Date(orderDate);
          deliveredAt.setDate(deliveredAt.getDate() + 1);
        }
      }

      // Payment logic
      if (paymentMethod === 'COD') {
        // COD orders are paid upon delivery
        if (isDelivered) {
          isPaid = true;
          paidAt = deliveredAt;
        }
      } else {
        // Cards/JazzCash/EasyPaisa are paid immediately
        isPaid = Math.random() > 0.05; // 95% paid rate
        if (isPaid) {
          paidAt = orderDate;
        }
      }

      // Create and save the order (pre-save generates the orderNumber)
      const order = new Order({
        user: randomUser._id,
        orderItems,
        shippingAddress: {
          address,
          city,
          postalCode,
          country: 'Pakistan',
        },
        paymentMethod,
        taxPrice,
        shippingPrice,
        totalPrice,
        isPaid,
        paidAt,
        isDelivered,
        deliveredAt,
      });

      // Override Mongoose automatic timestamps to fit our generated historical dates
      order.createdAt = orderDate;
      order.updatedAt = orderDate;

      await order.save();
      ordersCreated++;
    }

    console.log(`Successfully generated ${ordersCreated} historical orders!`);
    console.log('--- RESTORE SYSTEM PROCESS COMPLETE ---');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding large database:', error);
    process.exit(1);
  }
};

seedLargeData();
