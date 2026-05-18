const mongoose = require('mongoose');

const productSchema = mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    name: {
      type: String,
      required: true,
    },
    image: {
      type: String,
      required: true,
    },
    brand: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      required: true,
    },
    material: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
      default: 0,
    },
    priceHistory: [
      {
        price: { type: Number, required: true },
        date: { type: Date, default: Date.now }
      }
    ],
    countInStock: {
      type: Number,
      required: true,
      default: 0,
    },
    seoTags: {
      type: [String],
      default: [],
    },
    metaTitle: {
      type: String,
      default: '',
    },
    metaDescription: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

const Product = mongoose.model('Product', productSchema);

module.exports = Product;
