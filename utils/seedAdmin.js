/**
 * Creates the first admin user.
 * Run once: node utils/seedAdmin.js
 */
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const connectDB = require('../config/db');
const bcrypt    = require('bcrypt');
const User      = require('../models/User');

async function seedAdmin() {
  await connectDB();

  const existing = await User.findOne({ role: 'admin' });
  if (existing) {
    console.log('Admin already exists:', existing.email);
    process.exit(0);
  }

  const hashed = await bcrypt.hash('admin123', 10);
  const admin  = await User.create({
    name:      'Admin',
    email:     'admin@campus.edu',
    collegeId: 'ADMIN001',
    password:  hashed,
    role:      'admin',
  });

  console.log('\n✓ Admin created successfully');
  console.log('  Email:     ', admin.email);
  console.log('  Password:  ', 'admin123');
  console.log('  College ID:', admin.collegeId);
  process.exit(0);
}

seedAdmin().catch(err => {
  console.error('Seed failed:', err.message);
  process.exit(1);
});
