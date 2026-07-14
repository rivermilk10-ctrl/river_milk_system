const express = require('express');
const Payment = require('../models/Payment');
const Customer = require('../models/Customer');
const router = express.Router();

// POST record a payment (reduces customer outstanding balance)
router.post('/', async (req, res) => {
  try {
    const { customerId, saleId, amount, date, notes, recordedBy } = req.body;

    if (!customerId || !amount || amount <= 0) {
      return res.status(400).json({ error: 'customerId and a positive amount are required' });
    }

    const customer = await Customer.findById(customerId);
    if (!customer) return res.status(404).json({ error: 'Customer not found' });

    const payment = new Payment({
      customerId,
      saleId: saleId || null,
      amount: Number(amount),
      date: date ? new Date(date) : new Date(),
      notes,
      recordedBy
    });
    await payment.save();

    // Reduce customer outstanding balance
    customer.outstandingBalance = Math.max(0, (customer.outstandingBalance || 0) - Number(amount));
    if (customer.outstandingBalance === 0) {
      customer.paymentStatus = 'paid';
    }
    await customer.save();

    res.status(201).json({ payment, updatedBalance: customer.outstandingBalance });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// GET payment history for a customer
router.get('/', async (req, res) => {
  try {
    const filter = {};
    if (req.query.customerId) filter.customerId = req.query.customerId;
    const payments = await Payment.find(filter)
      .populate('customerId', 'name customerNumber')
      .sort({ date: -1 });
    res.json(payments);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
