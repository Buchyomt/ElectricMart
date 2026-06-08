const express = require('express');
const router = express.Router();
const Ticket = require('../models/Ticket');
const { protect } = require('../middleware/authMiddleware');

// @route   GET /api/tickets
// @desc    Get all tickets for logged-in user
router.get('/', protect, async (req, res) => {
  try {
    const query = req.user.role === 'admin' ? {} : { userId: req.user._id };
    const tickets = await Ticket.find(query).sort({ updatedAt: -1 });
    res.json(tickets);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @route   POST /api/tickets
// @desc    Create a new support ticket
router.post('/', protect, async (req, res) => {
  try {
    const { subject, category, priority, message } = req.body;
    const ticket = new Ticket({
      userId: req.user._id,
      subject,
      category: category || 'general',
      priority: priority || 'medium',
      messages: [{ sender: 'user', text: message }]
    });
    const created = await ticket.save();
    res.status(201).json(created);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @route   POST /api/tickets/:id/reply
// @desc    Reply to a ticket
router.post('/:id/reply', protect, async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.id);
    if (!ticket) return res.status(404).json({ message: 'Ticket not found' });

    const isAdmin = req.user.role === 'admin';
    const isOwner = ticket.userId.toString() === req.user._id.toString();
    if (!isAdmin && !isOwner) return res.status(403).json({ message: 'Not authorized' });

    ticket.messages.push({
      sender: isAdmin ? 'support' : 'user',
      text: req.body.message,
      timestamp: new Date()
    });

    if (isAdmin && ticket.status === 'open') ticket.status = 'in_progress';

    const updated = await ticket.save();
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @route   PATCH /api/tickets/:id/status
// @desc    Admin: update ticket status
router.patch('/:id/status', protect, async (req, res) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ message: 'Admin only' });
    const ticket = await Ticket.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status },
      { new: true }
    );
    res.json(ticket);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
