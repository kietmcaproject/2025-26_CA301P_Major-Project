const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Admin = require('../models/Admin');
const { defaultAdmins } = require('./adminSeedData');

// Load environment variables
dotenv.config();

/**
 * Ensures coordinators exist for all departments
 * This is critical for the complaint workflow:
 * 1. Complaints are first assigned to Coordinators
 * 2. Coordinators forward to Additional HOD or Dean
 * 3. Additional HOD escalates to Dean
 * 4. Dean forwards to external departments (Library, Maintenance, Accounts)
 */
const ensureCoordinators = async () => {
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('🔍 Checking for coordinators in all departments...\n');

    // Get super admin for createdBy field
    let superAdmin = await Admin.findOne({ role: 'super_admin' });
    if (!superAdmin) {
      console.log('⚠️  Super admin not found. Creating super admin first...');
      const { seedAdmins } = require('./adminSeedData');
      await seedAdmins();
      superAdmin = await Admin.findOne({ role: 'super_admin' });
    }

    const departments = ['MCA', 'MBA', 'CSE', 'Electronics', 'Mechanical', 'Civil', 'Electrical', 'General'];
    const createdCoordinators = [];
    const existingCoordinators = [];

    for (const dept of departments) {
      // Check if coordinator exists
      let coordinator = await Admin.findOne({
        role: 'coordinator',
        department: dept,
        isActive: true
      });

      if (!coordinator) {
        // Find coordinator data from seed data
        const coordinatorData = defaultAdmins.find(
          admin => admin.role === 'coordinator' && admin.department === dept
        );

        if (coordinatorData) {
          // Create coordinator
          coordinator = new Admin({
            ...coordinatorData,
            createdBy: superAdmin._id
          });
          await coordinator.save();
          createdCoordinators.push({ department: dept, email: coordinator.email });
          console.log(`✅ Created coordinator for ${dept}: ${coordinator.email}`);
        } else {
          console.log(`⚠️  No coordinator data found for ${dept} department`);
        }
      } else {
        existingCoordinators.push({ department: dept, email: coordinator.email });
        console.log(`✓ Coordinator already exists for ${dept}: ${coordinator.email}`);
      }
    }

    console.log('\n📊 Summary:');
    console.log('=====================================');
    console.log(`✅ Existing coordinators: ${existingCoordinators.length}`);
    console.log(`🆕 Created coordinators: ${createdCoordinators.length}`);
    console.log(`📋 Total departments: ${departments.length}`);

    if (createdCoordinators.length > 0) {
      console.log('\n🆕 Newly Created Coordinators:');
      createdCoordinators.forEach(({ department, email }) => {
        const password = department.toLowerCase() + '123456';
        console.log(`   ${department}: ${email} / Password: ${password}`);
      });
    }

    if (existingCoordinators.length + createdCoordinators.length === departments.length) {
      console.log('\n✅ All departments have coordinators!');
      console.log('\n📌 Complaint Workflow:');
      console.log('   1. Student submits complaint → Assigned to Coordinator');
      console.log('   2. Coordinator → Can forward to Additional HOD or Dean');
      console.log('   3. Additional HOD → Can escalate to Dean');
      console.log('   4. Dean → Can forward to external departments (Library, Maintenance, Accounts)');
    } else {
      console.log('\n⚠️  Some departments are missing coordinators!');
    }

    console.log('=====================================\n');

  } catch (error) {
    console.error('❌ Error ensuring coordinators:', error.message);
    throw error;
  } finally {
    // Close database connection
    await mongoose.connection.close();
    console.log('Database connection closed');
  }
};

// Run if this file is executed directly
if (require.main === module) {
  ensureCoordinators()
    .then(() => {
      console.log('✅ Coordinator check completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Coordinator check failed:', error);
      process.exit(1);
    });
}

module.exports = { ensureCoordinators };

