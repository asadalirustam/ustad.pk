const User = require('../models/User');
const Provider = require('../models/Provider');
const jwt = require('jsonwebtoken');

// Generate JWT token helper
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'ustaad_pk_secret', {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  });
};

// @desc    Register a new user (Customer / Provider / Admin)
// @route   POST /api/auth/register
// @access  Public
const register = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      role = 'customer',
      phone,
      city = 'Lahore',
      address,
      // Provider-specific fields
      category,
      skills,
      bio,
      priceMin,
      priceMax,
      experienceYears,
      lat,
      long
    } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User already exists with this email address'
      });
    }

    // Hash password
    const passwordHash = await User.hashPassword(password);

    // Create user
    const user = await User.create({
      name,
      email: email.toLowerCase(),
      passwordHash,
      role,
      phone: phone || '',
      city: city || 'Lahore',
      address: address || ''
    });

    let providerProfile = null;

    // If registering as a provider, create linked Provider document
    if (role === 'provider') {
      const skillsArray = Array.isArray(skills)
        ? skills
        : typeof skills === 'string' && skills.length > 0
        ? skills.split(',').map((s) => s.trim())
        : [category || 'General Service'];

      providerProfile = await Provider.create({
        userId: user._id,
        category: category || 'Electrician',
        skills: skillsArray,
        bio: bio || `Professional ${category || 'Service'} provider registered on Ustaad.pk.`,
        priceRange: {
          min: Number(priceMin) || 500,
          max: Number(priceMax) || 2500
        },
        location: {
          lat: Number(lat) || 31.5204,
          long: Number(long) || 74.3587,
          city: city || 'Lahore',
          address: address || `${city || 'Lahore'}, Pakistan`
        },
        experienceYears: Number(experienceYears) || 2,
        verified: false // Admin must verify
      });
    }

    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      message: 'Account registered successfully',
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        city: user.city,
        address: user.address
      },
      provider: providerProfile
    });
  } catch (error) {
    console.error('[Auth Register Error]:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error during registration'
    });
  }
};

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both email and password'
      });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // If provider, fetch provider profile
    let providerProfile = null;
    if (user.role === 'provider') {
      providerProfile = await Provider.findOne({ userId: user._id });
    }

    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        city: user.city,
        address: user.address
      },
      provider: providerProfile
    });
  } catch (error) {
    console.error('[Auth Login Error]:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error during login'
    });
  }
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-passwordHash');
    let providerProfile = null;

    if (user.role === 'provider') {
      providerProfile = await Provider.findOne({ userId: user._id });
    }

    res.status(200).json({
      success: true,
      user,
      provider: providerProfile
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch user profile'
    });
  }
};

// @desc    Update profile
// @route   PUT /api/auth/profile
// @access  Private
const updateProfile = async (req, res) => {
  try {
    const { name, phone, city, address } = req.body;
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (name) user.name = name;
    if (phone !== undefined) user.phone = phone;
    if (city) user.city = city;
    if (address !== undefined) user.address = address;

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        city: user.city,
        address: user.address
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  register,
  login,
  getMe,
  updateProfile
};
