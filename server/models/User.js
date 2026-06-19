const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  phone: { type: String, required: true, unique: true },
  role: { type: String, enum: ['admin', 'distributor'], required: true },
  password: { type: String, required: true },
  assignedArea: { type: String } // only for distributors
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
