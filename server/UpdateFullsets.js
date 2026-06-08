const mongoose = require('mongoose');
const Product = require('./models/Product');
require('dotenv').config();

const dns = require('dns');
dns.setServers(['1.1.1.1', '8.8.8.8']);

const productList = [
  // --- THE 5 FULLSETS ---
  {
    name: "Fullset Socket & Switches Gold",
    price: 18800,
    category: "Switches & Sockets",
    brand: "G3.5 Gold",
    image: "Gold Single Socket & Switch.jpeg",
    description: "Complete set of Gold Switches & Sockets.",
    spec: "1, 2, 3, 4 Gang Switches + Single & Double Sockets",
    deliveryTime: "Delivers in 24hrs",
    isBulkPricing: true,
    rating: 5.0,
    reviews: 1200
  },
  {
    name: "Fullset Socket & Switches Black",
    price: 20000,
    category: "Switches & Sockets",
    brand: "KAK Black",
    image: "Double-Socket .jpeg",
    description: "Complete set of Black Switches & Sockets.",
    spec: "1, 2, 3, 4 Gang Switches + Single & Double Sockets",
    deliveryTime: "Delivers in 24hrs",
    isBulkPricing: true,
    rating: 5.0,
    reviews: 1100
  },
  {
    name: "Fullset Socket & Switches White",
    price: 21100,
    category: "Switches & Sockets",
    brand: "VWS White",
    image: "White Single Socket & Switch .jpeg",
    description: "Complete set of White Switches & Sockets.",
    spec: "1, 2, 3, 4 Gang Switches + Single & Double Sockets",
    deliveryTime: "Delivers in 24hrs",
    isBulkPricing: true,
    rating: 5.0,
    reviews: 1050
  },
  {
    name: "Fullset Socket & Switches Silver",
    price: 19000,
    category: "Switches & Sockets",
    brand: "Cryspo Silver",
    image: "Single Sockets .jpeg",
    description: "Complete set of Silver Switches & Sockets.",
    spec: "1, 2, 3, 4 Gang Switches + Single & Double Sockets",
    deliveryTime: "Delivers in 24hrs",
    isBulkPricing: true,
    rating: 5.0,
    reviews: 1000
  },
  {
    name: "Fullset Socket & Switches Milk",
    price: 19500,
    category: "Switches & Sockets",
    brand: "Cryspo Gold-Trim",
    image: "Single Socket & Switch.jpeg",
    description: "Complete set of Milk/Gold-Trim Switches & Sockets.",
    spec: "1, 2, 3, 4 Gang Switches + Single & Double Sockets",
    deliveryTime: "Delivers in 24hrs",
    isBulkPricing: true,
    rating: 5.0,
    reviews: 950
  },

  // --- THE 5 SINGLES ---
  {
    name: "Single 1 Gang Switch (Gold)",
    price: 2500,
    category: "Switches & Sockets",
    brand: "G3.5 Gold",
    image: "Gold Single Socket & Switch.jpeg",
    spec: "Gold Series, Single Unit",
    deliveryTime: "Delivers in 24hrs",
    isBulkPricing: true,
    rating: 5.0,
    reviews: 900
  },
  {
    name: "Single 13A Socket (Black)",
    price: 3500,
    category: "Switches & Sockets",
    brand: "KAK Black",
    image: "Double-Socket .jpeg",
    spec: "Black Series, Single Unit",
    deliveryTime: "Delivers in 24hrs",
    isBulkPricing: true,
    rating: 5.0,
    reviews: 850
  },
  {
    name: "Single 1 Gang Switch (White)",
    price: 2100,
    category: "Switches & Sockets",
    brand: "VWS White",
    image: "White Single Socket & Switch .jpeg",
    spec: "White Series, Single Unit",
    deliveryTime: "Delivers in 24hrs",
    isBulkPricing: true,
    rating: 5.0,
    reviews: 800
  },
  {
    name: "Single 13A Socket (Silver)",
    price: 2500,
    category: "Switches & Sockets",
    brand: "Cryspo Silver",
    image: "Single Sockets .jpeg",
    spec: "Silver Series, Single Unit",
    deliveryTime: "Delivers in 24hrs",
    isBulkPricing: true,
    rating: 5.0,
    reviews: 750
  },
  {
    name: "Single 1 Gang Switch (Milk)",
    price: 2500,
    category: "Switches & Sockets",
    brand: "Cryspo Gold-Trim",
    image: "Single Socket & Switch.jpeg",
    spec: "Milk/Gold-Trim Series, Single Unit",
    deliveryTime: "Delivers in 24hrs",
    isBulkPricing: true,
    rating: 5.0,
    reviews: 700
  }
];

const runUpdate = async () => {
  try {
    console.log('Connecting to database...');
    await mongoose.connect(process.env.MONGO_URI);

    console.log('Clearing old series data...');
    const brandsToClear = ["VWS White", "G3.5 Gold", "Cryspo Gold-Trim", "KAK Black", "Cryspo Silver", "VWS", "Cryspo England", "KAK"];
    await Product.deleteMany({ brand: { $in: brandsToClear } });

    for (const p of productList) {
      await Product.create(p);
      console.log(`✅ Added: ${p.name}`);
    }

    console.log('\n--- ALL 10 ITEMS UPDATED WITH FULL DETAILS ---');
    process.exit();
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
};

runUpdate();
