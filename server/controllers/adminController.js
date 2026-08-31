const User = require('../models/User');
const Provider = require('../models/Provider');
const Booking = require('../models/Booking');
const Review = require('../models/Review');

// @desc    Get admin analytics overview
// @route   GET /api/admin/analytics
// @access  Private (Admin)
const getAdminAnalytics = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalCustomers = await User.countDocuments({ role: 'customer' });
    const totalProviders = await Provider.countDocuments();
    const verifiedProviders = await Provider.countDocuments({ verified: true });
    const pendingVerification = await Provider.countDocuments({ verified: false });

    const totalBookings = await Booking.countDocuments();
    const completedBookings = await Booking.countDocuments({ status: 'completed' });
    const pendingBookings = await Booking.countDocuments({ status: 'pending' });
    const cancelledBookings = await Booking.countDocuments({
      status: { $in: ['cancelled', 'rejected'] }
    });

    const flaggedReviewsCount = await Review.countDocuments({ flagged: true });

    // Aggregate bookings per category
    const categoryStats = await Booking.aggregate([
      {
        $group: {
          _id: '$serviceCategory',
          count: { $sum: 1 },
          totalRevenue: { $sum: '$finalPrice' }
        }
      },
      { $sort: { count: -1 } }
    ]);

    // Top active / highest earning providers
    const topProviders = await Provider.find()
      .populate('userId', 'name email phone avatar city')
      .sort({ completedBookingsCount: -1, avgRating: -1 })
      .limit(6);

    // Platform total volume / gross earnings
    const completedBookingDocs = await Booking.find({ status: 'completed' });
    const grossPlatformVolume = completedBookingDocs.reduce(
      (sum, b) => sum + (b.finalPrice || b.budget || 0),
      0
    );

    res.status(200).json({
      success: true,
      analytics: {
        users: {
          total: totalUsers,
          customers: totalCustomers,
          providers: totalProviders,
          verifiedProviders,
          pendingVerification
        },
        bookings: {
          total: totalBookings,
          completed: completedBookings,
          pending: pendingBookings,
          cancelled: cancelledBookings
        },
        finance: {
          grossVolume: grossPlatformVolume,
          avgJobValue:
            completedBookings > 0
              ? Math.round(grossPlatformVolume / completedBookings)
              : 0
        },
        reviews: {
          flaggedCount: flaggedReviewsCount
        },
        categoryBreakdown: categoryStats.map((item) => ({
          category: item._id || 'General',
          bookingsCount: item.count,
          volume: item.totalRevenue || 0
        })),
        topProviders
      }
    });
  } catch (error) {
    console.error('[Admin Analytics Error]:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all providers for admin management
// @route   GET /api/admin/providers
// @access  Private (Admin)
const getAdminProviders = async (req, res) => {
  try {
    const { verified } = req.query;
    const query = {};
    if (verified !== undefined && verified !== 'all') {
      query.verified = verified === 'true';
    }

    const providers = await Provider.find(query)
      .populate('userId', 'name email phone avatar city address createdAt')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: providers.length,
      providers
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Verify or unverify a provider
// @route   PUT /api/admin/providers/:id/verify
// @access  Private (Admin)
const toggleProviderVerification = async (req, res) => {
  try {
    const { verified } = req.body;
    const provider = await Provider.findById(req.params.id).populate('userId');

    if (!provider) {
      return res.status(404).json({ success: false, message: 'Provider not found' });
    }

    provider.verified = typeof verified === 'boolean' ? verified : !provider.verified;
    await provider.save();

    res.status(200).json({
      success: true,
      message: `Provider ${provider.userId?.name || ''} verification set to ${provider.verified}`,
      provider
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all bookings for admin oversight
// @route   GET /api/admin/bookings
// @access  Private (Admin)
const getAdminBookings = async (req, res) => {
  try {
    const { status, category } = req.query;
    const query = {};

    if (status && status !== 'all') {
      query.status = status;
    }
    if (category && category !== 'all') {
      query.serviceCategory = category;
    }

    const bookings = await Booking.find(query)
      .populate('customerId', 'name email phone city')
      .populate({
        path: 'providerId',
        populate: { path: 'userId', select: 'name email phone' }
      })
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: bookings.length,
      bookings
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getAdminAnalytics,
  getAdminProviders,
  toggleProviderVerification,
  getAdminBookings
};
