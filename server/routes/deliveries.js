const express = require('express');
const Delivery = require('../models/Delivery');
const Customer = require('../models/Customer');
const router = express.Router();

// Get deliveries for a specific date (defaults to today)
router.get('/today', async (req, res) => {
  try {
    const requestedDate = req.query.date ? new Date(req.query.date) : new Date();
    const startOfDay = new Date(requestedDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(requestedDate);
    endOfDay.setHours(23, 59, 59, 999);

    const filter = { date: { $gte: startOfDay, $lte: endOfDay } };
    if (req.query.distributorId) {
      filter.distributorId = req.query.distributorId;
    }

    const deliveries = await Delivery.find(filter).populate('customerId');
    res.json(deliveries);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Mark delivery or pickup
router.post('/mark', async (req, res) => {
  try {
    const { customerId, date, quantityLitres, distributorId, status, markedBy } = req.body;
    
    let parsedDate = new Date(date);
    parsedDate.setHours(0, 0, 0, 0);

    const startOfDay = new Date(parsedDate);
    const endOfDay = new Date(parsedDate);
    endOfDay.setHours(23, 59, 59, 999);

    const existing = await Delivery.findOne({ customerId, date: { $gte: startOfDay, $lte: endOfDay } });
    if (existing) {
      existing.status = status;
      existing.quantityLitres = quantityLitres;
      existing.markedAt = new Date();
      existing.markedBy = markedBy;
      await existing.save();
      return res.json(existing);
    }

    const delivery = new Delivery({
      customerId,
      distributorId,
      date: parsedDate,
      quantityLitres,
      status,
      markedAt: new Date(),
      markedBy
    });
    await delivery.save();
    res.status(201).json(delivery);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
