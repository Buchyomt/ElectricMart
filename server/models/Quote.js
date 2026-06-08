const mongoose = require('mongoose');

const quoteItemSchema = new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
  name: { type: String, required: true },
  brand: { type: String },
  image: { type: String },
  unitPrice: { type: Number, required: true },
  quantity: { type: Number, required: true, min: 1 },
});

const quoteSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    projectName: { type: String, required: true },
    location: {
      type: String,
      enum: [
        'Island — Lekki / VI / Ikoyi',
        'Mainland — Ikeja / Surulere',
        'Outskirts — Ajah / Ikorodu',
      ],
      required: true,
    },
    notes: { type: String },
    items: [quoteItemSchema],

    // Calculated totals at submission time
    subtotal: { type: Number, default: 0 },
    deliveryFee: { type: Number, default: 0 },
    vat: { type: Number, default: 0 },
    total: { type: Number, default: 0 },

    // Quote lifecycle
    status: {
      type: String,
      enum: ['submitted', 'reviewing', 'approved', 'rejected', 'ordered'],
      default: 'submitted',
    },

    // Admin response
    adminResponse: {
      message: { type: String },
      adjustedItems: [quoteItemSchema], // If admin adjusts pricing
      adjustedTotal: { type: Number },
      respondedAt: { type: Date },
      respondedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    },

    validUntil: {
      type: Date,
      default: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Quote', quoteSchema);
