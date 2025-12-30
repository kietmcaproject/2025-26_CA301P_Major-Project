const { clearCacheByPattern, deleteCache } = require('../middleware/cache');

/**
 * Cache helper utilities for invalidating cache when data changes
 */

/**
 * Invalidate dashboard cache for a specific user
 */
const invalidateDashboardCache = async (userId = null) => {
  if (userId) {
    await clearCacheByPattern(`cache:/api/dashboard*`);
  } else {
    await clearCacheByPattern(`cache:/api/dashboard*`);
  }
};

/**
 * Invalidate complaint-related caches
 */
const invalidateComplaintCache = async (complaintId = null) => {
  // Clear all complaint list caches
  await clearCacheByPattern(`cache:/api/complaints*`);
  
  // Clear specific complaint cache if ID provided
  if (complaintId) {
    await deleteCache(`cache:/api/complaints/${complaintId}*`);
  }
  
  // Also clear dashboard cache as it may show complaint stats
  await invalidateDashboardCache();
};

/**
 * Invalidate admin-related caches
 */
const invalidateAdminCache = async () => {
  await clearCacheByPattern(`cache:/api/admin/*`);
  await clearCacheByPattern(`cache:/api/super-admin/*`);
};

/**
 * Invalidate all caches (use with caution)
 */
const invalidateAllCache = async () => {
  await clearCacheByPattern(`cache:*`);
};

/**
 * Invalidate user-specific caches
 */
const invalidateUserCache = async (userId) => {
  if (!userId) return;
  
  // Clear user's dashboard
  await invalidateDashboardCache(userId);
  
  // Clear user's complaints
  await clearCacheByPattern(`cache:/api/complaints*student=${userId}*`);
};

module.exports = {
  invalidateDashboardCache,
  invalidateComplaintCache,
  invalidateAdminCache,
  invalidateAllCache,
  invalidateUserCache
};

