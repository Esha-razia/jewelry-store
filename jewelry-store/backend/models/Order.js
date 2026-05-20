const mongoose = require('mongoose');

const ORDER_NUMBER_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

const generateOrderNumber = () => {
  let code = '';
  for (let i = 0; i < 10; i += 1) {
    code += ORDER_NUMBER_CHARS.charAt(Math.floor(Math.random() * ORDER_NUMBER_CHARS.length));
  }
  return code;
};

const orderSchema = mongoose.Schema(
  {
    orderNumber: {
      type: String,
      unique: true,
      sparse: true,
      uppercase: true,
      trim: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    orderItems: [
      {
        name: { type: String, required: true },
        qty: { type: Number, required: true },
        image: { type: String, required: true },
        price: { type: Number, required: true },
        product: {
          type: mongoose.Schema.Types.ObjectId,
          required: true,
          ref: 'Product',
        },
      },
    ],
    shippingAddress: {
      address: { type: String, required: true },
      city: { type: String, required: true },
      postalCode: { type: String, required: true },
      country: { type: String, required: true },
    },
    paymentMethod: {
      type: String,
      required: true,
    },
    taxPrice: {
      type: Number,
      required: true,
      default: 0.0,
    },
    shippingPrice: {
      type: Number,
      required: true,
      default: 0.0,
    },
    totalPrice: {
      type: Number,
      required: true,
      default: 0.0,
    },
    isPaid: {
      type: Boolean,
      required: true,
      default: false,
    },
    paidAt: {
      type: Date,
    },
    isDelivered: {
      type: Boolean,
      required: true,
      default: false,
    },
    deliveredAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

orderSchema.pre('save', async function assignOrderNumber() {
  if (this.orderNumber) {
    return;
  }
  const OrderModel = mongoose.model('Order');
  let attempts = 0;
  while (attempts < 12) {
    const candidate = generateOrderNumber();
    const exists = await OrderModel.exists({ orderNumber: candidate });
    if (!exists) {
      this.orderNumber = candidate;
      return;
    }
    attempts += 1;
  }
  throw new Error('Could not generate order number');
});

const Order = mongoose.model('Order', orderSchema);

module.exports = Order;
