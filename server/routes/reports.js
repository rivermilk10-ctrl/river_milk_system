const express = require('express');
const Delivery = require('../models/Delivery');
const Customer = require('../models/Customer');
const Setting = require('../models/Setting');
const router = express.Router();

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
    
    let priceSetting = await Setting.findOne({ key: 'pricePerLitre' });
    const pricePerLitre = priceSetting ? priceSetting.value : 70;

    const customerTotals = {};

    deliveries.forEach(d => {
      if (!d.customerId) return;
      const cid = d.customerId._id.toString();
      if (!customerTotals[cid]) {
        customerTotals[cid] = {
          customer: d.customerId,
          totalLitres: 0,
          totalAmount: 0,
          deliveryCount: 0
        };
      }
      customerTotals[cid].totalLitres += d.quantityLitres;
      customerTotals[cid].totalAmount += d.quantityLitres * pricePerLitre;
      customerTotals[cid].deliveryCount += 1;
    });

    res.json(Object.values(customerTotals));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
