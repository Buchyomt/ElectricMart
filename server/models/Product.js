const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  brand: { type: String, required: true },
  price: { type: Number, required: true },
  rating: { type: Number, default: 0 },
  reviews: { type: Number, default: 0 },
  image: { type: String, required: true },
  spec: { type: String },
  deliveryTime: { type: String },
  isBulkPricing: { type: Boolean, default: false },
  bulkPricing: [
    {
      minQty: { type: Number, required: true },
      discountedPrice: { type: Number, required: true }
    }
  ],
  stockQuantity: { type: Number, default: 100, min: 0 },
  category: { type: String, required: true }
}, { timestamps: true });

module.exports = mongoose.model('Product', productSchema);
