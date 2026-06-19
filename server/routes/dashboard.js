const express = require('express');
const Customer = require('../models/Customer');
const Delivery = require('../models/Delivery');
const router = express.Router();

// Get dashboard summary
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

    // pending is total delivery customers - done deliveries (rough estimation for today)
    const pendingDeliveriesCount = deliveryCustomers - doneDeliveriesCount;

    const totalLitres = todaysDeliveries.reduce((sum, d) => sum + d.quantityLitres, 0);

    const pendingPaymentCustomers = await Customer.countDocuments({ paymentStatus: 'pending' });

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
      pendingPayments: pendingPaymentCustomers
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
