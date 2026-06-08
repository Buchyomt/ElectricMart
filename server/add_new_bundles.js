const mongoose = require('mongoose');
const Product = require('./models/Product');
const dns = require('dns');
require('dotenv').config();

dns.setServers(['1.1.1.1', '8.8.8.8']);

const newBundles = [
  {
    name: "G3.5 Premium Satin Gold Universal Series",
    description: "Architectural grade Satin Gold finish universal sockets and switches. Includes Single, Double, and 20A DP options. Perfect for luxury interior projects.",
    price: 45000,
    category: "Switches & Sockets",
    brand: "G3.5 Gold",
    image: "Gold Single Socket & Switch.jpeg",
    rating: 5.0,
    reviews: 12,
    isBulkPricing: true,
    bulkPricing: [
      { minQty: 10, discountedPrice: 42000 },
      { minQty: 25, discountedPrice: 40000 }
    ],
    spec: "Full Room Series (Gold)",
    deliveryTime: "Ships in 2-3 Days"
  },
  {
    name: "Cryspo England Gold-Trim White Luxury Series",
    description: "British Standard high-quality Sockets and Switches featuring a polished Gold Trim. Elegant design for professional office and residential spaces.",
    price: 38500,
    category: "Switches & Sockets",
    brand: "Cryspo England",
    image: "Single Socket & Switch.jpeg",
    rating: 4.9,
    reviews: 8,
    isBulkPricing: true,
    bulkPricing: [
      { minQty: 10, discountedPrice: 36000 },
      { minQty: 25, discountedPrice: 34500 }
    ],
    spec: "Gold-Trim Design",
    deliveryTime: "In Stock"
  },
  {
    name: "VWS Standard White Bakelite Modular Series",
    description: "Durable and efficient modular plate series. The industry standard for contractor installations. Flame retardant and high-impact resistance.",
    price: 22000,
    category: "Switches & Sockets",
    brand: "VWS",
    image: "White Single Socket & Switch .jpeg",
    rating: 4.8,
    reviews: 15,
    isBulkPricing: true,
    bulkPricing: [
      { minQty: 20, discountedPrice: 20000 },
      { minQty: 50, discountedPrice: 18500 }
    ],
    spec: "Bakelite Modular",
    deliveryTime: "Express Delivery"
  },
  {
    name: "KAK 3.5 Brushed Black Series",
    description: "Ultra-modern brushed gunmetal black finish switches and sockets. Designed for contemporary smart homes and premium interior spaces. Includes single, double, and gang switch variants.",
    price: 41000,
    category: "Switches & Sockets",
    brand: "KAK",
    image: "Double-Socket .jpeg",
    rating: 4.9,
    reviews: 6,
    isBulkPricing: true,
    bulkPricing: [
      { minQty: 10, discountedPrice: 38500 },
      { minQty: 25, discountedPrice: 36000 }
    ],
    spec: "Brushed Gunmetal Finish",
    deliveryTime: "Ships in 2-3 Days"
  },
  {
    name: "Cryspo England Chrome Silver Premium Series",
    description: "Polished mirror-chrome finish switch and socket series by Cryspo England. A sophisticated upgrade for professional office fit-outs and luxury apartments.",
    price: 35000,
    category: "Switches & Sockets",
    brand: "Cryspo England",
    image: "Single Sockets .jpeg",
    rating: 4.8,
    reviews: 9,
    isBulkPricing: true,
    bulkPricing: [
      { minQty: 10, discountedPrice: 33000 },
      { minQty: 25, discountedPrice: 31500 }
    ],
    spec: "Chrome Mirror Finish",
    deliveryTime: "In Stock"
  }
];


const seedNewBundles = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB for bundle injection...');

    for (const bundle of newBundles) {
      // Avoid duplicates
      const exists = await Product.findOne({ name: bundle.name });
      if (!exists) {
        await Product.create(bundle);
        console.log(`✅ Added Bundle: ${bundle.name}`);
      } else {
        console.log(`⏭️ Skipping (Already exists): ${bundle.name}`);
      }
    }

    process.exit();
  } catch (err) {
    console.error('Error adding bundles:', err);
    process.exit(1);
  }
};

seedNewBundles();
