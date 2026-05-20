const mongoose = require('mongoose');
const Product = require('./backend/models/Product');
const { generateSEOContent } = require('./backend/utils/aiService');
const uri = 'mongodb://127.0.0.1:27017/jewelry-store'; // adjust if needed
mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(async () => {
    const id = '6a0de9014b39f7e3a8e530bc'; // example product id from list
    const product = await Product.findById(id);
    if (!product) { console.log('Product not found'); process.exit(1); }
    const seo = generateSEOContent(product);
    console.log('Generated SEO:', seo);
    process.exit(0);
  })
  .catch(err => { console.error('Error:', err); process.exit(1); });
