const mongoose = require('mongoose');
const dotenv = require('dotenv');
const dns = require('dns');
dns.setServers(['8.8.8.8', '1.1.1.1']);

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/rivermilk';

// Import models
const Customer = require('./models/Customer');
const Product = require('./models/Product');

mongoose.connect(MONGODB_URI, { serverSelectionTimeoutMS: 30000 })
  .then(() => {
    console.log('Connected to MongoDB Atlas for migration...');
    run();
  })
  .catch(err => { console.error('MongoDB connection error:', err); process.exit(1); });

const defaultProducts = [
  // Milk types
  { name: 'Full Cream Milk', category: 'milk', milkTypeKey: 'full_cream', unit: 'L', price: 85, isActive: true, currentStock: 0, lowStockThreshold: 0 },
  { name: 'Cow Milk',        category: 'milk', milkTypeKey: 'cow',        unit: 'L', price: 60, isActive: true, currentStock: 0, lowStockThreshold: 0 },
  { name: 'Buffalo Milk',    category: 'milk', milkTypeKey: 'buffalo',    unit: 'L', price: 75, isActive: true, currentStock: 0, lowStockThreshold: 0 },
  // Dairy products
  { name: 'Paneer', category: 'dairy', milkTypeKey: null, unit: 'KG',    price: 400, isActive: true, currentStock: 10, lowStockThreshold: 2 },
  { name: 'Ghee',   category: 'dairy', milkTypeKey: null, unit: 'KG',    price: 800, isActive: true, currentStock: 10, lowStockThreshold: 2 },
  { name: 'Curd',   category: 'dairy', milkTypeKey: null, unit: 'KG',    price: 140, isActive: true, currentStock: 10, lowStockThreshold: 2 },
  { name: 'Lassi',  category: 'dairy', milkTypeKey: null, unit: 'Glass', price: 30,  isActive: true, currentStock: 20, lowStockThreshold: 5 },
];

async function migrateCustomerNumbers() {
  console.log('\n--- Step 1: Assigning Customer Numbers ---');
  const customers = await Customer.find({ customerNumber: { $exists: false } })
    .sort({ createdAt: 1 });

  // Also find ones with null customerNumber
  const alsoNull = await Customer.find({ customerNumber: null }).sort({ createdAt: 1 });
  const toAssign = [...customers, ...alsoNull.filter(c => !customers.find(x => x._id.equals(c._id)))];

  if (toAssign.length === 0) {
    console.log('✅ All customers already have customer numbers.');
    return;
  }

  // Find highest existing number
  const lastNumbered = await Customer.findOne({ customerNumber: /^RM\d+$/ })
    .sort({ customerNumber: -1 });
  let counter = 0;
  if (lastNumbered) {
    counter = parseInt(lastNumbered.customerNumber.replace('RM', ''), 10);
  }

  for (const customer of toAssign) {
    counter++;
    const customerNumber = `RM${String(counter).padStart(3, '0')}`;
    // Migrate phone → primaryPhone
    const primaryPhone = customer.primaryPhone || customer.phone || '';
    await Customer.findByIdAndUpdate(customer._id, {
      customerNumber,
      primaryPhone,
    });
    console.log(`  Assigned ${customerNumber} to: ${customer.name}`);
  }
  console.log(`✅ Assigned numbers to ${toAssign.length} customers.`);
}

async function seedProducts() {
  console.log('\n--- Step 2: Seeding Products ---');
  let created = 0;
  for (const p of defaultProducts) {
    const exists = await Product.findOne({ name: p.name });
    if (!exists) {
      await Product.create(p);
      console.log(`  Created product: ${p.name} @ ₹${p.price}/${p.unit}`);
      created++;
    } else {
      console.log(`  Skipped (exists): ${p.name}`);
    }
  }
  console.log(`✅ Products seeded. Created: ${created}, Skipped: ${defaultProducts.length - created}`);
}

async function run() {
  try {
    await migrateCustomerNumbers();
    await seedProducts();
    console.log('\n🎉 Migration complete!');
    process.exit(0);
  } catch (err) {
    console.error('Migration error:', err);
    process.exit(1);
  }
}
