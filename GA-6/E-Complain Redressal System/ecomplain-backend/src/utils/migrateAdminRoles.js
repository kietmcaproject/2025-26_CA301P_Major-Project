const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Admin = require('../models/Admin');

// Load environment variables
dotenv.config();

/**
 * Migrate old admin roles to new roles
 * - assistant_hod -> additional_hod
 * - hod -> dean
 */
const migrateAdminRoles = async () => {
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('🔄 Migrating admin roles...\n');

    // Find all admins with old roles
    const assistantHODs = await Admin.find({ role: 'assistant_hod' });
    const hods = await Admin.find({ role: 'hod' });

    console.log(`Found ${assistantHODs.length} assistant_hod accounts to migrate`);
    console.log(`Found ${hods.length} hod accounts to migrate\n`);

    let migratedCount = 0;

    // Migrate assistant_hod to additional_hod
    for (const admin of assistantHODs) {
      console.log(`Migrating: ${admin.email}`);
      console.log(`   Old role: assistant_hod`);
      console.log(`   New role: additional_hod`);
      
      admin.role = 'additional_hod';
      await admin.save();
      
      console.log(`   ✅ Migrated successfully\n`);
      migratedCount++;
    }

    // Migrate hod to dean
    for (const admin of hods) {
      console.log(`Migrating: ${admin.email}`);
      console.log(`   Old role: hod`);
      console.log(`   New role: dean`);
      
      admin.role = 'dean';
      await admin.save();
      
      console.log(`   ✅ Migrated successfully\n`);
      migratedCount++;
    }

    console.log('='.repeat(60));
    console.log('📊 Migration Summary:');
    console.log(`   Total Migrated: ${migratedCount}`);
    console.log('='.repeat(60));

    if (migratedCount > 0) {
      console.log('\n✅ Admin roles migrated successfully!');
      console.log('💡 You can now login with the migrated accounts.');
    } else {
      console.log('\n✅ No accounts needed migration.');
    }

  } catch (error) {
    console.error('❌ Error migrating admin roles:', error);
    throw error;
  } finally {
    // Close database connection
    await mongoose.connection.close();
    console.log('\nDatabase connection closed');
  }
};

// Run if this file is executed directly
if (require.main === module) {
  migrateAdminRoles()
    .then(() => {
      console.log('\n✅ Migration completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ Migration failed:', error);
      process.exit(1);
    });
}

module.exports = { migrateAdminRoles };

