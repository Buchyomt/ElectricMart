/**
 * ElectroMart - Update 12 Products Script
 * Run with: node update12Products.js
 */

const mongoose = require('mongoose');
const dns = require('dns');
require('dotenv').config();

dns.setServers(['1.1.1.1', '8.8.8.8']);

const Product = require('./models/Product');

const MONGO_URI = process.env.MONGO_URI;

const updates = [
  {
    name: '300W AKT Separate Panel Solar Light',
    spec: 'High-output, separate solar panel',
    deliveryTime: 'Delivers in 24-48hrs',
    isBulkPricing: true,
  },
  {
    name: '500W AKT Separate Panel Solar Light',
    spec: 'Premium 500W, detachable panel',
    deliveryTime: 'Delivers in 24-48hrs',
    isBulkPricing: true,
  },
  {
    name: 'Home Theater System',
    spec: 'Surround sound, USB/FM/BT',
    deliveryTime: 'Delivers in 24hrs',
    isBulkPricing: false,
  },
  {
    name: 'Home Theater System (Model 2)',
    spec: 'Enhanced audio, Bluetooth 5.0',
    deliveryTime: 'Delivers in 24hrs',
    isBulkPricing: false,
  },
  {
    name: 'Solar Rechargeable Fan',
    spec: 'Solar-powered, built-in battery',
    deliveryTime: 'Delivers in 24-48hrs',
    isBulkPricing: true,
  },
  {
    name: 'Rechargeable Standing Fan',
    spec: '12hr run time, USB charging',
    deliveryTime: 'Delivers in 24hrs',
    isBulkPricing: false,
  },
  {
    name: 'AKT Extension Cord',
    spec: 'Multi-socket, surge protection',
    deliveryTime: 'Delivers in 24hrs',
    isBulkPricing: true,
  },
  {
    name: 'AKT Extension Cord (Model 2)',
    spec: 'Extended cable, built-in fuse',
    deliveryTime: 'Delivers in 24hrs',
    isBulkPricing: true,
  },
  {
    name: 'Solar Rechargeable Fan (Model 2)',
    spec: 'Compact, whisper-quiet motor',
    deliveryTime: 'Delivers in 24hrs',
    isBulkPricing: true,
  },
  {
    name: 'Solar Rechargeable Wall Fan (AVA)',
    spec: 'Wall-mounted, solar compatible',
    deliveryTime: 'Delivers in 24-48hrs',
    isBulkPricing: false,
  },
  {
    name: 'Orbit Standing Fan',
    spec: 'Wide oscillation, 3 speeds',
    deliveryTime: 'Delivers in 24hrs',
    isBulkPricing: true,
  },
  {
    name: 'Portable Gas Burner',
    spec: 'Single-burner, lightweight',
    deliveryTime: 'Delivers in 24hrs',
    isBulkPricing: false,
  }
];

async function updateProducts() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB!\n');

    let updated = 0;

    for (const data of updates) {
      const product = await Product.findOne({ name: data.name });
      if (product) {
        product.spec = data.spec;
        product.deliveryTime = data.deliveryTime;
        product.isBulkPricing = data.isBulkPricing;
        await product.save();
        console.log(`✅ Updated: ${product.name}`);
        updated++;
      } else {
        console.log(`⚠️ Not found: ${data.name}`);
      }
    }

    console.log(`\n🎉 Done! Updated ${updated} products.`);
    process.exit(0);
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
}

updateProducts();
