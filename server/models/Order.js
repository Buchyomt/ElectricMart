const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  items: [
    {
      productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true
      },
      name: String,
      price: Number,
      quantity: Number,
      image: String
    }
  ],
  shippingAddress: {
    fullName: String,
    phone: String,
    email: String,
    address: String,
    zone: String
  },
  deliveryOption: String,
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'failed'],
    default: 'pending'
  },
  orderStatus: {
    type: String,
    enum: ['confirmed', 'packed', 'shipping', 'delivered', 'cancelled'],
    default: 'confirmed'
  },
  subtotal: Number,
  shippingFee: Number,
  vat: Number,
  total: Number,
  specialInstructions: String,
  trackingHistory: [
    {
      status: String,
      note: String,
      timestamp: { type: Date, default: Date.now }
    }
  ]
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);
