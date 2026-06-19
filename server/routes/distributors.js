const express = require('express');
const User = require('../models/User');
const bcrypt = require('bcrypt');
const router = express.Router();

// Get all distributors
router.get('/', async (req, res) => {
  try {
    const distributors = await User.find({ role: 'distributor' }).select('-password');
    res.json(distributors);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add a distributor
router.post('/', async (req, res) => {
  try {
    const { name, phone, password, assignedArea } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const distributor = new User({
      name, phone, role: 'distributor', password: hashedPassword, assignedArea
    });
    await distributor.save();
    const distResponse = distributor.toObject();
    delete distResponse.password;
    res.status(201).json(distResponse);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Delete a distributor
router.delete('/:id', async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: 'Distributor deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
