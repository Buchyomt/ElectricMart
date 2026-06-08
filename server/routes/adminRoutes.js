const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const User = require('../models/User');
const Product = require('../models/Product');
const { protect, admin } = require('../middleware/authMiddleware');
const { generateWaybillPDF } = require('../utils/pdfService');

// @route   GET /api/admin/orders
// @desc    Get all orders (Admin only)
router.get('/orders', async (req, res) => {
  try {
    const orders = await Order.find({}).sort({ createdAt: -1 }).populate('userId', 'name email');
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @route   PATCH /api/admin/orders/:id/status
// @desc    Update order or payment status
router.patch('/orders/:id/status', async (req, res) => {
  try {
    const { orderStatus, paymentStatus } = req.body;
    const order = await Order.findById(req.params.id);
    
    if (order) {
      if (orderStatus) order.orderStatus = orderStatus;
      if (paymentStatus) order.paymentStatus = paymentStatus;
      
      const updatedOrder = await order.save();
      res.json(updatedOrder);
    } else {
      res.status(404).json({ message: 'Order not found' });
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @route   GET /api/admin/stats
// @desc    Get quick statistics for the admin dashboard
router.get('/stats', async (req, res) => {
  try {
    const totalOrders = await Order.countDocuments();
    const totalAmount = await Order.aggregate([
      { $match: { paymentStatus: 'paid' } },
      { $group: { _id: null, total: { $sum: '$total' } } }
    ]);
    const totalUsers = await User.countDocuments({ role: 'customer' });
    
    res.json({
      totalOrders,
      revenue: totalAmount[0] ? totalAmount[0].total : 0,
      totalUsers
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @route   GET /api/admin/low-stock
// @desc    Get products with stock <= 10 (Low Stock Alert)
router.get('/low-stock', async (req, res) => {
  try {
    const lowStockProducts = await Product.find(
      { stockQuantity: { $lte: 10 } },
      'name brand stockQuantity category image'
    ).sort({ stockQuantity: 1 });
    res.json(lowStockProducts);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @route   PATCH /api/admin/products/:id/stock
// @desc    Update product stock quantity
router.patch('/products/:id/stock', async (req, res) => {
  try {
    const { stockQuantity } = req.body;
    const product = await Product.findById(req.params.id);
    
    if (product) {
      product.stockQuantity = stockQuantity;
      const updatedProduct = await product.save();
      res.json(updatedProduct);
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @route   GET /api/admin/seed-test-data
router.get('/seed-test-data', async (req, res) => {
  try {
    const adminUser = await User.findOne({ role: 'admin' });
    if (!adminUser) return res.status(404).json({ message: 'Admin not found' });

    // Fetch any 2 real products from your DB
    const realProducts = await Product.find({}).limit(2);
    if (realProducts.length < 2) {
       return res.status(400).json({ message: 'You need at least 2 products in your shop before seeding test orders.' });
    }

    const dummyOrders = [
      {
        userId: adminUser._id,
        items: [
          { 
            productId: realProducts[0]._id,
            name: realProducts[0].name, 
            price: realProducts[0].price, 
            quantity: 5, 
            image: realProducts[0].image 
          },
          { 
            productId: realProducts[1]._id,
            name: realProducts[1].name, 
            price: realProducts[1].price, 
            quantity: 12, 
            image: realProducts[1].image 
          }
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
        specialInstructions: 'DUMMY_DATA'
      },
      {
        userId: adminUser._id,
        items: [
          { 
            productId: realProducts[1]._id,
            name: realProducts[1].name, 
            price: realProducts[1].price, 
            quantity: 2, 
            image: realProducts[1].image 
          }
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
        specialInstructions: 'DUMMY_DATA'
      }
    ];

    // Recalculate totals based on real product prices
    dummyOrders.forEach(order => {
      order.total = order.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    });

    await Order.insertMany(dummyOrders);
    res.send('<h1>Success!</h1><p>2 Sample Orders have been created using your REAL products. Refresh your Admin Dashboard to see them and test the Waybill generator.</p>');
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @route   GET /api/admin/users
// @desc    Admin: Get all users
router.get('/users', async (req, res) => {
  try {
    const users = await User.find({}).select('-password -otp -otpExpiry').sort({ createdAt: -1 });
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @route   PATCH /api/admin/users/:id/trade-level
// @desc    Admin: Update a user's trade tier
router.patch('/users/:id/trade-level', async (req, res) => {
  const { tradeLevel } = req.body;
  const validLevels = ['retail', 'trade', 'wholesale', 'vip'];
  if (!validLevels.includes(tradeLevel)) {
    return res.status(400).json({ message: 'Invalid trade level.' });
  }
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { tradeLevel },
      { new: true }
    ).select('-password -otp -otpExpiry');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @route   GET /api/admin/orders/:id/waybill
// @desc    Admin: Download PDF waybill for an order
router.get('/orders/:id/waybill', async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });
    const pdfBuffer = await generateWaybillPDF(order);
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="waybill-${order._id.toString().slice(-8).toUpperCase()}.pdf"`,
      'Content-Length': pdfBuffer.length,
    });
    res.end(pdfBuffer);
  } catch (err) {
    console.error('Waybill PDF error:', err);
    res.status(500).json({ message: 'Failed to generate waybill PDF' });
  }
});

// @route   GET /api/admin/seed-products
// @desc    One-time: Insert 20 new products into the database
// NOTE: Delete or protect this route after use!
router.get('/seed-products', async (req, res) => {
  try {
    const newProducts = [
      // --- Cables & Wires ---
      { name: "2.5mm Twin & Earth Cable (100m)", description: "Standard flat twin & earth cable for domestic wiring circuits.", price: 22000, category: "Cables & Wires", brand: "Kabelmetal", image: "https://images.unsplash.com/photo-1586864387967-d02ef85d93e8?auto=format&fit=crop&w=500&q=60", rating: 4.8, reviews: 215, stockQuantity: 80 },
      { name: "16mm 4-Core Armoured Cable (per meter)", description: "Heavy-duty SWA cable for underground and industrial mains distribution.", price: 6500, category: "Cables & Wires", brand: "Coleman", image: "https://images.unsplash.com/photo-1534224039826-c7a0eda0e6b3?auto=format&fit=crop&w=500&q=60", rating: 4.9, reviews: 88, stockQuantity: 500 },
      { name: "Cat6 Ethernet Network Cable (305m Box)", description: "High-speed Cat6 UTP cable for gigabit network installations.", price: 45000, category: "Cables & Wires", brand: "D-Link", image: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=500&q=60", rating: 4.6, reviews: 156, stockQuantity: 25 },
      { name: "6mm Single Core Earth Cable (100m)", description: "Green/Yellow PVC insulated cable for earth bonding and grounding.", price: 14000, category: "Cables & Wires", brand: "Nigerchin", image: "https://images.unsplash.com/photo-1568992687947-868a62a9f521?auto=format&fit=crop&w=500&q=60", rating: 4.7, reviews: 92, stockQuantity: 60 },

      // --- Solar & Inverters ---
      { name: "5kVA Pure Sine Wave Hybrid Inverter", description: "48V hybrid inverter with built-in 80A MPPT solar charge controller.", price: 420000, category: "Solar & Inverters", brand: "Felicity Solar", image: "https://images.unsplash.com/photo-1509391366360-2e959784a276?auto=format&fit=crop&w=500&q=60", rating: 4.9, reviews: 64, stockQuantity: 12 },
      { name: "550W Monocrystalline Solar Panel", description: "High-efficiency half-cell monocrystalline panel for maximum yield.", price: 85000, category: "Solar & Inverters", brand: "Jinko Solar", image: "https://images.unsplash.com/photo-1508514177221-188b1cf16e9d?auto=format&fit=crop&w=500&q=60", rating: 4.8, reviews: 310, stockQuantity: 40 },
      { name: "48V 100Ah Lithium-Ion Battery", description: "Deep cycle LiFePO4 battery with integrated BMS for solar storage.", price: 850000, category: "Solar & Inverters", brand: "Pylontech", image: "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=500&q=60", rating: 5.0, reviews: 45, stockQuantity: 8 },
      { name: "60A MPPT Solar Charge Controller", description: "Smart charge controller with LCD display and 99% tracking efficiency.", price: 65000, category: "Solar & Inverters", brand: "Epever", image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=500&q=60", rating: 4.6, reviews: 112, stockQuantity: 20 },

      // --- Lighting & Fixtures ---
      { name: "50W LED Street Light Head", description: "Weatherproof IP65 LED street light for estate roads and perimeter security.", price: 28000, category: "Lighting & Fixtures", brand: "Philips", image: "https://images.unsplash.com/photo-1565043666747-69f6646db940?auto=format&fit=crop&w=500&q=60", rating: 4.7, reviews: 185, stockQuantity: 35 },
      { name: "60x60cm Suspended LED Office Panel (40W)", description: "Ultra-slim daylight LED panel for suspended office ceilings.", price: 12500, category: "Lighting & Fixtures", brand: "Osram", image: "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=500&q=60", rating: 4.5, reviews: 240, stockQuantity: 50 },
      { name: "150W Industrial UFO High Bay LED", description: "Heavy-duty high bay light for warehouses and factory floors.", price: 45000, category: "Lighting & Fixtures", brand: "Sosen", image: "https://images.unsplash.com/photo-1518712683939-9bebc418a0e3?auto=format&fit=crop&w=500&q=60", rating: 4.8, reviews: 76, stockQuantity: 18 },
      { name: "Smart WiFi Color Changing Bulb E27", description: "RGB+W smart bulb controllable via app and voice assistants.", price: 6500, category: "Lighting & Fixtures", brand: "Tuya", image: "https://images.unsplash.com/photo-1550989460-0adf9ea622e2?auto=format&fit=crop&w=500&q=60", rating: 4.4, reviews: 420, stockQuantity: 100 },

      // --- Switches & Sockets ---
      { name: "Smart Touch WiFi 2-Gang Switch", description: "Tempered glass smart touch switch compatible with Alexa and Google Home.", price: 15000, category: "Switches & Sockets", brand: "Sonoff", image: "https://images.unsplash.com/photo-1558002038-1055907df827?auto=format&fit=crop&w=500&q=60", rating: 4.7, reviews: 198, stockQuantity: 45 },
      { name: "Metal Clad 13A Double Socket", description: "Rugged steel surface-mounted double socket for workshops and garages.", price: 5500, category: "Switches & Sockets", brand: "MK Electric", image: "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=500&q=60", rating: 4.9, reviews: 145, stockQuantity: 70 },
      { name: "USB Wall Socket Plate (Dual USB)", description: "Standard 13A double socket with integrated dual USB fast-charging ports.", price: 8500, category: "Switches & Sockets", brand: "Schneider Electric", image: "https://images.unsplash.com/photo-1544724569-5f546fd6f2b6?auto=format&fit=crop&w=500&q=60", rating: 4.8, reviews: 312, stockQuantity: 60 },
      { name: "45A Cooker Control Unit", description: "Heavy-duty double pole switch with neon indicator for electric cookers.", price: 12000, category: "Switches & Sockets", brand: "Legrand", image: "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=500&q=60", rating: 4.6, reviews: 88, stockQuantity: 30 },

      // --- Distribution & Protection ---
      { name: "63A 3-Phase Distribution Board (8-Way)", description: "Metal enclosure TPN distribution board for commercial load balancing.", price: 55000, category: "Distribution & Protection", brand: "Hager", image: "https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?auto=format&fit=crop&w=500&q=60", rating: 4.8, reviews: 54, stockQuantity: 10 },
      { name: "32A Single Pole MCB (Type C)", description: "Miniature circuit breaker for ring mains and socket protection.", price: 2500, category: "Distribution & Protection", brand: "ABB", image: "https://images.unsplash.com/photo-1555664424-778a1e5e1b48?auto=format&fit=crop&w=500&q=60", rating: 4.9, reviews: 450, stockQuantity: 200 },
      { name: "100A 4-Pole Manual Changeover Switch", description: "Transfer switch for safely alternating between grid and generator.", price: 35000, category: "Distribution & Protection", brand: "Havells", image: "https://images.unsplash.com/photo-1581092335397-9583eb92d232?auto=format&fit=crop&w=500&q=60", rating: 4.7, reviews: 125, stockQuantity: 15 },
      { name: "Whole House Surge Protector (SPD Type 2)", description: "Type 2 surge protection device to safeguard electronics from voltage spikes.", price: 42000, category: "Distribution & Protection", brand: "Schneider Electric", image: "https://images.unsplash.com/photo-1563207153-f403bf289096?auto=format&fit=crop&w=500&q=60", rating: 4.9, reviews: 210, stockQuantity: 22 }
    ];

    const result = await Product.insertMany(newProducts);
    res.status(201).send(`
      <h2 style="font-family:sans-serif;color:green;">✅ ${result.length} Products Added Successfully!</h2>
      <p style="font-family:sans-serif;">Refresh your Shop page to see the new products.</p>
      <p style="font-family:sans-serif;color:red;"><strong>Important:</strong> Remove or protect this endpoint now that seeding is done.</p>
    `);
  } catch (err) {
    res.status(500).json({ message: 'Seeding failed: ' + err.message });
  }
});

module.exports = router;
