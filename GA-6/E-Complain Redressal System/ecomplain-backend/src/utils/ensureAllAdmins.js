const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Admin = require('../models/Admin');
const { defaultAdmins, superAdmin } = require('./adminSeedData');

// Load environment variables
dotenv.config();

/**
 * Ensure all required admin accounts exist for all departments
 * This ensures:
 * - Coordinator exists for each department
 * - Additional HOD exists for each department
 * - Dean exists for each department
 */
const ensureAllAdmins = async () => {
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('🔍 Ensuring all admin accounts exist...\n');

    // Get super admin for createdBy field
    let superAdminAccount = await Admin.findOne({ role: 'super_admin' });
    if (!superAdminAccount) {
      console.log('⚠️  Super admin not found. Creating super admin first...');
      superAdminAccount = await Admin.createSuperAdmin(superAdmin);
      console.log('✅ Super admin created:', superAdminAccount.email);
    }

    const departments = ['MCA', 'MBA', 'CSE', 'Electronics', 'Mechanical', 'Civil', 'Electrical', 'General'];
    const roles = ['coordinator', 'additional_hod', 'dean'];
    
    // External departments
    const externalDepartments = [
      { role: 'accounts', department: 'Accounts', password: 'accounts123456' },
      { role: 'librarian', department: 'Librarian', password: 'librarian123456' },
      { role: 'maintenance', department: 'Maintenance', password: 'maintenance123456' }
    ];
    
    let createdCount = 0;
    let existingCount = 0;

    // Create academic department admins
    for (const dept of departments) {
      console.log(`\n🏢 ${dept} Department:`);
      
      for (const role of roles) {
        // Check if admin exists
        let admin = await Admin.findOne({
          role: role,
          department: dept,
          isActive: true
        });

        if (!admin) {
          // Find admin data from seed data
          const adminData = defaultAdmins.find(
            a => a.role === role && a.department === dept
          );

          if (adminData) {
            // Create admin
            admin = new Admin({
              ...adminData,
              createdBy: superAdminAccount._id
            });
            await admin.save();
            
            const roleName = role === 'additional_hod' ? 'Additional HOD' : 
                            role === 'dean' ? 'Dean' : 
                            role === 'coordinator' ? 'Coordinator' : role;
            const password = dept.toLowerCase() + '123456';
            
            console.log(`   ✅ Created ${roleName}: ${admin.email} / Password: ${password}`);
            createdCount++;
          } else {
            console.log(`   ⚠️  No seed data found for ${role} in ${dept}`);
          }
        } else {
          const roleName = role === 'additional_hod' ? 'Additional HOD' : 
                          role === 'dean' ? 'Dean' : 
                          role === 'coordinator' ? 'Coordinator' : role;
          console.log(`   ✓ ${roleName} already exists: ${admin.email}`);
          existingCount++;
        }
      }
    }

    // Create external department admins
    console.log(`\n🏢 External Departments:`);
    for (const extDept of externalDepartments) {
      let admin = await Admin.findOne({
        role: extDept.role,
        department: extDept.department,
        isActive: true
      });

      if (!admin) {
        const adminData = defaultAdmins.find(
          a => a.role === extDept.role && a.department === extDept.department
        );

        if (adminData) {
          admin = new Admin({
            ...adminData,
            createdBy: superAdminAccount._id
          });
          await admin.save();
          
          const roleName = extDept.role === 'accounts' ? 'Accounts Department' :
                          extDept.role === 'librarian' ? 'Librarian' :
                          extDept.role === 'maintenance' ? 'Maintenance Department' : extDept.role;
          
          console.log(`   ✅ Created ${roleName}: ${admin.email} / Password: ${extDept.password}`);
          createdCount++;
        } else {
          console.log(`   ⚠️  No seed data found for ${extDept.role} in ${extDept.department}`);
        }
      } else {
        const roleName = extDept.role === 'accounts' ? 'Accounts Department' :
                        extDept.role === 'librarian' ? 'Librarian' :
                        extDept.role === 'maintenance' ? 'Maintenance Department' : extDept.role;
        console.log(`   ✓ ${roleName} already exists: ${admin.email}`);
        existingCount++;
      }
    }

    console.log('\n' + '='.repeat(60));
    console.log('📊 Summary:');
    console.log(`   Existing Admins: ${existingCount}`);
    console.log(`   Created Admins: ${createdCount}`);
    console.log(`   Total Departments: ${departments.length}`);
    console.log(`   Required Roles per Department: ${roles.length}`);
    console.log(`   Total Required: ${departments.length * roles.length}`);
    console.log('='.repeat(60));

    if (createdCount > 0) {
      console.log('\n✅ Missing admin accounts have been created!');
    } else {
      console.log('\n✅ All required admin accounts exist!');
    }

    console.log('\n📋 Login Credentials:');
    console.log('=====================================');
    console.log('\n🔑 Super Admin:');
    console.log(`   Email: ${superAdminAccount.email}`);
    console.log(`   Password: superadmin123456`);
    
    for (const dept of departments) {
      console.log(`\n🏢 ${dept} Department:`);
      for (const role of roles) {
        const admin = await Admin.findOne({
          role: role,
          department: dept,
          isActive: true
        });
        
        if (admin) {
          const roleName = role === 'additional_hod' ? 'Additional HOD' : 
                          role === 'dean' ? 'Dean' : 
                          role === 'coordinator' ? 'Coordinator' : role;
          const password = dept.toLowerCase() + '123456';
          console.log(`   ${roleName}: ${admin.email} / Password: ${password}`);
        }
      }
    }

    // Print external department credentials
    console.log(`\n🏢 External Departments:`);
    for (const extDept of externalDepartments) {
      const admin = await Admin.findOne({
        role: extDept.role,
        department: extDept.department,
        isActive: true
      });
      
      if (admin) {
        const roleName = extDept.role === 'accounts' ? 'Accounts Department' :
                        extDept.role === 'librarian' ? 'Librarian' :
                        extDept.role === 'maintenance' ? 'Maintenance Department' : extDept.role;
        console.log(`   ${roleName}: ${admin.email} / Password: ${extDept.password}`);
      }
    }
    
    console.log('\n=====================================\n');

  } catch (error) {
    console.error('❌ Error ensuring admin accounts:', error);
    throw error;
  } finally {
    // Close database connection
    await mongoose.connection.close();
    console.log('Database connection closed');
  }
};

// Run if this file is executed directly
if (require.main === module) {
  ensureAllAdmins()
    .then(() => {
      console.log('✅ Admin account check completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Admin account check failed:', error);
      process.exit(1);
    });
}

module.exports = { ensureAllAdmins };

