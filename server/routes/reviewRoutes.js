const express = require('express');
const router = express.Router();
const {
  createReview,
  getProviderReviews,
  getFlaggedReviews,
  moderateReview
} = require('../controllers/reviewController');
const { protect, authorize } = require('../middleware/auth');

router.get('/provider/:providerId', getProviderReviews);
router.post('/', protect, authorize('customer'), createReview);
router.get('/admin/flagged', protect, authorize('admin'), getFlaggedReviews);
router.put('/admin/:id/moderate', protect, authorize('admin'), moderateReview);

module.exports = router;
