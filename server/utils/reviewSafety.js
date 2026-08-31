const Review = require('../models/Review');
const Provider = require('../models/Provider');

/**
 * Checks for potential fake review anomalies:
 * If a customer submits 3+ reviews for the same provider within a short window (e.g., 7 days)
 * returns { isFlagged: true, reason: string }
 */
const detectFakeReviewAnomaly = async (customerId, providerId, currentBookingId) => {
  // Check reviews by this customer for this provider in the last 7 days
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  const recentReviewsCount = await Review.countDocuments({
    customerId,
    providerId,
    createdAt: { $gte: sevenDaysAgo }
  });

  // If customer already has 2 or more reviews for this same provider in the last 7 days, this 3rd one gets flagged
  if (recentReviewsCount >= 2) {
    return {
      isFlagged: true,
      reason: `Anti-Fraud Rule Triggered: Customer submitted ${recentReviewsCount + 1} reviews for the same provider within 7 days.`
    };
  }

  // Also check total lifetime reviews by this customer for this provider
  const lifetimeReviewsCount = await Review.countDocuments({
    customerId,
    providerId
  });

  if (lifetimeReviewsCount >= 4) {
    return {
      isFlagged: true,
      reason: `Anti-Fraud Rule Triggered: Suspiciously high review frequency (${lifetimeReviewsCount + 1} reviews for single provider).`
    };
  }

  return {
    isFlagged: false,
    reason: ''
  };
};

/**
 * Recalculates provider average rating and review count from all non-flagged reviews
 */
const recalculateProviderRating = async (providerId) => {
  try {
    const reviews = await Review.find({
      providerId,
      flagged: false // Only calculate from clean, approved reviews
    });

    if (reviews.length === 0) {
      await Provider.findByIdAndUpdate(providerId, {
        avgRating: 0,
        totalReviews: 0
      });
      return { avgRating: 0, totalReviews: 0 };
    }

    const sum = reviews.reduce((acc, curr) => acc + curr.rating, 0);
    const avgRating = Math.round((sum / reviews.length) * 10) / 10;
    const totalReviews = reviews.length;

    await Provider.findByIdAndUpdate(providerId, {
      avgRating,
      totalReviews
    });

    return { avgRating, totalReviews };
  } catch (error) {
    console.error('[Review Safety] Rating recalculation error:', error.message);
    throw error;
  }
};

module.exports = {
  detectFakeReviewAnomaly,
  recalculateProviderRating
};
