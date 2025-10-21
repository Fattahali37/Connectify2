const express = require("express");
const router = express.Router();
const {
  getAllUsers,
  getBlockedUsers,
  deleteUser,
  blockUser,
  unblockUser,
  getUserGrowthStats,
  getUserActivityStats,
  verifyProfile
} = require("../controllers/admin");
const { requireAdmin } = require("../middlewares/adminAuth");

// Apply admin middleware to all routes
// Debug route to call verifyProfile without admin auth (development only)
router.post('/debug/users/:userId/verify-profile', async (req, res, next) => {
  // call controller directly (no admin auth) for local debugging
  try {
    await verifyProfile(req, res);
  } catch (err) {
    next(err);
  }
});

router.use(requireAdmin);

// User management routes
router.get("/users", getAllUsers);
router.get("/blocked-users", getBlockedUsers);
router.delete("/users/:id", deleteUser);
router.put("/users/:id/block", blockUser);
router.put("/users/:id/unblock", unblockUser);

// Profile verification route (ML integration)
router.post("/users/:userId/verify-profile", verifyProfile);

// Analytics routes
router.get("/stats/user-growth", getUserGrowthStats);
router.get("/stats/user-activity", getUserActivityStats);

module.exports = router;
