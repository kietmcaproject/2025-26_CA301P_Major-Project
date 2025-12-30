const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Admin = require('../models/Admin');
const { seedAdmins } = require('./adminSeedData');

// Load environment variables
dotenv.config();

const seedAllData = async (force = false) => {
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to database for seeding...');

    // Seed all admin accounts (including super admin)
    await seedAdmins(force);

  } catch (error) {
    console.error('Error seeding data:', error.message);
  } finally {
    // Close database connection
    await mongoose.connection.close();
    console.log('Database connection closed');
  }
};

const seedSuperAdmin = async () => {
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to database for seeding...');

    // Check if super admin already exists
    const existingSuperAdmin = await Admin.findOne({ role: 'super_admin' });

    if (existingSuperAdmin) {
      console.log('Super admin already exists:', existingSuperAdmin.email);
      return;
    }

    // Create super admin
    const superAdmin = await Admin.createSuperAdmin({
      firstName: 'Super',
      lastName: 'Admin',
      email: process.env.DEFAULT_ADMIN_EMAIL || 'admin@ecomplain.edu',
      password: process.env.DEFAULT_ADMIN_PASSWORD || 'admin123456',
      department: 'General'
    });

    console.log('Super admin created successfully:', {
      id: superAdmin._id,
      email: superAdmin.email,
      role: superAdmin.role
    });

  } catch (error) {
    console.error('Error seeding super admin:', error.message);
  } finally {
    // Close database connection
    await mongoose.connection.close();
    console.log('Database connection closed');
  }
};

// Run seeding if this file is executed directly
if (require.main === module) {
  // Check for --force argument
  const forceMode = process.argv.includes('--force');
  if (forceMode) {
    console.log('🔄 Running in FORCE mode - will reset all admin passwords...');
  }
  seedAllData(forceMode);
}

module.exports = { seedSuperAdmin, seedAllData };
