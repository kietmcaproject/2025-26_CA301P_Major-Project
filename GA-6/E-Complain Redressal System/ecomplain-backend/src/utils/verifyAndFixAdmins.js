const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Admin = require('../models/Admin');
const bcrypt = require('bcryptjs');

// Load environment variables
dotenv.config();

/**
 * Verify and fix admin accounts
 * This script will:
 * 1. Check if admin accounts exist
 * 2. Verify passwords are hashed correctly
 * 3. Fix any accounts with unhashed passwords
 * 4. Ensure accounts are active
 * 5. Test login credentials
 */
const verifyAndFixAdmins = async () => {
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('🔍 Verifying and fixing admin accounts...\n');

    // Get all admins
    const admins = await Admin.find({}).select('+password');
    
    if (admins.length === 0) {
      console.log('⚠️  No admin accounts found in database.');
      console.log('💡 Run: npm run seed to create admin accounts');
      return;
    }

    console.log(`Found ${admins.length} admin account(s)\n`);

    let fixedCount = 0;
    let issuesFound = [];

    for (const admin of admins) {
      console.log(`\n📋 Checking: ${admin.email}`);
      console.log(`   Role: ${admin.role}`);
      console.log(`   Department: ${admin.department || 'N/A'}`);
      console.log(`   Active: ${admin.isActive}`);
      console.log(`   Locked: ${admin.isLocked}`);

      // Check if password is hashed (bcrypt hashes start with $2a$, $2b$, or $2y$)
      const isPasswordHashed = admin.password && (
        admin.password.startsWith('$2a$') ||
        admin.password.startsWith('$2b$') ||
        admin.password.startsWith('$2y$')
      );

      if (!isPasswordHashed) {
        console.log('   ⚠️  Password is NOT hashed! Fixing...');
        
        // Determine the correct password based on role and department
        let correctPassword;
        if (admin.role === 'super_admin') {
          correctPassword = 'superadmin123456';
        } else {
          correctPassword = (admin.department || 'general').toLowerCase() + '123456';
        }

        // Hash the password
        const salt = await bcrypt.genSalt(12);
        admin.password = await bcrypt.hash(correctPassword, salt);
        admin.isActive = true;
        admin.isEmailVerified = true;
        await admin.save();
        
        console.log(`   ✅ Password hashed and account fixed`);
        console.log(`   📝 Password: ${correctPassword}`);
        fixedCount++;
      } else {
        console.log('   ✅ Password is properly hashed');
        
        // Test password verification
        let testPassword;
        if (admin.role === 'super_admin') {
          testPassword = 'superadmin123456';
        } else {
          testPassword = (admin.department || 'general').toLowerCase() + '123456';
        }

        const isValid = await admin.comparePassword(testPassword);
        if (!isValid) {
          console.log(`   ⚠️  Password verification failed!`);
          console.log(`   🔧 Re-hashing password...`);
          
          // Re-hash the password
          const salt = await bcrypt.genSalt(12);
          admin.password = await bcrypt.hash(testPassword, salt);
          admin.isActive = true;
          admin.isEmailVerified = true;
          await admin.save();
          
          console.log(`   ✅ Password re-hashed`);
          console.log(`   📝 Password: ${testPassword}`);
          fixedCount++;
        } else {
          console.log(`   ✅ Password verification successful`);
        }
      }

      // Check if account is active
      if (!admin.isActive) {
        console.log('   ⚠️  Account is inactive! Activating...');
        admin.isActive = true;
        await admin.save();
        console.log('   ✅ Account activated');
        fixedCount++;
      }

      // Check if account is locked
      if (admin.isLocked) {
        console.log('   ⚠️  Account is locked! Unlocking...');
        admin.lockUntil = undefined;
        admin.loginAttempts = 0;
        await admin.save();
        console.log('   ✅ Account unlocked');
        fixedCount++;
      }

      // Display login credentials
      let password;
      if (admin.role === 'super_admin') {
        password = 'superadmin123456';
      } else {
        password = (admin.department || 'general').toLowerCase() + '123456';
      }

      console.log(`\n   🔑 Login Credentials:`);
      console.log(`      Email: ${admin.email}`);
      console.log(`      Password: ${password}`);
      console.log(`      Role: ${admin.role}`);
      console.log(`      Department: ${admin.department || 'N/A'}`);
    }

    console.log('\n' + '='.repeat(60));
    console.log('📊 Summary:');
    console.log(`   Total Admins: ${admins.length}`);
    console.log(`   Fixed Issues: ${fixedCount}`);
    console.log('='.repeat(60));

    if (fixedCount > 0) {
      console.log('\n✅ Admin accounts have been fixed!');
      console.log('💡 Try logging in again with the credentials shown above.');
    } else {
      console.log('\n✅ All admin accounts are properly configured!');
    }

  } catch (error) {
    console.error('❌ Error verifying admin accounts:', error);
    throw error;
  } finally {
    // Close database connection
    await mongoose.connection.close();
    console.log('\nDatabase connection closed');
  }
};

// Run if this file is executed directly
if (require.main === module) {
  verifyAndFixAdmins()
    .then(() => {
      console.log('\n✅ Verification completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ Verification failed:', error);
      process.exit(1);
    });
}

module.exports = { verifyAndFixAdmins };

