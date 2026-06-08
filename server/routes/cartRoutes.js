const express = require('express');
const router = express.Router();
const Cart = require('../models/Cart');
const { protect } = require('../middleware/authMiddleware');

// @route   GET /api/cart
// @desc    Get user cart
router.get('/', protect, async (req, res) => {
  try {
    let cart = await Cart.findOne({ userId: req.user._id }).populate('items.productId');
    if (!cart) {
      cart = await Cart.create({ userId: req.user._id, items: [] });
    }
    res.json(cart);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @route   POST /api/cart
// @desc    Add item to cart or update quantity
router.post('/', protect, async (req, res) => {
  const { productId, quantity } = req.body;
  try {
    let cart = await Cart.findOne({ userId: req.user._id });
    if (!cart) {
      cart = new Cart({ userId: req.user._id, items: [] });
    }

    const itemIndex = cart.items.findIndex(item => item.productId.toString() === productId);
    if (itemIndex > -1) {
      // Update existing item quantity
      cart.items[itemIndex].quantity += (quantity || 1);
    } else {
      // Add new item
      cart.items.push({ productId, quantity: quantity || 1 });
    }

    await cart.save();
    const updatedCart = await cart.populate('items.productId');
    res.json(updatedCart);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @route   PUT /api/cart/:productId
// @desc    Update item quantity in cart
router.put('/:productId', protect, async (req, res) => {
  const { quantity } = req.body;
  try {
    const cart = await Cart.findOne({ userId: req.user._id });
    if (!cart) return res.status(404).json({ message: 'Cart not found' });

    const itemIndex = cart.items.findIndex(item => item.productId.toString() === req.params.productId);
    if (itemIndex > -1) {
      cart.items[itemIndex].quantity = quantity;
      await cart.save();
      const updatedCart = await cart.populate('items.productId');
      res.json(updatedCart);
    } else {
      res.status(404).json({ message: 'Item not found in cart' });
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @route   DELETE /api/cart/:productId
// @desc    Remove item from cart
router.delete('/:productId', protect, async (req, res) => {
  try {
    const cart = await Cart.findOne({ userId: req.user._id });
    if (!cart) return res.status(404).json({ message: 'Cart not found' });

    cart.items = cart.items.filter(item => item.productId.toString() !== req.params.productId);
    await cart.save();
    const updatedCart = await cart.populate('items.productId');
    res.json(updatedCart);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @route   DELETE /api/cart
// @desc    Clear cart
router.delete('/', protect, async (req, res) => {
  try {
    const cart = await Cart.findOne({ userId: req.user._id });
    if (cart) {
      cart.items = [];
      await cart.save();
    }
    res.json({ message: 'Cart cleared' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
