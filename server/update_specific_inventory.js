const mongoose = require('mongoose');
const Product = require('./models/Product');
const dns = require('dns');
require('dotenv').config();

dns.setServers(['1.1.1.1', '8.8.8.8']);

const specificProducts = [
  {
    name: "VWS 1 Gang 1 Way Switch",
    price: 2000,
    category: "Switches & Sockets",
    brand: "VWS",
    image: "White Single Socket & Switch .jpeg",
    spec: "Standard White Bakelite",
    stockQuantity: 100,
    isBulkPricing: true
  },
  {
    name: "VWS 2 Gang 1 Way Switch",
    price: 2300,
    category: "Switches & Sockets",
    brand: "VWS",
    image: "White Single Socket & Switch .jpeg",
    spec: "Standard White Bakelite",
    stockQuantity: 100,
    isBulkPricing: true
  },
  {
    name: "VWS 3 Gang 1 Way Switch",
    price: 2500,
    category: "Switches & Sockets",
    brand: "VWS",
    image: "White Single Socket & Switch .jpeg",
    spec: "Standard White Bakelite",
    stockQuantity: 100,
    isBulkPricing: true
  },
  {
    name: "VWS 13A Single Socket",
    price: 2500,
    category: "Switches & Sockets",
    brand: "VWS",
    image: "White Single Socket & Switch .jpeg",
    spec: "Standard White Bakelite",
    stockQuantity: 100,
    isBulkPricing: true
  },
  {
    name: "VWS Water Heater Switch (20A)",
    price: 2500,
    category: "Switches & Sockets",
    brand: "VWS",
    image: "White Single Socket & Switch .jpeg",
    spec: "With Neon Indicator",
    stockQuantity: 50,
    isBulkPricing: true
  },
  {
    name: "VWS 4 Gang 1 Way Switch",
    price: 3500,
    category: "Switches & Sockets",
    brand: "VWS",
    image: "White Single Socket & Switch .jpeg",
    spec: "Standard White Bakelite",
    stockQuantity: 100,
    isBulkPricing: true
  },
  {
    name: "VWS 13A Double Socket",
    price: 3500,
    category: "Switches & Sockets",
    brand: "VWS",
    image: "Double-Socket .jpeg",
    spec: "Twin Socket Outlet",
    stockQuantity: 100,
    isBulkPricing: true
  }
];

const updateInventory = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to DB...');

    // Optionally remove the old "Series" bundles to keep it clean
    await Product.deleteMany({ brand: { $in: ["VWS", "G3.5 Gold", "Cryspo England", "KAK"] } });
    console.log('Cleaned up old series bundles.');

    for (const p of specificProducts) {
      await Product.create(p);
      console.log(`✅ Added: ${p.name}`);
    }

    console.log('Inventory updated successfully!');
    process.exit();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

updateInventory();
