const express = require('express');
const router = express.Router();
const Wishlist = require('../models/Wishlist');
const { protect } = require('../middleware/authMiddleware');

// @route   GET /api/wishlist
// @desc    Get user wishlist
router.get('/', protect, async (req, res) => {
  try {
    let wishlist = await Wishlist.findOne({ user: req.user._id }).populate('products');
    if (!wishlist) {
      wishlist = await Wishlist.create({ user: req.user._id, products: [] });
    }
    res.json(wishlist);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @route   POST /api/wishlist/:productId
// @desc    Add/Remove product from wishlist (Toggle)
router.post('/:productId', protect, async (req, res) => {
  try {
    const productId = req.params.productId;
    let wishlist = await Wishlist.findOne({ user: req.user._id });
    
    if (!wishlist) {
      wishlist = await Wishlist.create({ user: req.user._id, products: [productId] });
    } else {
      const index = wishlist.products.indexOf(productId);
      if (index === -1) {
        wishlist.products.push(productId);
      } else {
        wishlist.products.splice(index, 1);
      }
      await wishlist.save();
    }
    
    await wishlist.populate('products');
    res.json(wishlist);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
