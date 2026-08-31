const express = require('express');
const router = express.Router();
const {
  getAllProviders,
  getProviderById,
  getSmartMatches,
  updateProviderProfile,
  getProviderDashboard,
  getCitiesList
} = require('../controllers/providerController');
const { protect, authorize } = require('../middleware/auth');

router.get('/', getAllProviders);
router.get('/cities/list', getCitiesList);
router.post('/match', getSmartMatches);
router.get('/dashboard/stats', protect, authorize('provider'), getProviderDashboard);
router.put('/profile', protect, authorize('provider'), updateProviderProfile);
router.get('/:id', getProviderById);

module.exports = router;
