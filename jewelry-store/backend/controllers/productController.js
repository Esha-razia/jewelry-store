const asyncHandler = require('express-async-handler');
const Product = require('../models/Product.js');
const { generateSEOContent } = require('../utils/aiService.js');

// @desc    Fetch all products
// @route   GET /api/products
// @access  Public
const getProducts = asyncHandler(async (req, res) => {
  const products = await Product.find({});
  res.json(products);
});

// @desc    Fetch single product
// @route   GET /api/products/:id
// @access  Public
const getProductById = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (product) {
    res.json(product);
  } else {
    res.status(404);
    throw new Error('Product not found');
  }
});

// @desc    Delete a product
// @route   DELETE /api/products/:id
// @access  Private/Admin
const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (product) {
    await product.deleteOne();
    res.json({ message: 'Product removed' });
  } else {
    res.status(404);
    throw new Error('Product not found');
  }
});

// @desc    Create a product
// @route   POST /api/products
// @access  Private/Admin
const createProduct = asyncHandler(async (req, res) => {
  console.log('--- CREATE PRODUCT ATTEMPT ---');
  console.log('Body:', req.body);

  const { 
    name, price, description, image, brand, category, material, countInStock, seoTags, metaTitle, metaDescription 
  } = req.body;

  try {
    const product = new Product({
      name: name || 'Sample name',
      price: Number(price) || 0,
      user: req.user._id,
      image: image || '/images/sample.jpg',
      brand: brand || 'Sample brand',
      category: category || 'Sample category',
      description: description || 'Sample description',
      material: material || 'Sample material',
      countInStock: Number(countInStock) || 0,
      seoTags: seoTags || [],
      metaTitle: metaTitle || '',
      metaDescription: metaDescription || '',
    });

    // Initialize price history with current price
    product.priceHistory = [{ price: product.price, date: new Date() }];

    const createdProduct = await product.save();
    console.log('SUCCESS: Product created');
    res.status(201).json(createdProduct);
  } catch (error) {
    console.error('ERROR during product creation:', error.message);
    res.status(400);
    throw new Error(error.message);
  }
});

// @desc    Update a product
// @route   PUT /api/products/:id
// @access  Private/Admin
const updateProduct = asyncHandler(async (req, res) => {
  console.log('--- UPDATE PRODUCT ATTEMPT ---');
  console.log('ID:', req.params.id);
  console.log('Body:', req.body);

  const { 
    name, price, description, image, brand, category, material, countInStock, seoTags, metaTitle, metaDescription 
  } = req.body;

  const product = await Product.findById(req.params.id);

  if (product) {
    try {
      product.name = name ?? product.name;
      
      // If price is changing, track it in priceHistory
      if (price !== undefined && Number(price) !== product.price) {
        if (!product.priceHistory) {
          product.priceHistory = [];
        }
        if (product.priceHistory.length === 0) {
          product.priceHistory.push({ price: product.price, date: product.createdAt || new Date() });
        }
        product.price = Number(price);
        product.priceHistory.push({ price: Number(price), date: new Date() });
      }

      product.description = description ?? product.description;
      product.image = image ?? product.image;
      product.brand = brand ?? product.brand;
      product.category = category ?? product.category;
      product.material = material ?? product.material;
      product.countInStock = countInStock !== undefined ? Number(countInStock) : product.countInStock;
      
      if (seoTags !== undefined) product.seoTags = seoTags;
      if (metaTitle !== undefined) product.metaTitle = metaTitle;
      if (metaDescription !== undefined) product.metaDescription = metaDescription;

      const updatedProduct = await product.save();
      console.log('SUCCESS: Product updated');
      res.json(updatedProduct);
    } catch (error) {
       console.error('ERROR during product update:', error.message);
       res.status(400);
       throw new Error(error.message);
    }
  } else {
    res.status(404);
    throw new Error('Product not found');
  }
});

// @desc    AI-generate SEO meta title, description, and keywords for a product
// @route   POST /api/products/:id/generate-seo
// @access  Private/Admin
const generateProductSEO = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }

  const generated = generateSEOContent(product);

  product.metaTitle       = generated.metaTitle;
  product.metaDescription = generated.metaDescription;
  product.seoTags         = generated.seoTags;

  await product.save();

  res.json({
    metaTitle:       product.metaTitle,
    metaDescription: product.metaDescription,
    seoTags:         product.seoTags,
  });
});

module.exports = { getProducts, getProductById, deleteProduct, createProduct, updateProduct, generateProductSEO };
