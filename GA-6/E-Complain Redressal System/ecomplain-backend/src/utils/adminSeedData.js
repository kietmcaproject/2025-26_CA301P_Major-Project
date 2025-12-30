const Admin = require('../models/Admin');

// Default admin credentials for each department
const defaultAdmins = [
  // MCA Department
  {
    firstName: 'MCA',
    lastName: 'Coordinator',
    email: 'mca.coordinator@university.edu',
    password: 'mca123456',
    role: 'coordinator',
    department: 'MCA',
    isEmailVerified: true,
    isActive: true
  },
  {
    firstName: 'MCA',
    lastName: 'Additional HOD',
    email: 'mca.additional@university.edu',
    password: 'mca123456',
    role: 'additional_hod',
    department: 'MCA',
    isEmailVerified: true,
    isActive: true
  },
  {
    firstName: 'MCA',
    lastName: 'Dean',
    email: 'mca.dean@university.edu',
    password: 'mca123456',
    role: 'dean',
    department: 'MCA',
    isEmailVerified: true,
    isActive: true
  },

  // MBA Department
  {
    firstName: 'MBA',
    lastName: 'Coordinator',
    email: 'mba.coordinator@university.edu',
    password: 'mba123456',
    role: 'coordinator',
    department: 'MBA',
    isEmailVerified: true,
    isActive: true
  },
  {
    firstName: 'MBA',
    lastName: 'Additional HOD',
    email: 'mba.additional@university.edu',
    password: 'mba123456',
    role: 'additional_hod',
    department: 'MBA',
    isEmailVerified: true,
    isActive: true
  },
  {
    firstName: 'MBA',
    lastName: 'Dean',
    email: 'mba.dean@university.edu',
    password: 'mba123456',
    role: 'dean',
    department: 'MBA',
    isEmailVerified: true,
    isActive: true
  },

  // CSE Department
  {
    firstName: 'CSE',
    lastName: 'Coordinator',
    email: 'cse.coordinator@university.edu',
    password: 'cse123456',
    role: 'coordinator',
    department: 'CSE',
    isEmailVerified: true,
    isActive: true
  },
  {
    firstName: 'CSE',
    lastName: 'Additional HOD',
    email: 'cse.additional@university.edu',
    password: 'cse123456',
    role: 'additional_hod',
    department: 'CSE',
    isEmailVerified: true,
    isActive: true
  },
  {
    firstName: 'CSE',
    lastName: 'Dean',
    email: 'cse.dean@university.edu',
    password: 'cse123456',
    role: 'dean',
    department: 'CSE',
    isEmailVerified: true,
    isActive: true
  },

  // Electronics Department
  {
    firstName: 'Electronics',
    lastName: 'Coordinator',
    email: 'electronics.coordinator@university.edu',
    password: 'electronics123456',
    role: 'coordinator',
    department: 'Electronics',
    isEmailVerified: true,
    isActive: true
  },
  {
    firstName: 'Electronics',
    lastName: 'Additional HOD',
    email: 'electronics.additional@university.edu',
    password: 'electronics123456',
    role: 'additional_hod',
    department: 'Electronics',
    isEmailVerified: true,
    isActive: true
  },
  {
    firstName: 'Electronics',
    lastName: 'Dean',
    email: 'electronics.dean@university.edu',
    password: 'electronics123456',
    role: 'dean',
    department: 'Electronics',
    isEmailVerified: true,
    isActive: true
  },

  // Mechanical Department
  {
    firstName: 'Mechanical',
    lastName: 'Coordinator',
    email: 'mechanical.coordinator@university.edu',
    password: 'mechanical123456',
    role: 'coordinator',
    department: 'Mechanical',
    isEmailVerified: true,
    isActive: true
  },
  {
    firstName: 'Mechanical',
    lastName: 'Additional HOD',
    email: 'mechanical.additional@university.edu',
    password: 'mechanical123456',
    role: 'additional_hod',
    department: 'Mechanical',
    isEmailVerified: true,
    isActive: true
  },
  {
    firstName: 'Mechanical',
    lastName: 'Dean',
    email: 'mechanical.dean@university.edu',
    password: 'mechanical123456',
    role: 'dean',
    department: 'Mechanical',
    isEmailVerified: true,
    isActive: true
  },

  // Civil Department
  {
    firstName: 'Civil',
    lastName: 'Coordinator',
    email: 'civil.coordinator@university.edu',
    password: 'civil123456',
    role: 'coordinator',
    department: 'Civil',
    isEmailVerified: true,
    isActive: true
  },
  {
    firstName: 'Civil',
    lastName: 'Additional HOD',
    email: 'civil.additional@university.edu',
    password: 'civil123456',
    role: 'additional_hod',
    department: 'Civil',
    isEmailVerified: true,
    isActive: true
  },
  {
    firstName: 'Civil',
    lastName: 'Dean',
    email: 'civil.dean@university.edu',
    password: 'civil123456',
    role: 'dean',
    department: 'Civil',
    isEmailVerified: true,
    isActive: true
  },

  // Electrical Department
  {
    firstName: 'Electrical',
    lastName: 'Coordinator',
    email: 'electrical.coordinator@university.edu',
    password: 'electrical123456',
    role: 'coordinator',
    department: 'Electrical',
    isEmailVerified: true,
    isActive: true
  },
  {
    firstName: 'Electrical',
    lastName: 'Additional HOD',
    email: 'electrical.additional@university.edu',
    password: 'electrical123456',
    role: 'additional_hod',
    department: 'Electrical',
    isEmailVerified: true,
    isActive: true
  },
  {
    firstName: 'Electrical',
    lastName: 'Dean',
    email: 'electrical.dean@university.edu',
    password: 'electrical123456',
    role: 'dean',
    department: 'Electrical',
    isEmailVerified: true,
    isActive: true
  },

  // General Department (for complaints not specific to any department)
  {
    firstName: 'General',
    lastName: 'Coordinator',
    email: 'general.coordinator@university.edu',
    password: 'general123456',
    role: 'coordinator',
    department: 'General',
    isEmailVerified: true,
    isActive: true
  },
  {
    firstName: 'General',
    lastName: 'Additional HOD',
    email: 'general.additional@university.edu',
    password: 'general123456',
    role: 'additional_hod',
    department: 'General',
    isEmailVerified: true,
    isActive: true
  },
  {
    firstName: 'General',
    lastName: 'Dean',
    email: 'general.dean@university.edu',
    password: 'general123456',
    role: 'dean',
    department: 'General',
    isEmailVerified: true,
    isActive: true
  },

  // External Departments
  {
    firstName: 'Accounts',
    lastName: 'Department',
    email: 'accounts@university.edu',
    password: 'accounts123456',
    role: 'accounts',
    department: 'Accounts',
    isEmailVerified: true,
    isActive: true,
    permissions: {
      canManageComplaints: true,
      canManageStudents: false,
      canManageAdmins: false,
      canViewReports: true,
      canExportData: false
    }
  },
  {
    firstName: 'Library',
    lastName: 'Department',
    email: 'librarian@university.edu',
    password: 'librarian123456',
    role: 'librarian',
    department: 'Librarian',
    isEmailVerified: true,
    isActive: true,
    permissions: {
      canManageComplaints: true,
      canManageStudents: false,
      canManageAdmins: false,
      canViewReports: true,
      canExportData: false
    }
  },
  {
    firstName: 'Maintenance',
    lastName: 'Department',
    email: 'maintenance@university.edu',
    password: 'maintenance123456',
    role: 'maintenance',
    department: 'Maintenance',
    isEmailVerified: true,
    isActive: true,
    permissions: {
      canManageComplaints: true,
      canManageStudents: false,
      canManageAdmins: false,
      canViewReports: true,
      canExportData: false
    }
  }
];

// Super Admin account
const superAdmin = {
  firstName: 'Super',
  lastName: 'Administrator',
  email: 'superadmin@university.edu',
  password: 'superadmin123456',
  role: 'super_admin',
  recoveryEmail: 'pcwork309@gmail.com', // Real email for password recovery
  isEmailVerified: true,
  isActive: true
};

const seedAdmins = async (force = false) => {
  try {
    console.log('🌱 Seeding admin accounts...');

    // Check if admins already exist
    const existingAdmins = await Admin.countDocuments();
    if (existingAdmins > 0 && !force) {
      console.log('✅ Admin accounts already exist, skipping seed...');
      console.log('💡 To force re-seed, use: seedAdmins(true)');

      // Verify coordinators exist for all departments
      const departments = ['MCA', 'MBA', 'CSE', 'Electronics', 'Mechanical', 'Civil', 'Electrical', 'General'];
      const missingCoordinators = [];

      for (const dept of departments) {
        const coordinator = await Admin.findOne({
          role: 'coordinator',
          department: dept,
          isActive: true
        });

        if (!coordinator) {
          missingCoordinators.push(dept);
        }
      }

      if (missingCoordinators.length > 0) {
        console.log(`⚠️  Missing coordinators for departments: ${missingCoordinators.join(', ')}`);
        console.log('💡 Run seed with force=true to create missing coordinators');
      } else {
        console.log('✅ All coordinators are present for all departments');
      }

      return;
    }

    // If force is true, delete existing admins (except super admin)
    if (force && existingAdmins > 0) {
      console.log('🔄 Force mode: Removing existing admin accounts (except super admin)...');
      await Admin.deleteMany({ role: { $ne: 'super_admin' } });
    }

    // First create or get super admin
    let createdSuperAdmin = await Admin.findOne({ role: 'super_admin' });
    if (!createdSuperAdmin) {
      createdSuperAdmin = await Admin.createSuperAdmin(superAdmin);
      console.log('✅ Super admin created:', createdSuperAdmin.email);
    } else if (force) {
      // In force mode, reset super admin password and unlock account
      console.log('🔄 Force mode: Resetting super admin password and unlocking account...');
      createdSuperAdmin.password = superAdmin.password;
      createdSuperAdmin.recoveryEmail = superAdmin.recoveryEmail; // Set recovery email
      createdSuperAdmin.isLocked = false;
      createdSuperAdmin.failedLoginAttempts = 0;
      createdSuperAdmin.lockUntil = undefined;
      createdSuperAdmin.loginAttempts = 0;
      createdSuperAdmin.markModified('password');
      await createdSuperAdmin.save();
      console.log('✅ Super admin password reset, account unlocked, recovery email set:', createdSuperAdmin.email);
    } else {
      // Always ensure recovery email is set
      if (!createdSuperAdmin.recoveryEmail && superAdmin.recoveryEmail) {
        createdSuperAdmin.recoveryEmail = superAdmin.recoveryEmail;
        await createdSuperAdmin.save();
        console.log('✅ Super admin recovery email updated:', superAdmin.recoveryEmail);
      }
      console.log('✅ Super admin already exists:', createdSuperAdmin.email);
    }

    // Create all default admins with super admin as creator
    const createdAdmins = [];
    const skippedAdmins = [];

    for (const adminData of defaultAdmins) {
      // Check if admin already exists
      const existingAdmin = await Admin.findOne({
        email: adminData.email
      });

      if (existingAdmin && !force) {
        skippedAdmins.push(adminData.email);
        continue;
      }

      if (existingAdmin && force) {
        // Update existing admin
        // Mark password as modified to ensure it gets re-hashed
        existingAdmin.password = adminData.password;
        existingAdmin.markModified('password');
        Object.assign(existingAdmin, adminData);
        existingAdmin.createdBy = createdSuperAdmin._id;
        const savedAdmin = await existingAdmin.save();
        createdAdmins.push(savedAdmin);
      } else {
        // Create new admin
        const admin = new Admin({
          ...adminData,
          createdBy: createdSuperAdmin._id
        });
        const savedAdmin = await admin.save();
        createdAdmins.push(savedAdmin);
      }
    }

    if (skippedAdmins.length > 0) {
      console.log(`⚠️  Skipped ${skippedAdmins.length} existing admin accounts (use force=true to update)`);
    }

    console.log(`✅ Successfully created/updated ${createdAdmins.length} admin accounts:`);
    console.log('\n📋 Default Admin Credentials:');
    console.log('=====================================');
    console.log('\n📌 Complaint Workflow:');
    console.log('   1. Student submits complaint → Assigned to Coordinator');
    console.log('   2. Coordinator → Can forward to Additional HOD or Dean');
    console.log('   3. Additional HOD → Can escalate to Dean');
    console.log('   4. Dean → Can forward to external departments (Library, Maintenance, Accounts)');
    console.log('=====================================');

    // Group by department for better display
    const departmentGroups = {};
    [createdSuperAdmin, ...createdAdmins].forEach(admin => {
      if (admin.role === 'super_admin') {
        console.log(`\n🔑 Super Admin:`);
        console.log(`   Email: ${admin.email}`);
        console.log(`   Password: superadmin123456`);
      } else {
        if (!departmentGroups[admin.department]) {
          departmentGroups[admin.department] = [];
        }
        departmentGroups[admin.department].push(admin);
      }
    });

    // Display department-wise credentials
    Object.keys(departmentGroups).sort().forEach(dept => {
      console.log(`\n🏢 ${dept} Department:`);
      // Sort by role: coordinator, additional_hod, dean, accounts, librarian, maintenance
      const roleOrder = {
        'coordinator': 1,
        'additional_hod': 2,
        'dean': 3,
        'accounts': 4,
        'librarian': 5,
        'maintenance': 6
      };
      departmentGroups[dept]
        .sort((a, b) => (roleOrder[a.role] || 99) - (roleOrder[b.role] || 99))
        .forEach(admin => {
          const roleName = admin.role === 'additional_hod' ? 'Additional HOD' :
            admin.role === 'dean' ? 'Dean' :
              admin.role === 'coordinator' ? 'Coordinator' :
                admin.role === 'accounts' ? 'Accounts Department' :
                  admin.role === 'librarian' ? 'Librarian' :
                    admin.role === 'maintenance' ? 'Maintenance Department' : 'Unknown';
          const password = admin.role === 'accounts' ? 'accounts123456' :
            admin.role === 'librarian' ? 'librarian123456' :
              admin.role === 'maintenance' ? 'maintenance123456' :
                admin.department.toLowerCase() + '123456';
          console.log(`   ${roleName}: ${admin.email} / Password: ${password}`);
        });
    });

    console.log('\n⚠️  IMPORTANT: Change these default passwords after first login!');
    console.log('=====================================\n');

  } catch (error) {
    console.error('❌ Error seeding admin accounts:', error);
    throw error;
  }
};

module.exports = { seedAdmins, defaultAdmins, superAdmin };
