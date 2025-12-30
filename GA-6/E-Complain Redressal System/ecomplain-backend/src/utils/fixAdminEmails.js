const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Admin = require('../models/Admin');
const { defaultAdmins } = require('./adminSeedData');

// Load environment variables
dotenv.config();

/**
 * Fix admin email addresses to match expected format
 * Updates emails for migrated accounts:
 * - assistant@university.edu -> additional@university.edu
 * - hod@university.edu -> dean@university.edu
 */
const fixAdminEmails = async () => {
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('🔧 Fixing admin email addresses...\n');

    // Find admins with old email patterns
    const assistantAdmins = await Admin.find({ 
      email: { $regex: /\.assistant@university\.edu$/i }
    });
    
    const hodAdmins = await Admin.find({ 
      email: { $regex: /\.hod@university\.edu$/i }
    });

    console.log(`Found ${assistantAdmins.length} accounts with assistant email pattern`);
    console.log(`Found ${hodAdmins.length} accounts with hod email pattern\n`);

    let fixedCount = 0;

    // Fix assistant emails to additional
    for (const admin of assistantAdmins) {
      if (admin.role === 'additional_hod') {
        const newEmail = admin.email.replace('.assistant@', '.additional@');
        console.log(`Fixing: ${admin.email} -> ${newEmail}`);
        
        // Check if new email already exists
        const existing = await Admin.findOne({ email: newEmail });
        if (existing) {
          console.log(`   ⚠️  Email ${newEmail} already exists. Skipping...`);
          continue;
        }
        
        admin.email = newEmail;
        await admin.save();
        console.log(`   ✅ Email updated successfully\n`);
        fixedCount++;
      }
    }

    // Fix hod emails to dean
    for (const admin of hodAdmins) {
      if (admin.role === 'dean') {
        const newEmail = admin.email.replace('.hod@', '.dean@');
        console.log(`Fixing: ${admin.email} -> ${newEmail}`);
        
        // Check if new email already exists
        const existing = await Admin.findOne({ email: newEmail });
        if (existing) {
          console.log(`   ⚠️  Email ${newEmail} already exists. Skipping...`);
          continue;
        }
        
        admin.email = newEmail;
        await admin.save();
        console.log(`   ✅ Email updated successfully\n`);
        fixedCount++;
      }
    }

    console.log('='.repeat(60));
    console.log('📊 Summary:');
    console.log(`   Fixed Emails: ${fixedCount}`);
    console.log('='.repeat(60));

    if (fixedCount > 0) {
      console.log('\n✅ Admin email addresses fixed!');
      console.log('💡 You can now login with the updated email addresses.');
    } else {
      console.log('\n✅ All email addresses are correct.');
    }

    // Display all admin credentials
    console.log('\n📋 All Admin Login Credentials:');
    console.log('=====================================');
    
    const allAdmins = await Admin.find({ isActive: true }).sort({ department: 1, role: 1 });
    
    const deptGroups = {};
    allAdmins.forEach(admin => {
      if (admin.role === 'super_admin') {
        console.log(`\n🔑 Super Admin:`);
        console.log(`   Email: ${admin.email}`);
        console.log(`   Password: superadmin123456`);
      } else {
        if (!deptGroups[admin.department]) {
          deptGroups[admin.department] = [];
        }
        deptGroups[admin.department].push(admin);
      }
    });

    Object.keys(deptGroups).sort().forEach(dept => {
      console.log(`\n🏢 ${dept} Department:`);
      const roleOrder = { 'coordinator': 1, 'additional_hod': 2, 'dean': 3 };
      deptGroups[dept]
        .sort((a, b) => (roleOrder[a.role] || 99) - (roleOrder[b.role] || 99))
        .forEach(admin => {
          const roleName = admin.role === 'additional_hod' ? 'Additional HOD' : 
                          admin.role === 'dean' ? 'Dean' : 
                          admin.role === 'coordinator' ? 'Coordinator' : 'Unknown';
          const password = admin.department.toLowerCase() + '123456';
          console.log(`   ${roleName}: ${admin.email} / Password: ${password}`);
        });
    });

    console.log('\n=====================================\n');

  } catch (error) {
    console.error('❌ Error fixing admin emails:', error);
    throw error;
  } finally {
    // Close database connection
    await mongoose.connection.close();
    console.log('Database connection closed');
  }
};

// Run if this file is executed directly
if (require.main === module) {
  fixAdminEmails()
    .then(() => {
      console.log('✅ Email fix completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Email fix failed:', error);
      process.exit(1);
    });
}

module.exports = { fixAdminEmails };

