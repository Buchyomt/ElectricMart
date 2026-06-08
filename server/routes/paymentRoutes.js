const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const Order = require('../models/Order');

// @route   POST /api/payments/webhook
// @desc    Paystack Webhook to verify and update order status
router.post('/webhook', async (req, res) => {
  const secret = process.env.PAYSTACK_SECRET_KEY;

  if (!secret) {
    console.error('PAYSTACK_SECRET_KEY not found in environment');
    return res.status(500).send('Configuration Error');
  }

  // Verify Paystack Signature
  const hash = crypto.createHmac('sha512', secret).update(JSON.stringify(req.body)).digest('hex');
  
  if (hash !== req.headers['x-paystack-signature']) {
    console.warn('Invalid Paystack Signature');
    return res.status(400).send('Invalid Signature');
  }

  const event = req.body;

  // Handle successful charge
  if (event.event === 'charge.success') {
    const { reference, metadata } = event.data;
    const orderId = metadata.order_id;

    try {
      const order = await Order.findById(orderId);
      if (order) {
        order.paymentStatus = 'paid';
        await order.save();
        console.log(`Order ${orderId} marked as PAID via Webhook. Reference: ${reference}`);
      }
    } catch (err) {
      console.error('Error updating order via webhook:', err);
    }
  }

  res.status(200).send('Webhook Received');
});

module.exports = router;
