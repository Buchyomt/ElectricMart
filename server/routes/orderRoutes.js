const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const User = require('../models/User');
const { protect } = require('../middleware/authMiddleware');
const { generateInvoicePDF } = require('../utils/pdfService');

// @route   GET /api/orders
// @desc    Get user orders
router.get('/', protect, async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.user._id }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @route   POST /api/orders
// @desc    Create new order with Server-Side Price Verification
router.post('/', protect, async (req, res) => {
  const { 
    items, 
    shippingAddress, 
    deliveryOption, 
    shippingFee, 
    vat, 
    specialInstructions 
  } = req.body;

  try {
    if (!items || items.length === 0) {
      return res.status(400).json({ message: 'No items in order' });
    }

    // --- Server-Side Price & Bulk Discount Verification ---
    let calculatedSubtotal = 0;
    const verifiedItems = [];

    for (const item of items) {
      const product = await Product.findById(item.productId);
      if (!product) continue;

      // --- Stock Check ---
      if (product.stockQuantity !== undefined && product.stockQuantity < item.quantity) {
        return res.status(400).json({ 
          message: `Insufficient stock for "${product.name}". Only ${product.stockQuantity} units available.` 
        });
      }

      let itemPrice = product.price;

      // Check for Bulk Pricing Tiers
      if (product.isBulkPricing && product.bulkPricing && product.bulkPricing.length > 0) {
        const tiers = [...product.bulkPricing].sort((a, b) => b.minQty - a.minQty);
        const applicableTier = tiers.find(t => item.quantity >= t.minQty);
        if (applicableTier) {
          itemPrice = applicableTier.discountedPrice;
          console.log(`Bulk Discount applied for ${product.name}: ₦${itemPrice} (Qty: ${item.quantity})`);
        }
      }

      // Apply Trade-Level Discount on top of bulk pricing
      const tradeLevelDiscounts = { retail: 0, trade: 0.05, wholesale: 0.10, vip: 0.15 };
      const tradeDiscount = tradeLevelDiscounts[req.user.tradeLevel] || 0;
      if (tradeDiscount > 0) {
        itemPrice = itemPrice * (1 - tradeDiscount);
        console.log(`Trade Discount (${req.user.tradeLevel}) applied for ${product.name}: ₦${itemPrice.toFixed(2)}`);
      }

      const itemTotal = itemPrice * item.quantity;
      calculatedSubtotal += itemTotal;

      verifiedItems.push({
        productId: product._id,
        name: product.name,
        image: product.image,
        price: itemPrice,
        quantity: item.quantity
      });
    }

    const calculatedVat = calculatedSubtotal * 0.075; // 7.5% VAT standard in Nigeria
    const calculatedTotal = calculatedSubtotal + calculatedVat + (shippingFee || 0);

    const order = new Order({
      userId: req.user._id,
      items: verifiedItems,
      shippingAddress,
      deliveryOption,
      subtotal: calculatedSubtotal,
      shippingFee: shippingFee || 0,
      vat: calculatedVat,
      total: calculatedTotal,
      specialInstructions
    });

    const createdOrder = await order.save();

    // --- Auto-Decrement Stock ---
    for (const item of verifiedItems) {
      await Product.findByIdAndUpdate(item.productId, {
        $inc: { stockQuantity: -item.quantity }
      });
      console.log(`Stock updated: -${item.quantity} units for ${item.name}`);
    }

    // Clear user cart after order
    await Cart.findOneAndUpdate({ userId: req.user._id }, { items: [] });

    res.status(201).json(createdOrder);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @route   GET /api/orders/:id
// @desc    Get order by ID
router.get('/:id', protect, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });
    
    // Check ownership
    if (order.userId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(401).json({ message: 'Not authorized' });
    }

    res.json(order);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @route   PATCH /api/orders/:id/pay
// @desc    Update order payment status to paid
router.patch('/:id/pay', protect, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });
    
    if (order.userId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(401).json({ message: 'Not authorized' });
    }

    order.paymentStatus = 'paid';
    
    const updatedOrder = await order.save();
    res.json(updatedOrder);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @route   GET /api/orders/track/:id
// @desc    Public tracking endpoint (supports full ID or 6-char suffix)
router.get('/track/:id', async (req, res) => {
  try {
    const searchId = req.params.id;
    let order;

    if (searchId.length === 24) {
      order = await Order.findById(searchId);
    }

    if (!order) {
      const allOrders = await Order.find({});
      order = allOrders.find(o => o._id.toString().toUpperCase().endsWith(searchId.toUpperCase()));
    }

    if (!order) return res.status(404).json({ message: 'Order not found' });

    const trackingInfo = {
      orderId: order._id,
      status: order.orderStatus,
      paymentStatus: order.paymentStatus,
      deliveryOption: order.deliveryOption,
      updatedAt: order.updatedAt,
      createdAt: order.createdAt,
      zone: order.shippingAddress.zone,
      trackingHistory: order.trackingHistory || []
    };
    
    res.json(trackingInfo);
  } catch (err) {
    res.status(500).json({ message: 'Error processing tracking request' });
  }
});

// @route   PATCH /api/orders/:id/status
// @desc    Admin: update order status and log to tracking history
router.patch('/:id/status', protect, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }

    const { status, note } = req.body;
    const validStatuses = ['confirmed', 'packed', 'shipping', 'delivered', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status value' });
    }

    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });

    order.orderStatus = status;
    order.trackingHistory.push({
      status,
      note: note || `Order status updated to ${status}`,
      timestamp: new Date()
    });

    const updated = await order.save();
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @route   GET /api/orders/:id/invoice
// @desc    Download PDF invoice for a specific order
router.get('/:id/invoice', protect, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });
    if (order.userId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(401).json({ message: 'Not authorized' });
    }
    const user = await User.findById(order.userId).select('name email companyName');
    const pdfBuffer = await generateInvoicePDF(order, user || { name: 'Customer', email: '' });
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="invoice-${order._id.toString().slice(-8).toUpperCase()}.pdf"`,
      'Content-Length': pdfBuffer.length,
    });
    res.end(pdfBuffer);
  } catch (err) {
    console.error('Invoice PDF error:', err);
    res.status(500).json({ message: 'Failed to generate invoice PDF' });
  }
});

module.exports = router;
