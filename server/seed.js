const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const dotenv = require('dotenv');
const dns = require('dns');
const User = require('./models/User');

// Fix for Node.js/Windows DNS SRV resolution bug
dns.setServers(['8.8.8.8', '1.1.1.1']);

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/rivermilk';

mongoose.connect(MONGODB_URI)
  .then(() => console.log('Connected to MongoDB for seeding...'))
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

const seedAdmin = async () => {
  try {
    const adminPhone = '9999999999';
    const existingAdmin = await User.findOne({ phone: adminPhone });
    
    if (existingAdmin) {
      console.log('Admin user (9999999999) already exists in the database. No need to seed.');
      process.exit(0);
    }

    const hashedPassword = await bcrypt.hash('admin123', 10);
    
    const adminUser = new User({
      name: 'River Milk Owner',
      phone: adminPhone,
      password: hashedPassword,
      role: 'admin'
    });

    await adminUser.save();
    console.log('✅ Admin user successfully seeded!');
    console.log('Phone: 9999999999');
    console.log('Password: admin123');
    process.exit(0);
  } catch (err) {
    console.error('Error seeding admin:', err);
    process.exit(1);
  }
};

seedAdmin();
