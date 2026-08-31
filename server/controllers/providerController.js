const Provider = require('../models/Provider');
const User = require('../models/User');
const Review = require('../models/Review');
const Booking = require('../models/Booking');
const { rankProviders, PAKISTAN_CITIES } = require('../utils/matching');

// @desc    Get all providers with filters and sorting
// @route   GET /api/providers
// @access  Public
const getAllProviders = async (req, res) => {
  try {
    const {
      category,
      city,
      minRating,
      priceMin,
      priceMax,
      verified,
      search,
      sortBy = 'rating'
    } = req.query;

    const query = {};

    if (category && category !== 'All') {
      query.category = category;
    }

    if (city && city !== 'All') {
      query['location.city'] = new RegExp(city, 'i');
    }

    if (verified === 'true') {
      query.verified = true;
    }

    if (minRating) {
      query.avgRating = { $gte: Number(minRating) };
    }

    if (priceMin || priceMax) {
      query['priceRange.min'] = {};
      if (priceMin) query['priceRange.min'].$gte = Number(priceMin);
      if (priceMax) query['priceRange.max'] = { $lte: Number(priceMax) };
    }

    let sortOptions = { avgRating: -1, totalReviews: -1 };
    if (sortBy === 'price_low') sortOptions = { 'priceRange.min': 1 };
    if (sortBy === 'price_high') sortOptions = { 'priceRange.max': -1 };
    if (sortBy === 'experience') sortOptions = { experienceYears: -1 };
    if (sortBy === 'newest') sortOptions = { createdAt: -1 };

    let providers = await Provider.find(query)
      .populate('userId', 'name email phone avatar city address')
      .sort(sortOptions);

    // Text search filter in memory if name or skills match
    if (search) {
      const term = search.toLowerCase();
      providers = providers.filter(
        (p) =>
          p.userId?.name?.toLowerCase().includes(term) ||
          p.category?.toLowerCase().includes(term) ||
          p.skills?.some((s) => s.toLowerCase().includes(term)) ||
          p.location?.city?.toLowerCase().includes(term) ||
          p.bio?.toLowerCase().includes(term)
      );
    }

    res.status(200).json({
      success: true,
      count: providers.length,
      providers
    });
  } catch (error) {
    console.error('[Get Providers Error]:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single provider by ID with populated reviews
// @route   GET /api/providers/:id
// @access  Public
const getProviderById = async (req, res) => {
  try {
    const provider = await Provider.findById(req.params.id).populate(
      'userId',
      'name email phone avatar city address'
    );

    if (!provider) {
      return res.status(404).json({ success: false, message: 'Provider not found' });
    }

    const reviews = await Review.find({
      providerId: provider._id,
      flagged: false
    })
      .populate('customerId', 'name avatar city')
      .sort({ createdAt: -1 })
      .limit(20);

    res.status(200).json({
      success: true,
      provider,
      reviews
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Smart AI Matching Algorithm Endpoint
// @route   POST /api/providers/match
// @access  Public
const getSmartMatches = async (req, res) => {
  try {
    const {
      category,
      customerLat,
      customerLong,
      customerCity,
      customerBudget,
      limit = 5
    } = req.body;

    const query = {};
    if (category && category !== 'All') {
      query.category = category;
    }

    // Fetch candidate providers in category
    let candidateProviders = await Provider.find(query).populate(
      'userId',
      'name email phone avatar city address'
    );

    // If customer provided a city name and no coords, resolve lat/long from city preset
    let targetLat = customerLat ? Number(customerLat) : undefined;
    let targetLong = customerLong ? Number(customerLong) : undefined;

    if ((!targetLat || !targetLong) && customerCity) {
      const cityPreset = PAKISTAN_CITIES.find(
        (c) => c.name.toLowerCase() === customerCity.toLowerCase()
      );
      if (cityPreset) {
        targetLat = cityPreset.lat;
        targetLong = cityPreset.long;
      }
    }

    // Default to Lahore coordinates if still unspecified
    if (!targetLat || !targetLong) {
      targetLat = 31.5204;
      targetLong = 74.3587;
    }

    // Execute Smart Matching Engine
    const matches = rankProviders(candidateProviders, {
      customerLat: targetLat,
      customerLong: targetLong,
      customerBudget: customerBudget ? Number(customerBudget) : undefined,
      limit: Number(limit) || 5
    });

    res.status(200).json({
      success: true,
      category: category || 'All',
      customerCoordinates: { lat: targetLat, long: targetLong },
      customerBudget: customerBudget || 'Not Specified',
      totalCandidates: candidateProviders.length,
      matchesCount: matches.length,
      matches
    });
  } catch (error) {
    console.error('[Smart Match Error]:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update provider profile
// @route   PUT /api/providers/profile
// @access  Private (Provider only)
const updateProviderProfile = async (req, res) => {
  try {
    let provider = await Provider.findOne({ userId: req.user._id });

    if (!provider) {
      return res.status(404).json({
        success: false,
        message: 'Provider profile not found for current user'
      });
    }

    const {
      category,
      skills,
      bio,
      priceMin,
      priceMax,
      city,
      address,
      lat,
      long,
      availability,
      experienceYears
    } = req.body;

    if (category) provider.category = category;
    if (skills) {
      provider.skills = Array.isArray(skills)
        ? skills
        : skills.split(',').map((s) => s.trim());
    }
    if (bio !== undefined) provider.bio = bio;
    if (priceMin || priceMax) {
      provider.priceRange = {
        min: Number(priceMin) || provider.priceRange.min,
        max: Number(priceMax) || provider.priceRange.max
      };
    }
    if (city || address || lat || long) {
      provider.location = {
        city: city || provider.location.city,
        address: address || provider.location.address,
        lat: lat ? Number(lat) : provider.location.lat,
        long: long ? Number(long) : provider.location.long
      };
    }
    if (availability) provider.availability = availability;
    if (experienceYears) provider.experienceYears = Number(experienceYears);

    await provider.save();
    const updated = await Provider.findById(provider._id).populate(
      'userId',
      'name email phone avatar'
    );

    res.status(200).json({
      success: true,
      message: 'Provider profile updated successfully',
      provider: updated
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get provider dashboard statistics
// @route   GET /api/providers/dashboard/stats
// @access  Private (Provider only)
const getProviderDashboard = async (req, res) => {
  try {
    const provider = await Provider.findOne({ userId: req.user._id });
    if (!provider) {
      return res.status(404).json({ success: false, message: 'Provider not found' });
    }

    const bookings = await Booking.find({ providerId: provider._id }).sort({
      createdAt: -1
    });

    const pendingCount = bookings.filter((b) => b.status === 'pending').length;
    const acceptedCount = bookings.filter((b) => b.status === 'accepted').length;
    const completedCount = bookings.filter((b) => b.status === 'completed').length;
    const cancelledCount = bookings.filter(
      (b) => b.status === 'cancelled' || b.status === 'rejected'
    ).length;

    // Total earnings from completed bookings
    const totalEarnings = bookings
      .filter((b) => b.status === 'completed')
      .reduce((sum, b) => sum + (b.finalPrice || b.budget || 0), 0);

    // Recent reviews
    const recentReviews = await Review.find({
      providerId: provider._id,
      flagged: false
    })
      .populate('customerId', 'name avatar')
      .sort({ createdAt: -1 })
      .limit(5);

    res.status(200).json({
      success: true,
      provider,
      stats: {
        totalBookings: bookings.length,
        pendingCount,
        acceptedCount,
        completedCount,
        cancelledCount,
        totalEarnings,
        avgRating: provider.avgRating,
        totalReviews: provider.totalReviews,
        verified: provider.verified
      },
      recentBookings: bookings.slice(0, 5),
      recentReviews
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get Pakistan cities list with coordinates
// @route   GET /api/providers/cities/list
// @access  Public
const getCitiesList = (req, res) => {
  res.status(200).json({
    success: true,
    cities: PAKISTAN_CITIES
  });
};

module.exports = {
  getAllProviders,
  getProviderById,
  getSmartMatches,
  updateProviderProfile,
  getProviderDashboard,
  getCitiesList
};
