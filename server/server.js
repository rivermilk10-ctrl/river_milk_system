const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const dns = require('dns');

// Fix for Node.js/Windows DNS SRV resolution bug
dns.setServers(['8.8.8.8', '1.1.1.1']);

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/rivermilk';

mongoose.connect(MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/customers', require('./routes/customers'));
app.use('/api/deliveries', require('./routes/deliveries'));
app.use('/api/dashboard', require('./routes/dashboard'));
app.use('/api/distributors', require('./routes/distributors'));
app.use('/api/settings', require('./routes/settings'));
app.use('/api/reports', require('./routes/reports'));
app.use('/api/products', require('./routes/products'));
app.use('/api/sales', require('./routes/sales'));
app.use('/api/payments', require('./routes/payments'));

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
