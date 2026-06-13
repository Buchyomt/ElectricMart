/**
 * ElectricMart - 12 Products Seeder (with real prices)
 * Run with: node seed12Products.js
 */

const mongoose = require('mongoose');
const dns = require('dns');
require('dotenv').config();

dns.setServers(['1.1.1.1', '8.8.8.8']);

const Product = require('./models/Product');

const MONGO_URI = process.env.MONGO_URI;

const products = [
  {
    name: '300W AKT Separate Panel Solar Light',
    brand: 'AKT',
    price: 60000,
    category: 'Lighting & Fixtures',
    image: '300watts akt separate panel solar light.jpeg',
    description: 'High-output 300W solar flood light with a separate solar panel for flexible positioning. Ideal for large compounds, car parks, and security lighting. No electricity bill required.',
    rating: 4.5, reviews: 12, stockQuantity: 10,
  },
  {
    name: '500W AKT Separate Panel Solar Light',
    brand: 'AKT',
    price: 75000,
    category: 'Lighting & Fixtures',
    image: '500watts akt separate panel solar light .jpeg',
    description: 'Premium 500W solar flood light with a detachable high-efficiency solar panel. Perfect for warehouses, large estates, and commercial outdoor lighting. Zero running cost.',
    rating: 4.6, reviews: 8, stockQuantity: 8,
  },
  {
    name: 'Home Theater System',
    brand: 'Generic',
    price: 40000,
    category: 'Home Appliances',
    image: 'Home theater .jpeg',
    description: 'Complete home theater sound system with rich surround sound, powerful bass, and multiple input options (USB, FM, Bluetooth, AUX). Transform your living room into a cinema.',
    rating: 4.3, reviews: 25, stockQuantity: 10,
  },
  {
    name: 'Home Theater System (Model 2)',
    brand: 'Generic',
    price: 45000,
    category: 'Home Appliances',
    image: 'Home theater 2.jpeg',
    description: 'Upgraded home theater system with enhanced audio clarity, deep bass, remote control, and Bluetooth 5.0 connectivity. Perfect for movies, music, and parties.',
    rating: 4.4, reviews: 18, stockQuantity: 8,
  },
  {
    name: 'Solar Rechargeable Fan',
    brand: 'Generic',
    price: 80000,
    category: 'Fans & Cooling',
    image: 'Solar rechargeable fan .jpeg',
    description: 'Solar-powered rechargeable standing fan. Harness solar energy to stay cool during power cuts. Built-in high-capacity battery with multiple speed settings and LED light.',
    rating: 4.5, reviews: 30, stockQuantity: 12,
  },
  {
    name: 'Rechargeable Standing Fan',
    brand: 'Generic',
    price: 90000,
    category: 'Fans & Cooling',
    image: 'Rechargeable fan.jpeg',
    description: 'Premium rechargeable standing fan with long-lasting battery life. Charges fully in 4-6 hours and runs for up to 12 hours. Features USB charging port and adjustable height.',
    rating: 4.7, reviews: 45, stockQuantity: 10,
  },
  {
    name: 'AKT Extension Cord',
    brand: 'AKT',
    price: 8000,
    category: 'Distribution & Protection',
    image: 'Akt extension cord.jpeg',
    description: 'Heavy-duty AKT multi-socket extension cord with surge protection. Long cable for flexible placement in homes, offices, and workshops. Safe and durable.',
    rating: 4.6, reviews: 60, stockQuantity: 30,
  },
  {
    name: 'AKT Extension Cord (Model 2)',
    brand: 'AKT',
    price: 8000,
    category: 'Distribution & Protection',
    image: 'Akt extension cord 3.jpeg',
    description: 'AKT extension cord with multiple sockets and an extended cable length. Built-in safety fuse and surge protection for reliable everyday use.',
    rating: 4.5, reviews: 42, stockQuantity: 25,
  },
  {
    name: 'Solar Rechargeable Fan (Model 2)',
    brand: 'Generic',
    price: 70000,
    category: 'Fans & Cooling',
    image: 'Solar rechargeable fan 2.jpeg',
    description: 'Compact solar rechargeable fan ideal for homes and offices. Solar panel charges the built-in battery during the day for use at night. Whisper-quiet motor.',
    rating: 4.4, reviews: 22, stockQuantity: 10,
  },
  {
    name: 'Solar Rechargeable Wall Fan (AVA)',
    brand: 'AVA',
    price: 60000,
    category: 'Fans & Cooling',
    image: 'Solar rechargeable wall fan 3 AVA.jpeg',
    description: 'AVA solar rechargeable wall-mounted fan. Space-saving wall design with built-in battery. Compatible with solar panels for completely off-grid operation. 3 speed settings.',
    rating: 4.5, reviews: 15, stockQuantity: 8,
  },
  {
    name: 'Orbit Standing Fan',
    brand: 'Orbit',
    price: 32000,
    category: 'Fans & Cooling',
    image: 'Orbit fan.jpeg',
    description: 'Orbit brand standing pedestal fan with wide oscillation, adjustable height, and 3 speed settings. Energy-efficient motor with silent operation. Perfect for homes and offices.',
    rating: 4.3, reviews: 35, stockQuantity: 15,
  },
  {
    name: 'Portable Gas Burner',
    brand: 'Generic',
    price: 35000,
    category: 'Home Appliances',
    image: 'Gas burner .jpeg',
    description: 'Portable single-burner gas cooker for everyday cooking. Compact and lightweight design, easy ignition, and works with standard LPG gas cylinders. Great for homes and outdoor use.',
    rating: 4.2, reviews: 28, stockQuantity: 20,
  },
];

async function seedProducts() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB!\n');

    let added = 0;
    let skipped = 0;

    for (const product of products) {
      const exists = await Product.findOne({ name: product.name });
      if (exists) {
        console.log(`⏭️  Skipped (already exists): ${product.name}`);
        skipped++;
      } else {
        await Product.create(product);
        console.log(`✅ Added: ${product.name} — ₦${product.price.toLocaleString()}`);
        added++;
      }
    }

    console.log(`\n🎉 Done!`);
    console.log(`   ✅ Added: ${added} new products`);
    console.log(`   ⏭️  Skipped: ${skipped} duplicates`);
    console.log(`\n🛒 Refresh your shop page to see the new products!`);
    process.exit(0);
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
}

seedProducts();
