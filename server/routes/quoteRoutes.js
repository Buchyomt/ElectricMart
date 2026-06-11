const express = require('express');
const router = express.Router();
const Quote = require('../models/Quote');
const Order = require('../models/Order');
const User = require('../models/User');
const { protect } = require('../middleware/authMiddleware');
const { generateQuotePDF } = require('../utils/pdfService');

const DELIVERY_FEES = {
  'Island — Lekki / VI / Ikoyi': 8500,
  'Mainland — Ikeja / Surulere': 4000,
  'Outskirts — Ajah / Ikorodu': 12000,
};

// @route   GET /api/quotes
// @desc    Get all quotes for the logged-in user
router.get('/', protect, async (req, res) => {
  try {
    const quotes = await Quote.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json(quotes);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @route   POST /api/quotes
// @desc    Submit a new RFQ
router.post('/', protect, async (req, res) => {
  const { projectName, location, notes, items } = req.body;

  if (!items || items.length === 0) {
    return res.status(400).json({ message: 'Quote must have at least one item.' });
  }

  try {
    const subtotal = items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
    const deliveryFee = DELIVERY_FEES[location] || 0;
    const vat = subtotal * 0.075;
    const total = subtotal + deliveryFee + vat;

    // Sanitize items: only keep productId if it's a valid MongoDB ObjectId hex string
    // This prevents Cast errors from numeric IDs that come from local inventory data
    const sanitizedItems = items.map(item => {
      const { productId, ...rest } = item;
      const isValidObjectId = typeof productId === 'string' && /^[a-f\d]{24}$/i.test(productId);
      return isValidObjectId ? { productId, ...rest } : { ...rest };
    });

    const quote = new Quote({
      user: req.user._id,
      projectName,
      location,
      notes,
      items: sanitizedItems,
      subtotal,
      deliveryFee,
      vat,
      total,
    });

    const saved = await quote.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// @route   GET /api/quotes/:id
// @desc    Get a single quote by ID
router.get('/:id', protect, async (req, res) => {
  try {
    const quote = await Quote.findById(req.params.id);
    if (!quote) return res.status(404).json({ message: 'Quote not found' });
    if (quote.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(401).json({ message: 'Not authorized' });
    }
    res.json(quote);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @route   POST /api/quotes/:id/convert
// @desc    Convert an approved quote into an Order
router.post('/:id/convert', protect, async (req, res) => {
  try {
    const quote = await Quote.findById(req.params.id);
    if (!quote) return res.status(404).json({ message: 'Quote not found' });
    if (quote.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized' });
    }
    if (quote.status !== 'approved') {
      return res.status(400).json({ message: 'Only approved quotes can be converted to orders.' });
    }

    // Use admin-adjusted items if available, else original items
    const itemsToOrder =
      quote.adminResponse && quote.adminResponse.adjustedItems && quote.adminResponse.adjustedItems.length > 0
        ? quote.adminResponse.adjustedItems
        : quote.items;

    const shippingAddress = req.body?.shippingAddress || {
      fullName: req.user.name,
      phone: req.user.phone || '',
      email: req.user.email,
      address: quote.location,
      zone: quote.location,
    };

    const orderItems = itemsToOrder.map((i) => ({
      productId: i.productId,
      name: i.name,
      image: i.image,
      price: i.unitPrice,
      quantity: i.quantity,
    }));

    const subtotal = orderItems.reduce((sum, i) => sum + i.price * i.quantity, 0);
    const vat = subtotal * 0.075;
    const total = (quote.adminResponse && quote.adminResponse.adjustedTotal) || quote.total;

    const order = new Order({
      userId: req.user._id,
      items: orderItems,
      shippingAddress,
      deliveryOption: 'Site Delivery',
      subtotal,
      shippingFee: quote.deliveryFee,
      vat,
      total,
      specialInstructions: `Converted from Quote #${quote._id}`,
    });

    const createdOrder = await order.save();
    quote.status = 'ordered';
    await quote.save();
    res.status(201).json({ message: 'Quote converted to order!', orderId: createdOrder._id });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ─── Admin Quote Endpoints ─────────────────────────────────────────────────────

// @route   GET /api/quotes/admin/all
// @desc    Admin: Get all submitted quotes
router.get('/admin/all', protect, async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Admins only' });
  }
  try {
    const quotes = await Quote.find({}).populate('user', 'name email phone').sort({ createdAt: -1 });
    res.json(quotes);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @route   PATCH /api/quotes/:id/respond
// @desc    Admin: Respond to a quote with adjusted pricing
router.patch('/:id/respond', protect, async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Admins only' });
  }
  const { status, message, adjustedItems } = req.body;

  try {
    const quote = await Quote.findById(req.params.id);
    if (!quote) return res.status(404).json({ message: 'Quote not found' });

    quote.status = status || 'reviewing';
    quote.adminResponse = {
      message,
      adjustedItems: adjustedItems || [],
      adjustedTotal: adjustedItems
        ? adjustedItems.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0) * 1.075 + quote.deliveryFee
        : null,
      respondedAt: new Date(),
      respondedBy: req.user._id,
    };

    const updated = await quote.save();
    res.json(updated);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// @route   GET /api/quotes/:id/pdf
// @desc    Download PDF for a quote
router.get('/:id/pdf', protect, async (req, res) => {
  try {
    const quote = await Quote.findById(req.params.id);
    if (!quote) return res.status(404).json({ message: 'Quote not found' });
    if (quote.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(401).json({ message: 'Not authorized' });
    }
    const user = await User.findById(quote.user).select('name email companyName');
    const pdfBuffer = await generateQuotePDF(quote, user || { name: 'Customer', email: '' });
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="quote-${quote._id.toString().slice(-8).toUpperCase()}.pdf"`,
      'Content-Length': pdfBuffer.length,
    });
    res.end(pdfBuffer);
  } catch (err) {
    console.error('Quote PDF error:', err);
    res.status(500).json({ message: 'Failed to generate quote PDF' });
  }
});

module.exports = router;
