const express = require('express');
const Customer = require('../models/Customer');
const router = express.Router();

// Helper: generate next customer number (RM001, RM002, ...)
async function generateCustomerNumber() {
  const last = await Customer.findOne({ customerNumber: { $exists: true, $ne: null } })
    .sort({ customerNumber: -1 })
    .lean();
  if (!last || !last.customerNumber) return 'RM001';
  const num = parseInt(last.customerNumber.replace('RM', ''), 10) || 0;
  return `RM${String(num + 1).padStart(3, '0')}`;
}

// GET all customers (supports ?distributorId= for distributor-scoped access)
router.get('/', async (req, res) => {
  try {
    const query = {};

    // Distributor portal: only return their assigned home-delivery customers
    // (shop pickups are admin-only — not shown to distributors)
    if (req.query.distributorId) {
      query.type = 'delivery';
      query.assignedDistributorId = req.query.distributorId;
    }

    const customers = await Customer.find(query).populate('assignedDistributorId', 'name').sort({ customerNumber: 1 });
    res.json(customers);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET search customers by number, name, primaryPhone, secondaryPhone
router.get('/search', async (req, res) => {
  try {
    const q = req.query.q || '';
    if (!q.trim()) return res.json([]);
    const regex = new RegExp(q.trim(), 'i');
    const customers = await Customer.find({
      $or: [
        { customerNumber: regex },
        { name: regex },
        { primaryPhone: regex },
        { secondaryPhone: regex },
        { phone: regex } // legacy
      ]
    }).populate('assignedDistributorId', 'name').limit(20);
    res.json(customers);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET single customer by ID
router.get('/:id', async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id).populate('assignedDistributorId', 'name');
    if (!customer) return res.status(404).json({ error: 'Customer not found' });
    res.json(customer);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST create a new customer
router.post('/', async (req, res) => {
  try {
    const customerNumber = await generateCustomerNumber();
    const data = { ...req.body, customerNumber };
    // Sync primaryPhone → phone for backward compat
    if (data.primaryPhone && !data.phone) data.phone = data.primaryPhone;
    const customer = new Customer(data);
    await customer.save();
    res.status(201).json(customer);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// PUT update a customer
router.put('/:id', async (req, res) => {
  try {
    const data = { ...req.body };
    // Sync primaryPhone → phone for backward compat
    if (data.primaryPhone) data.phone = data.primaryPhone;
    const customer = await Customer.findByIdAndUpdate(req.params.id, data, { new: true });
    res.json(customer);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE a customer
router.delete('/:id', async (req, res) => {
  try {
    await Customer.findByIdAndDelete(req.params.id);
    res.json({ message: 'Customer deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
