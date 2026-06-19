const express = require('express');
const Setting = require('../models/Setting');
const router = express.Router();

router.get('/:key', async (req, res) => {
  try {
    let setting = await Setting.findOne({ key: req.params.key });
    if (!setting && req.params.key === 'pricePerLitre') {
      setting = new Setting({ key: 'pricePerLitre', value: 70 });
      await setting.save();
    }
    res.json(setting);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/:key', async (req, res) => {
  try {
    const setting = await Setting.findOneAndUpdate(
      { key: req.params.key },
      { value: req.body.value },
      { new: true, upsert: true }
    );
    res.json(setting);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
