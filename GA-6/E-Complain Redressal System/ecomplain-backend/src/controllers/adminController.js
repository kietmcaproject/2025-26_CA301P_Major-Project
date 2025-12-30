const { asyncHandler } = require('../middleware/errorHandler');
const Admin = require('../models/Admin');

// @desc    Get additional HODs for a specific department
// @route   GET /api/admin/additional-hods
// @access  Private (Dean, Coordinator, Super Admin)
const getAdditionalHODs = asyncHandler(async (req, res) => {
  const { department } = req.query;
  const { user } = req;

  // Only Deans, coordinators and super admins can access this
  if (user.role !== 'dean' && user.role !== 'coordinator' && user.role !== 'super_admin') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Only Deans, Coordinators and Super Admins can access this resource.'
    });
  }

  try {
    let query = { role: 'additional_hod', isActive: true };
    
    // If user is Dean, only show additional HODs from their department
    if (user.role === 'dean' || user.role === 'coordinator') {
      query.department = user.department;
    } else if (department) {
      // Super admin can specify department
      query.department = department;
    }

    const additionalHODs = await Admin.find(query)
      .select('firstName lastName email department')
      .sort({ firstName: 1 })
      .lean(); // Use lean() for read-only queries

    res.json({
      success: true,
      admins: additionalHODs
    });
  } catch (error) {
    console.error('Error fetching additional HODs:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch additional HODs'
    });
  }
});

// @desc    Get Deans for a specific department
// @route   GET /api/admin/deans
// @access  Private (Coordinator, Super Admin)
const getDeans = asyncHandler(async (req, res) => {
  const { department } = req.query;
  const { user } = req;

  if (user.role !== 'coordinator' && user.role !== 'super_admin') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Only Coordinators and Super Admins can access this resource.'
    });
  }

  try {
    const query = { role: 'dean', isActive: true };
    if (user.role === 'coordinator') {
      query.department = user.department;
    } else if (department) {
      query.department = department;
    }

    const deans = await Admin.find(query)
      .select('firstName lastName email department')
      .sort({ firstName: 1 })
      .lean(); // Use lean() for read-only queries

    res.json({ success: true, admins: deans });
  } catch (error) {
    console.error('Error fetching Deans:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch Deans' });
  }
});

module.exports = {
  getAdditionalHODs,
  getDeans
};
