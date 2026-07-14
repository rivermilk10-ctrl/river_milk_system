const express = require('express');
const Sale = require('../models/Sale');
const Customer = require('../models/Customer');
const Product = require('../models/Product');
const router = express.Router();

// POST create a new sale (combined billing)
router.post('/', async (req, res) => {
  try {
    const { customerId, items, paymentMode, paidAmount, notes, date, createdBy } = req.body;

    // Validate customer
    const customer = await Customer.findById(customerId);
    if (!customer) return res.status(404).json({ error: 'Customer not found' });

    // Build sale items with price snapshots and calc total
    let totalAmount = 0;
    const saleItems = [];

    for (const item of items) {
      const product = await Product.findById(item.productId);
      if (!product) return res.status(404).json({ error: `Product ${item.productId} not found` });
      if (!product.isActive) return res.status(400).json({ error: `Product ${product.name} is not active` });

      const subtotal = product.price * item.quantity;
      totalAmount += subtotal;

      saleItems.push({
        productId: product._id,
        productName: product.name,
        quantity: item.quantity,
        unit: product.unit,
        pricePerUnit: product.price,
        subtotal
      });

      // Deduct stock for dairy products
      if (product.category === 'dairy') {
        product.currentStock = Math.max(0, product.currentStock - item.quantity);
        await product.save();
      }
    }

    const paid = Number(paidAmount) || 0;
    const balanceDue = totalAmount - paid;

    const sale = new Sale({
      customerId,
      date: date ? new Date(date) : new Date(),
      items: saleItems,
      totalAmount,
      paidAmount: paid,
      balanceDue,
      paymentMode: paymentMode || 'cash',
      notes,
      createdBy
    });
    await sale.save();

    // Update customer's cumulative outstanding balance for credit/partial
    if (balanceDue > 0) {
      customer.outstandingBalance = (customer.outstandingBalance || 0) + balanceDue;
      customer.paymentStatus = 'pending';
      await customer.save();
    }

    res.status(201).json(sale);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// GET sales history (optional ?customerId=, ?month=, ?year=)
router.get('/', async (req, res) => {
  try {
    const filter = {};
    if (req.query.customerId) filter.customerId = req.query.customerId;

    if (req.query.month !== undefined && req.query.year) {
      const startDate = new Date(req.query.year, req.query.month, 1);
      const endDate = new Date(req.query.year, parseInt(req.query.month) + 1, 0, 23, 59, 59);
      filter.date = { $gte: startDate, $lte: endDate };
    }

    const sales = await Sale.find(filter)
      .populate('customerId', 'name customerNumber primaryPhone')
      .sort({ date: -1 });
    res.json(sales);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET customers with outstanding balance (pending payments)
router.get('/pending', async (req, res) => {
  try {
    const customers = await Customer.find({ outstandingBalance: { $gt: 0 } })
      .sort({ outstandingBalance: -1 });
    const total = customers.reduce((sum, c) => sum + c.outstandingBalance, 0);
    res.json({ customers, total, count: customers.length });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET single sale
router.get('/:id', async (req, res) => {
  try {
    const sale = await Sale.findById(req.params.id).populate('customerId', 'name customerNumber');
    if (!sale) return res.status(404).json({ error: 'Sale not found' });
    res.json(sale);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
