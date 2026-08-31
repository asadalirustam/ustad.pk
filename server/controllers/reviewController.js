const Review = require('../models/Review');
const Booking = require('../models/Booking');
const Provider = require('../models/Provider');
const {
  detectFakeReviewAnomaly,
  recalculateProviderRating
} = require('../utils/reviewSafety');

// @desc    Create a review for a completed booking
// @route   POST /api/reviews
// @access  Private (Customer)
const createReview = async (req, res) => {
  try {
    const { bookingId, rating, comment } = req.body;

    if (!bookingId || !rating || !comment) {
      return res.status(400).json({
        success: false,
        message: 'Booking ID, rating (1-5), and comment are required'
      });
    }

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    // Verify ownership
    if (booking.customerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You can only review bookings made from your account'
      });
    }

    // Must be completed booking
    if (booking.status !== 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Reviews can only be submitted for completed bookings'
      });
    }

    // Check if review already exists for this booking
    const existingReview = await Review.findOne({ bookingId });
    if (existingReview) {
      return res.status(400).json({
        success: false,
        message: 'A review has already been submitted for this booking'
      });
    }

    // Run Anti-Fraud / Fake Review Detection
    const fraudCheck = await detectFakeReviewAnomaly(
      req.user._id,
      booking.providerId,
      booking._id
    );

    const review = await Review.create({
      bookingId,
      customerId: req.user._id,
      providerId: booking.providerId,
      rating: Number(rating),
      comment: comment.trim(),
      flagged: fraudCheck.isFlagged,
      flagReason: fraudCheck.reason || ''
    });

    // Mark booking as reviewed
    booking.hasReview = true;
    await booking.save();

    // Auto recalculate provider average rating (if not flagged)
    if (!fraudCheck.isFlagged) {
      await recalculateProviderRating(booking.providerId);
    }

    const populatedReview = await Review.findById(review._id)
      .populate('customerId', 'name avatar city')
      .populate({
        path: 'providerId',
        populate: { path: 'userId', select: 'name' }
      });

    res.status(201).json({
      success: true,
      message: fraudCheck.isFlagged
        ? 'Review submitted, but held for moderation due to high-frequency safety check.'
        : 'Review submitted successfully!',
      review: populatedReview,
      flaggedNotice: fraudCheck.isFlagged ? fraudCheck.reason : null
    });
  } catch (error) {
    console.error('[Create Review Error]:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all reviews for a provider
// @route   GET /api/reviews/provider/:providerId
// @access  Public
const getProviderReviews = async (req, res) => {
  try {
    const reviews = await Review.find({
      providerId: req.params.providerId,
      flagged: false
    })
      .populate('customerId', 'name avatar city')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: reviews.length,
      reviews
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all flagged reviews for admin moderation
// @route   GET /api/reviews/admin/flagged
// @access  Private (Admin)
const getFlaggedReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ flagged: true })
      .populate('customerId', 'name email phone city')
      .populate({
        path: 'providerId',
        populate: { path: 'userId', select: 'name email phone' }
      })
      .populate('bookingId')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: reviews.length,
      reviews
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Moderate flagged review (Approve or Remove)
// @route   PUT /api/reviews/admin/:id/moderate
// @access  Private (Admin)
const moderateReview = async (req, res) => {
  try {
    const { action } = req.body; // 'approve' or 'remove'
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({ success: false, message: 'Review not found' });
    }

    if (action === 'approve') {
      review.flagged = false;
      review.adminReviewed = true;
      review.flagReason = 'Approved by admin';
      await review.save();
      await recalculateProviderRating(review.providerId);

      return res.status(200).json({
        success: true,
        message: 'Review approved and factored into provider rating',
        review
      });
    } else if (action === 'remove') {
      const providerId = review.providerId;
      await Review.findByIdAndDelete(req.params.id);
      await recalculateProviderRating(providerId);

      return res.status(200).json({
        success: true,
        message: 'Flagged review deleted permanently'
      });
    } else {
      return res.status(400).json({
        success: false,
        message: 'Invalid moderation action. Choose "approve" or "remove"'
      });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  createReview,
  getProviderReviews,
  getFlaggedReviews,
  moderateReview
};
