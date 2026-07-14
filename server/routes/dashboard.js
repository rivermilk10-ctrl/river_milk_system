const express = require('express');
const Customer = require('../models/Customer');
const Delivery = require('../models/Delivery');
const Product = require('../models/Product');
const router = express.Router();

// GET dashboard summary
router.get('/', async (req, res) => {
  try {
    const totalCustomers = await Customer.countDocuments();
    const deliveryCustomers = await Customer.countDocuments({ type: 'delivery' });
    const pickupCustomers = await Customer.countDocuments({ type: 'pickup' });

    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const todaysDeliveries = await Delivery.find({ date: { $gte: startOfDay, $lte: endOfDay } });

    const doneDeliveriesCount = todaysDeliveries.filter(d => d.status === 'delivered').length;
    const collectedPickupsCount = todaysDeliveries.filter(d => d.status === 'collected').length;
    const pendingDeliveriesCount = deliveryCustomers - doneDeliveriesCount;
    const totalLitres = todaysDeliveries.reduce((sum, d) => sum + d.quantityLitres, 0);

    // Pending payments
    const pendingCustomers = await Customer.find({ outstandingBalance: { $gt: 0 } });
    const pendingPaymentsTotal = pendingCustomers.reduce((sum, c) => sum + c.outstandingBalance, 0);
    const pendingPaymentsCount = pendingCustomers.length;

    // Legacy pending payment status
    const pendingPaymentCustomers = await Customer.countDocuments({ paymentStatus: 'pending' });

    // Low stock products
    const allProducts = await Product.find({ isActive: true });
    const lowStockProducts = allProducts.filter(p => p.category === 'dairy' && p.currentStock <= p.lowStockThreshold);

    res.json({
      totalCustomers,
      deliveryCustomers,
      pickupCustomers,
      todayStats: {
        deliveriesDone: doneDeliveriesCount,
        deliveriesPending: pendingDeliveriesCount,
        pickupsCollected: collectedPickupsCount,
        totalQuantityLitres: totalLitres
      },
      pendingPayments: pendingPaymentCustomers, // legacy
      pendingPaymentsTotal,
      pendingPaymentsCount,
      lowStockProducts: lowStockProducts.map(p => ({
        _id: p._id,
        name: p.name,
        currentStock: p.currentStock,
        lowStockThreshold: p.lowStockThreshold,
        unit: p.unit
      }))
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
