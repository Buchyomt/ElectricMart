const mongoose = require('mongoose');
const Product = require('./models/Product');
const dotenv = require('dotenv');

dotenv.config();

mongoose.connect(process.env.MONGO_URI)
.then(() => console.log('MongoDB connected'))
.catch(err => console.log(err));

const newProducts = [
  {
    name: "Solar Floodlight",
    price: 8000,
    description: "High efficiency solar floodlight for outdoor lighting, providing bright illumination, energy saving and durable performance.",
    category: "Outdoor Lighting",
    stock: 20,
    image: "Solar floodlight.jpeg",
    spec: "Solar Powered",
    deliveryTime: "1-3 days",
    isBulkPricing: true,
    brand: "Generic"
  },
  {
    name: "18Watts Liper/Crystal Bulkhead Fitting",
    price: 10000,
    description: "18W crystal bulkhead fitting for elegant wall or ceiling lighting, offering clear and bright light distribution.",
    category: "Lighting",
    stock: 15,
    image: "18watts liper-crystal bulkhead fitting.jpeg",
    spec: "18 Watts",
    deliveryTime: "1-3 days",
    isBulkPricing: true,
    brand: "Liper"
  },
  {
    name: "Extension Cord",
    price: 3500,
    description: "Durable and safe multi-socket extension cord for everyday home and office use.",
    category: "Electrical Accessories",
    stock: 50,
    image: "Extension cord .jpeg",
    spec: "Multi-socket",
    deliveryTime: "1-3 days",
    isBulkPricing: true,
    brand: "Generic"
  },
  {
    name: "COB Light",
    price: 1500,
    description: "Bright and energy-efficient COB downlight for modern interior illumination and decoration.",
    category: "Lighting",
    stock: 100,
    image: "COB light.jpeg",
    spec: "High Brightness",
    deliveryTime: "1-3 days",
    isBulkPricing: true,
    brand: "Generic"
  },
  {
    name: "3 in 1 Iron Pendant",
    price: 58000,
    description: "Stylish 3 in 1 iron pendant light for dining rooms, kitchen islands, and modern spaces.",
    category: "Lighting",
    stock: 10,
    image: "3 in 1 iron pendant.jpeg",
    spec: "Iron Build",
    deliveryTime: "1-3 days",
    isBulkPricing: true,
    brand: "Generic"
  },
  {
    name: "Monkey Light",
    price: 65000,
    description: "Unique and creative monkey design pendant light, perfect for adding character to living rooms, bedrooms, or cafes.",
    category: "Lighting",
    stock: 5,
    image: "Monkey light.jpeg",
    spec: "Resin Design",
    deliveryTime: "1-3 days",
    isBulkPricing: false,
    brand: "Generic"
  }
];

const seedProducts = async () => {
  try {
    for (let product of newProducts) {
      const existing = await Product.findOne({ name: product.name });
      if (existing) {
        console.log(`Product ${product.name} already exists. Skipping.`);
      } else {
        await Product.create(product);
        console.log(`Added ${product.name}`);
      }
    }
    console.log('Done!');
    process.exit();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

seedProducts();
