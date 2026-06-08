const express = require('express');
const router = express.Router();
const multer = require('multer');
const csv = require('csv-parser');
const stream = require('stream');
const { protect } = require('../middleware/authMiddleware');

const upload = multer({ storage: multer.memoryStorage() });

// @route   POST /api/upload/boq-csv
// @desc    Parse a CSV file and return structured BOQ rows
router.post('/boq-csv', protect, upload.single('file'), async (req, res) => {
  if (!req.file) return res.status(400).json({ message: 'No file uploaded' });

  const results = [];
  const errors = [];

  const bufferStream = new stream.PassThrough();
  bufferStream.end(req.file.buffer);

  bufferStream
    .pipe(csv())
    .on('data', (row) => {
      // Normalize headers (handle varying column names)
      const item = {
        description: row['Description'] || row['description'] || row['Item'] || row['item'] || '',
        quantity: parseInt(row['Quantity'] || row['quantity'] || row['Qty'] || row['qty'] || '0', 10),
        unit: row['Unit'] || row['unit'] || 'pcs',
        notes: row['Notes'] || row['notes'] || row['Remarks'] || ''
      };

      if (!item.description) {
        errors.push(`Skipped row with missing description`);
        return;
      }
      if (isNaN(item.quantity) || item.quantity <= 0) {
        errors.push(`Skipped "${item.description}" — invalid quantity`);
        return;
      }
      results.push(item);
    })
    .on('end', () => {
      res.json({ items: results, errors, count: results.length });
    })
    .on('error', (err) => {
      res.status(500).json({ message: 'Failed to parse CSV', error: err.message });
    });
});

module.exports = router;
