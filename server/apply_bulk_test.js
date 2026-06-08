const mongoose = require('mongoose');
const Product = require('./models/Product');
const dns = require('dns');
require('dotenv').config();

dns.setServers(['1.1.1.1', '8.8.8.8']);
console.log('🌐 Using DNS resolvers: 1.1.1.1, 8.8.8.8');


const updateProduct = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB for bulk updates...');

    const itemsToUpdate = [
      {
        query: { name: { $regex: /Copper House Wire/i } },
        update: {
          isBulkPricing: true,
          bulkPricing: [
            { minQty: 20, discountedPrice: 17000 },
            { minQty: 50, discountedPrice: 15500 },
            { minQty: 100, discountedPrice: 14000 }
          ]
        }
      },
      {
        query: { name: { $regex: /Socket/i } },
        update: {
          isBulkPricing: true,
          bulkPricing: [
            { minQty: 50, discountedPrice: 2800 },
            { minQty: 100, discountedPrice: 2500 }
          ]
        }
      },
      {
        query: { name: { $regex: /Inverter/i } },
        update: {
          isBulkPricing: true,
          bulkPricing: [
            { minQty: 5, discountedPrice: 235000 }
          ]
        }
      },
      {
        query: { name: { $regex: /Battery/i } },
        update: {
          isBulkPricing: true,
          bulkPricing: [
            { minQty: 5, discountedPrice: 178000 }
          ]
        }
      }
    ];

    for (const item of itemsToUpdate) {
      const result = await Product.findOneAndUpdate(item.query, item.update, { returnDocument: 'after' });
      if (result) {
        console.log(`✅ Updated: "${result.name}" with ${result.bulkPricing.length} tiers.`);
      } else {
        console.log(`❌ FAILED: No product found matching ${JSON.stringify(item.query)}`);
      }
    }

    process.exit();
  } catch (err) {
    console.error('Update error:', err);
    process.exit(1);
  }
};

updateProduct();
