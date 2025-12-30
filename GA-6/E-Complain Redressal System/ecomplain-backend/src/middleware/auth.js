const jwt = require('jsonwebtoken');
const Student = require('../models/Student');
const Admin = require('../models/Admin');

// Middleware to authenticate JWT token
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access token is required'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Determine user type and fetch user data
    let user;
    if (decoded.userType === 'student') {
      user = await Student.findById(decoded.userId).select('-password');
    } else if (decoded.userType === 'admin') {
      user = await Admin.findById(decoded.userId).select('-password');
    } else {
      return res.status(401).json({
        success: false,
        message: 'Invalid token type'
      });
    }

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User not found'
      });
    }

    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Account is deactivated'
      });
    }

    req.user = user;
    req.userType = decoded.userType;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token'
      });
    } else if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token has expired'
      });
    }
    
    console.error('Auth middleware error:', error);
    return res.status(500).json({
      success: false,
      message: 'Authentication error'
    });
  }
};

// Middleware to check if user is a student
const requireStudent = (req, res, next) => {
  if (req.userType !== 'student') {
    return res.status(403).json({
      success: false,
      message: 'Student access required'
    });
  }
  next();
};

// Middleware to check if user is an admin
const requireAdmin = (req, res, next) => {
  if (req.userType !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Admin access required'
    });
  }
  next();
};

// Middleware to check admin role
const requireRole = (...roles) => {
  return (req, res, next) => {
    if (req.userType !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Admin access required'
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. Required role: ${roles.join(' or ')}`
      });
    }
    next();
  };
};

// Middleware to check admin permissions
const requirePermission = (permission) => {
  return (req, res, next) => {
    if (req.userType !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Admin access required'
      });
    }

    if (!req.user.hasPermission(permission)) {
      return res.status(403).json({
        success: false,
        message: `Permission denied. Required permission: ${permission}`
      });
    }
    next();
  };
};

// Middleware to check if user owns the resource or is admin
const requireOwnershipOrAdmin = (resourceUserIdField = 'student') => {
  return (req, res, next) => {
    // Admin can access any resource
    if (req.userType === 'admin') {
      return next();
    }

    // Student can only access their own resources
    if (req.userType === 'student') {
      const resourceUserId = req.params[resourceUserIdField] || req.body[resourceUserIdField];
      if (resourceUserId && resourceUserId.toString() !== req.user._id.toString()) {
        return res.status(403).json({
          success: false,
          message: 'Access denied. You can only access your own resources'
        });
      }
    }

    next();
  };
};

// Middleware to check if admin can manage specific department
const requireDepartmentAccess = (req, res, next) => {
  if (req.userType !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Admin access required'
    });
  }

  // Super admin can access all departments
  if (req.user.role === 'super_admin') {
    return next();
  }

  // HOD and coordinators can only access their department
  const targetDepartment = req.params.department || req.body.department;
  if (targetDepartment && targetDepartment !== req.user.department && targetDepartment !== 'General') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. You can only manage complaints from your department'
    });
  }

  next();
};

// Optional authentication middleware (doesn't fail if no token)
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      let user;
      if (decoded.userType === 'student') {
        user = await Student.findById(decoded.userId).select('-password');
      } else if (decoded.userType === 'admin') {
        user = await Admin.findById(decoded.userId).select('-password');
      }

      if (user && user.isActive) {
        req.user = user;
        req.userType = decoded.userType;
      }
    }
    
    next();
  } catch (error) {
    // Continue without authentication if token is invalid
    next();
  }
};

module.exports = {
  authenticateToken,
  requireStudent,
  requireAdmin,
  requireRole,
  requirePermission,
  requireOwnershipOrAdmin,
  requireDepartmentAccess,
  optionalAuth
};
