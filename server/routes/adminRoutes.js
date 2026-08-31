const express = require('express');
const router = express.Router();
const {
  getAdminAnalytics,
  getAdminProviders,
  toggleProviderVerification,
  getAdminBookings
} = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/auth');

// All admin routes strictly guarded
router.use(protect);
router.use(authorize('admin'));

router.get('/analytics', getAdminAnalytics);
router.get('/providers', getAdminProviders);
router.put('/providers/:id/verify', toggleProviderVerification);
router.get('/bookings', getAdminBookings);

module.exports = router;
