const express = require('express');
const Delivery = require('../models/Delivery');
const Customer = require('../models/Customer');
const Product = require('../models/Product');
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

    // Distributor portal: only show deliveries assigned to this distributor
    // (pickup deliveries are admin-only — excluded when distributorId is provided)
    if (req.query.distributorId) {
      filter.distributorId = req.query.distributorId;
    }

    const deliveries = await Delivery.find(filter).populate('customerId');
    res.json(deliveries);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Mark delivery or pickup (with milk type switching + inventory deduction)
router.post('/mark', async (req, res) => {
  try {
    const { customerId, date, quantityLitres, distributorId, status, markedBy, milkType } = req.body;

    let parsedDate = new Date(date);
    parsedDate.setHours(0, 0, 0, 0);

    const startOfDay = new Date(parsedDate);
    const endOfDay = new Date(parsedDate);
    endOfDay.setHours(23, 59, 59, 999);

    // Get price snapshot from active product for this milk type
    let pricePerLitre = null;
    const deliveredMilkType = milkType || 'cow';
    const milkTypeKeyMap = { full_cream: 'full_cream', cow: 'cow', buffalo: 'buffalo' };
    const milkProduct = await Product.findOne({
      category: 'milk',
      milkTypeKey: milkTypeKeyMap[deliveredMilkType],
      isActive: true
    });
    if (milkProduct) {
      pricePerLitre = milkProduct.price;
    }

    const existing = await Delivery.findOne({ customerId, date: { $gte: startOfDay, $lte: endOfDay } });
    if (existing) {
      existing.status = status;
      existing.quantityLitres = quantityLitres;
      existing.milkType = deliveredMilkType;
      existing.pricePerLitre = pricePerLitre;
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
      milkType: deliveredMilkType,
      pricePerLitre,
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

// Bulk mark deliveries
router.post('/mark-bulk', async (req, res) => {
  try {
    const { deliveries } = req.body;
    const results = [];
    
    // Fetch prices once
    const milkProducts = await Product.find({ category: 'milk', isActive: true });
    const priceMap = {};
    milkProducts.forEach(p => {
      priceMap[p.milkTypeKey] = p.price;
    });
    
    for (const d of deliveries) {
      let parsedDate = new Date(d.date);
      parsedDate.setHours(0, 0, 0, 0);
      const startOfDay = new Date(parsedDate);
      const endOfDay = new Date(parsedDate);
      endOfDay.setHours(23, 59, 59, 999);

      const deliveredMilkType = d.milkType || 'cow';
      const milkTypeKeyMap = { full_cream: 'full_cream', cow: 'cow', buffalo: 'buffalo' };
      const pricePerLitre = priceMap[milkTypeKeyMap[deliveredMilkType]] || null;

      const existing = await Delivery.findOne({ customerId: d.customerId, date: { $gte: startOfDay, $lte: endOfDay } });
      if (existing) {
        existing.status = d.status;
        existing.quantityLitres = d.quantityLitres;
        existing.milkType = deliveredMilkType;
        existing.pricePerLitre = pricePerLitre;
        existing.markedAt = new Date();
        existing.markedBy = d.markedBy;
        await existing.save();
        results.push(existing);
      } else {
        const delivery = new Delivery({
          customerId: d.customerId,
          distributorId: d.distributorId,
          date: parsedDate,
          quantityLitres: d.quantityLitres,
          milkType: deliveredMilkType,
          pricePerLitre,
          status: d.status,
          markedAt: new Date(),
          markedBy: d.markedBy
        });
        await delivery.save();
        results.push(delivery);
      }
    }
    res.status(201).json(results);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Unmark a delivery
router.delete('/unmark/:customerId/:date', async (req, res) => {
  try {
    const { customerId, date } = req.params;
    let parsedDate = new Date(date);
    parsedDate.setHours(0, 0, 0, 0);

    const startOfDay = new Date(parsedDate);
    const endOfDay = new Date(parsedDate);
    endOfDay.setHours(23, 59, 59, 999);

    await Delivery.findOneAndDelete({ customerId, date: { $gte: startOfDay, $lte: endOfDay } });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
