const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Order = require('./models/Order');
const User = require('./models/User');

dotenv.config();

const seedAdminData = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // Get the admin user to attach orders to
    const adminUser = await User.findOne({ role: 'admin' });
    if (!adminUser) {
      console.log('Admin user not found. Please promote yourself first.');
      process.exit(1);
    }

    // Clear existing dummy orders if needed
    // await Order.deleteMany({ specialInstructions: 'DUMMY_DATA' });

    const dummyOrders = [
      {
        userId: adminUser._id,
        items: [
          { name: '16mm 4-Core Armoured Cable', price: 12500, quantity: 50, image: '' },
          { name: ' Schneider MasterPact MTZ2', price: 450000, quantity: 1, image: '' }
        ],
        shippingAddress: {
          fullName: 'Mainland Engineering Sites',
          phone: '0812 345 6789',
          address: 'Plot 12, Ikeja Industrial Estate, Lagos',
          zone: 'South West'
        },
        deliveryOption: 'Site Delivery',
        paymentStatus: 'paid',
        orderStatus: 'confirmed',
        total: 1075000,
        specialInstructions: 'DUMMY_DATA'
      },
      {
        userId: adminUser._id,
        items: [
          { name: 'Legrand White Socket (Single)', price: 2500, quantity: 100, image: '' },
          { name: 'ABB 63A MCB TP', price: 18000, quantity: 12, image: '' }
        ],
        shippingAddress: {
          fullName: 'Chuka & Sons Electricals',
          phone: '0901 222 3333',
          address: 'Alaba International Market, Ojo',
          zone: 'South West'
        },
        deliveryOption: 'Store Pickup',
        paymentStatus: 'pending',
        orderStatus: 'confirmed',
        total: 466000,
        specialInstructions: 'DUMMY_DATA'
      }
    ];

    await Order.insertMany(dummyOrders);
    console.log('✅ SUCCESS: 2 Dummy Orders created for testing the Admin Dashboard.');
    process.exit(0);
  } catch (err) {
    console.error('Seeding error:', err);
    process.exit(1);
  }
};

seedAdminData();
