const mongoose = require('mongoose');
const Product = require('./models/Product');
require('dotenv').config();

const products = [
  {
    name: "Pure Copper House Wire (1.5mm)",
    description: "High-quality 100% pure copper wire for domestic electrical installations. Flame retardant PVC insulation.",
    price: 18500,
    category: "Cables & Wires",
    brand: "Nexans",
    image: "Wires and Cables .jpeg",
    rating: 4.8,
    reviews: 124,
    isBulkPricing: true
  },
  {
    name: "Schneider 13A Single Socket",
    description: "Premium Schneider Electric single power socket with safety shutters and sleek design.",
    price: 3200,
    category: "Switches & Sockets",
    brand: "Schneider Electric",
    image: "Schneider Switches and Socket .jpeg",
    rating: 4.9,
    reviews: 86,
    isBulkPricing: false
  },
  {
    name: "Mercury 2.4kVA Hybrid Inverter",
    description: "Advanced hybrid inverter with pure sine wave output and built-in solar charge controller.",
    price: 245000,
    category: "Solar & Inverters",
    brand: "Mercury",
    image: "Mercury Inverters and batteries.jpeg",
    rating: 4.7,
    reviews: 42,
    isBulkPricing: true
  },
  {
    name: "AKT 100W LED Flood Light",
    description: "Ultra-bright energy-efficient LED flood light for outdoor security and warehouse lighting.",
    price: 12500,
    category: "Lighting & Fixtures",
    brand: "AKT",
    image: "AKT 100 watt Flood Light.jpeg",
    rating: 4.6,
    reviews: 65,
    isBulkPricing: false
  },
  {
    name: "Luminous 220Ah Tubular Battery",
    description: "Deep cycle tubular battery designed for long-lasting power backup in solar systems.",
    price: 185000,
    category: "Solar & Inverters",
    brand: "Luminous",
    image: "Solar and inverters .jpeg",
    rating: 4.8,
    reviews: 93,
    isBulkPricing: true
  },
  {
    name: "Clipsal 4-Way Extension Box",
    description: "Heavy-duty extension box with surge protection and individual switches for each socket.",
    price: 8500,
    category: "Switches & Sockets",
    brand: "Clipsal",
    image: "AKT Extension .jpeg",
    rating: 4.7,
    reviews: 112,
    isBulkPricing: false
  }
];

const seedDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB for seeding...');
    
    // Check if products already exist
    const count = await Product.countDocuments();
    if (count > 0) {
      console.log('Products already exist in DB. Skipping seed.');
    } else {
      await Product.insertMany(products);
      console.log('Successfully seeded 6 initial products!');
    }
    
    process.exit();
  } catch (err) {
    console.error('Seeding error:', err);
    process.exit(1);
  }
};

seedDB();
