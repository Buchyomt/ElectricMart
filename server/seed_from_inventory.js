const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const Product = require('./models/Product');
const dns = require('dns');
require('dotenv').config();

// Set DNS servers for MongoDB Atlas connection in this environment
dns.setServers(['1.1.1.1', '8.8.8.8']);

const runSeeder = async () => {
  try {
    console.log('Connecting to MongoDB Atlas...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected successfully!');

    // Read the inventory.json file
    const inventoryPath = path.join(__dirname, '../src/data/inventory.json');
    const rawData = fs.readFileSync(inventoryPath, 'utf8');
    const products = JSON.parse(rawData);

    console.log(`Found ${products.length} products in inventory.json. Synchronizing...`);

    // Clean and upsert each product
    for (const item of products) {
      const productData = {
        name: item.name,
        brand: item.brand || 'Generic',
        price: item.price || 0,
        rating: item.rating || 0,
        reviews: item.reviews || 0,
        image: item.image,
        spec: item.spec || '',
        deliveryTime: item.deliveryTime || 'Delivers in 24hrs',
        isBulkPricing: item.isBulkPricing || false,
        category: item.category || 'Uncategorized',
        stockQuantity: item.stockQuantity !== undefined ? item.stockQuantity : 100
      };

      // Upsert by name to update existing details or add new products
      await Product.findOneAndUpdate(
        { name: productData.name },
        productData,
        { upsert: true, new: true }
      );
    }

    console.log('✅ Successfully synchronized all products from inventory.json to MongoDB!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Failed to seed products:', error);
    process.exit(1);
  }
};

runSeeder();
