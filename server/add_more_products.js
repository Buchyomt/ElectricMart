const mongoose = require('mongoose');
const Product = require('./models/Product');
require('dotenv').config();

// Atlas free-tier clusters auto-pause after 60 days. Connection options below
// handle timeout gracefully.
const MONGO_OPTIONS = {
  serverSelectionTimeoutMS: 10000,
  socketTimeoutMS: 45000,
};

const newProducts = [
  // Cables & Wires
  { name: "2.5mm Twin & Earth Cable (100m)", description: "Standard flat twin and earth cable for domestic and light commercial wiring circuits.", price: 22000, category: "Cables & Wires", brand: "Kabelmetal", image: "https://images.unsplash.com/photo-1544724569-5f546fd6f2b6?auto=format&fit=crop&w=500&q=60", rating: 4.8, reviews: 215, isBulkPricing: true },
  { name: "16mm 4-Core Armoured Cable (per meter)", description: "Heavy-duty steel wire armoured (SWA) cable for underground and industrial mains distribution.", price: 6500, category: "Cables & Wires", brand: "Coleman", image: "https://images.unsplash.com/photo-1616423640778-28d1b53229bd?auto=format&fit=crop&w=500&q=60", rating: 4.9, reviews: 88, isBulkPricing: true },
  { name: "Cat6 Ethernet Network Cable (305m Box)", description: "High-speed Cat6 UTP cable for reliable gigabit network and data installations.", price: 45000, category: "Cables & Wires", brand: "D-Link", image: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=500&q=60", rating: 4.6, reviews: 156, isBulkPricing: true },
  { name: "6mm Single Core Earth Cable (100m)", description: "Green/Yellow PVC insulated single core cable for earth bonding and grounding.", price: 14000, category: "Cables & Wires", brand: "Nigerchin", image: "https://images.unsplash.com/photo-1563207153-f403bf289096?auto=format&fit=crop&w=500&q=60", rating: 4.7, reviews: 92, isBulkPricing: true },

  // Solar & Inverters
  { name: "5kVA Pure Sine Wave Hybrid Inverter", description: "Advanced 48V hybrid inverter with built-in 80A MPPT solar charge controller.", price: 420000, category: "Solar & Inverters", brand: "Felicity Solar", image: "https://images.unsplash.com/photo-1509391366360-2e959784a276?auto=format&fit=crop&w=500&q=60", rating: 4.9, reviews: 64, isBulkPricing: false },
  { name: "550W Monocrystalline Solar Panel", description: "High-efficiency half-cell monocrystalline solar panel for maximum power yield.", price: 85000, category: "Solar & Inverters", brand: "Jinko Solar", image: "https://images.unsplash.com/photo-1508514177221-188b1cf16e9d?auto=format&fit=crop&w=500&q=60", rating: 4.8, reviews: 310, isBulkPricing: true },
  { name: "48V 100Ah Lithium-Ion Battery", description: "Deep cycle LiFePO4 battery with integrated BMS for robust solar energy storage.", price: 850000, category: "Solar & Inverters", brand: "Pylontech", image: "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=500&q=60", rating: 5.0, reviews: 45, isBulkPricing: false },
  { name: "60A MPPT Solar Charge Controller", description: "Smart solar charge controller with LCD display and 99% tracking efficiency.", price: 65000, category: "Solar & Inverters", brand: "Epever", image: "https://images.unsplash.com/photo-1592833159057-6bc82697e887?auto=format&fit=crop&w=500&q=60", rating: 4.6, reviews: 112, isBulkPricing: false },

  // Lighting & Fixtures
  { name: "50W LED Street Light Head", description: "Weatherproof IP65 LED street light for estate roads and perimeter security.", price: 28000, category: "Lighting & Fixtures", brand: "Philips", image: "https://images.unsplash.com/photo-1521404172551-70e60805c6df?auto=format&fit=crop&w=500&q=60", rating: 4.7, reviews: 185, isBulkPricing: true },
  { name: "60x60cm Suspended LED Office Panel", description: "Ultra-slim 40W daylight LED panel for suspended acoustic office ceilings.", price: 12500, category: "Lighting & Fixtures", brand: "Osram", image: "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=500&q=60", rating: 4.5, reviews: 240, isBulkPricing: true },
  { name: "150W Industrial High Bay LED", description: "Heavy-duty UFO high bay light for warehouses and factory floors.", price: 45000, category: "Lighting & Fixtures", brand: "AKT", image: "https://images.unsplash.com/photo-1518712683939-9bebc418a0e3?auto=format&fit=crop&w=500&q=60", rating: 4.8, reviews: 76, isBulkPricing: true },
  { name: "Smart WiFi Color Changing Bulb", description: "E27 RGB+W smart bulb controllable via app and voice assistants.", price: 6500, category: "Lighting & Fixtures", brand: "Tuya", image: "https://images.unsplash.com/photo-1550989460-0adf9ea622e2?auto=format&fit=crop&w=500&q=60", rating: 4.4, reviews: 420, isBulkPricing: false },

  // Switches & Sockets
  { name: "Smart Touch WiFi 2-Gang Switch", description: "Tempered glass smart touch switch compatible with Alexa and Google Home.", price: 15000, category: "Switches & Sockets", brand: "Sonoff", image: "https://images.unsplash.com/photo-1558002038-1055907df827?auto=format&fit=crop&w=500&q=60", rating: 4.7, reviews: 198, isBulkPricing: true },
  { name: "Metal Clad 13A Double Socket", description: "Rugged steel surface-mounted double socket for workshops and garages.", price: 5500, category: "Switches & Sockets", brand: "MK Electric", image: "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=500&q=60", rating: 4.9, reviews: 145, isBulkPricing: true },
  { name: "USB Wall Socket Plate", description: "Standard 13A double socket with integrated dual USB fast-charging ports.", price: 8500, category: "Switches & Sockets", brand: "Schneider Electric", image: "https://images.unsplash.com/photo-1610452398451-b0db04b901fc?auto=format&fit=crop&w=500&q=60", rating: 4.8, reviews: 312, isBulkPricing: true },
  { name: "45A Cooker Control Unit", description: "Heavy-duty double pole switch with neon indicator for electric cookers and ovens.", price: 12000, category: "Switches & Sockets", brand: "Legrand", image: "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=500&q=60", rating: 4.6, reviews: 88, isBulkPricing: false },

  // Distribution & Protection
  { name: "63A 3-Phase Distribution Board (8-Way)", description: "Metal enclosure TPN distribution board for commercial load balancing.", price: 55000, category: "Distribution & Protection", brand: "Hager", image: "https://images.unsplash.com/photo-1544724569-5f546fd6f2b6?auto=format&fit=crop&w=500&q=60", rating: 4.8, reviews: 54, isBulkPricing: false },
  { name: "32A Single Pole MCB", description: "Miniature circuit breaker for standard ring mains and socket protection.", price: 2500, category: "Distribution & Protection", brand: "ABB", image: "https://images.unsplash.com/photo-1616423640778-28d1b53229bd?auto=format&fit=crop&w=500&q=60", rating: 4.9, reviews: 450, isBulkPricing: true },
  { name: "100A 4-Pole Changeover Switch", description: "Manual transfer switch for safely alternating between grid and generator power.", price: 35000, category: "Distribution & Protection", brand: "Havells", image: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=500&q=60", rating: 4.7, reviews: 125, isBulkPricing: false },
  { name: "Whole House Surge Protector (SPD)", description: "Type 2 surge protection device to safeguard sensitive electronics from voltage spikes.", price: 42000, category: "Distribution & Protection", brand: "Schneider Electric", image: "https://images.unsplash.com/photo-1563207153-f403bf289096?auto=format&fit=crop&w=500&q=60", rating: 4.9, reviews: 210, isBulkPricing: false }
];

const seedMoreProducts = async () => {
  try {
    console.log('Connecting to MongoDB Atlas...');
    await mongoose.connect(process.env.MONGO_URI, MONGO_OPTIONS);
    console.log('✅ Connected to MongoDB Atlas!');
    
    console.log(`Inserting ${newProducts.length} products...`);
    const result = await Product.insertMany(newProducts);
    console.log(`✅ Successfully added ${result.length} new products to the shop!`);
    
    process.exit(0);
  } catch (err) {
    if (err.code === 'ECONNREFUSED' || err.message?.includes('querySrv') || err.message?.includes('ECONNREFUSED')) {
      console.error('\n❌ CANNOT CONNECT TO MONGODB ATLAS');
      console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.error('Your Atlas free-tier cluster is PAUSED.');
      console.error('\nTo fix this:');
      console.error('  1. Go to https://cloud.mongodb.com');
      console.error('  2. Log in to your account');
      console.error('  3. Click on your Cluster (Cluster0)');
      console.error('  4. Click the "Resume" button');
      console.error('  5. Wait ~1 minute for it to start');
      console.error('  6. Run this script again: node add_more_products.js');
      console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    } else {
      console.error('Error adding products:', err.message);
    }
    process.exit(1);
  }
};

seedMoreProducts();
