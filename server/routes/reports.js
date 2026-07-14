const express = require('express');
const Delivery = require('../models/Delivery');
const Customer = require('../models/Customer');
const Sale = require('../models/Sale');
const Product = require('../models/Product');
const Payment = require('../models/Payment');
const Setting = require('../models/Setting');
const router = express.Router();

// GET milk billing report (deliveries-based, per month)
router.get('/billing', async (req, res) => {
  try {
    const { month, year } = req.query;
    const startDate = new Date(year, month, 1);
    const endDate = new Date(year, parseInt(month) + 1, 0, 23, 59, 59, 999);

    const filter = {
      date: { $gte: startDate, $lte: endDate },
      status: { $in: ['delivered', 'collected'] }
    };

    const deliveries = await Delivery.find(filter).populate('customerId');

    // Use per-delivery price snapshot if available, fallback to Setting
    let fallbackPrice = 70;
    const priceSetting = await Setting.findOne({ key: 'pricePerLitre' });
    if (priceSetting) fallbackPrice = priceSetting.value;

    const customerTotals = {};
    deliveries.forEach(d => {
      if (!d.customerId) return;
      const cid = d.customerId._id.toString();
      const price = d.pricePerLitre || fallbackPrice;
      if (!customerTotals[cid]) {
        customerTotals[cid] = {
          customer: d.customerId,
          totalLitres: 0,
          totalAmount: 0,
          deliveryCount: 0,
          milkBreakdown: {}
        };
      }
      customerTotals[cid].totalLitres += d.quantityLitres;
      customerTotals[cid].totalAmount += d.quantityLitres * price;
      customerTotals[cid].deliveryCount += 1;
      // milk type breakdown
      const mt = d.milkType || 'cow';
      if (!customerTotals[cid].milkBreakdown[mt]) customerTotals[cid].milkBreakdown[mt] = 0;
      customerTotals[cid].milkBreakdown[mt] += d.quantityLitres;
    });

    res.json(Object.values(customerTotals));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET dairy product sales report (sales-based)
router.get('/dairy-sales', async (req, res) => {
  try {
    const { month, year } = req.query;
    const startDate = new Date(year, month, 1);
    const endDate = new Date(year, parseInt(month) + 1, 0, 23, 59, 59, 999);

    const sales = await Sale.find({ date: { $gte: startDate, $lte: endDate } })
      .populate('customerId', 'name customerNumber primaryPhone phone');

    // Aggregate by product
    const productTotals = {};
    sales.forEach(sale => {
      sale.items.forEach(item => {
        const key = item.productName;
        if (!productTotals[key]) {
          productTotals[key] = { productName: key, unit: item.unit, totalQty: 0, totalRevenue: 0 };
        }
        productTotals[key].totalQty += item.quantity;
        productTotals[key].totalRevenue += item.subtotal;
      });
    });

    res.json({ sales, productSummary: Object.values(productTotals) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET pending payments report
router.get('/pending-payments', async (req, res) => {
  try {
    const customers = await Customer.find({ outstandingBalance: { $gt: 0 } })
      .sort({ outstandingBalance: -1 });
    const total = customers.reduce((sum, c) => sum + c.outstandingBalance, 0);
    res.json({ customers, total, count: customers.length });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET inventory report
router.get('/inventory', async (req, res) => {
  try {
    const products = await Product.find({ isActive: true }).sort({ category: 1, name: 1 });
    const lowStock = products.filter(p => p.category === 'dairy' && p.currentStock <= p.lowStockThreshold);
    res.json({ products, lowStockCount: lowStock.length });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET customer ledger (full history: sales + payments)
router.get('/customer-ledger/:customerId', async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.customerId);
    if (!customer) return res.status(404).json({ error: 'Customer not found' });

    const sales = await Sale.find({ customerId: req.params.customerId }).sort({ date: -1 });
    const payments = await Payment.find({ customerId: req.params.customerId }).sort({ date: -1 });

    // Merge and sort by date
    const ledger = [
      ...sales.map(s => ({ type: 'sale', date: s.date, amount: s.totalAmount, paid: s.paidAmount, balance: s.balanceDue, details: s.items, paymentMode: s.paymentMode, _id: s._id })),
      ...payments.map(p => ({ type: 'payment', date: p.date, amount: p.amount, notes: p.notes, _id: p._id }))
    ].sort((a, b) => new Date(b.date) - new Date(a.date));

    res.json({ customer, ledger, outstandingBalance: customer.outstandingBalance });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
