const Booking = require('../models/Booking');
const Provider = require('../models/Provider');
const User = require('../models/User');

// @desc    Create a new booking request
// @route   POST /api/bookings
// @access  Private (Customer)
const createBooking = async (req, res) => {
  try {
    const {
      providerId,
      serviceCategory,
      serviceTitle,
      date,
      timeSlot,
      address,
      city,
      lat,
      long,
      budget,
      notes
    } = req.body;

    if (!providerId || !date || !timeSlot) {
      return res.status(400).json({
        success: false,
        message: 'Provider ID, date, and time slot are required'
      });
    }

    const provider = await Provider.findById(providerId).populate('userId');
    if (!provider) {
      return res.status(404).json({ success: false, message: 'Provider not found' });
    }

    const booking = await Booking.create({
      customerId: req.user._id,
      providerId: provider._id,
      serviceCategory: serviceCategory || provider.category,
      serviceTitle: serviceTitle || `${provider.category} Service`,
      date: new Date(date),
      timeSlot,
      location: {
        address: address || req.user.address || `${city || 'Lahore'}, Pakistan`,
        city: city || req.user.city || 'Lahore',
        lat: Number(lat) || req.user.lat || 31.5204,
        long: Number(long) || req.user.long || 74.3587
      },
      budget: Number(budget) || provider.priceRange.min || 1000,
      notes: notes || '',
      status: 'pending',
      statusHistory: [
        {
          status: 'pending',
          updatedAt: new Date(),
          note: 'Booking request placed by customer'
        }
      ]
    });

    const populatedBooking = await Booking.findById(booking._id)
      .populate('customerId', 'name email phone avatar city address')
      .populate({
        path: 'providerId',
        populate: { path: 'userId', select: 'name email phone avatar' }
      });

    // Emit Socket.io event to provider's room if socket instance exists
    const io = req.app.get('io');
    if (io) {
      const providerUserId = provider.userId._id.toString();
      io.to(`user_${providerUserId}`).emit('new_booking_request', {
        message: `New booking request from ${req.user.name} for ${booking.serviceCategory}`,
        booking: populatedBooking
      });
    }

    res.status(201).json({
      success: true,
      message: 'Booking request created successfully',
      booking: populatedBooking
    });
  } catch (error) {
    console.error('[Create Booking Error]:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get bookings for currently logged in user (Customer or Provider)
// @route   GET /api/bookings/my
// @access  Private
const getMyBookings = async (req, res) => {
  try {
    const { status } = req.query;
    let query = {};

    if (req.user.role === 'customer') {
      query.customerId = req.user._id;
    } else if (req.user.role === 'provider') {
      const provider = await Provider.findOne({ userId: req.user._id });
      if (!provider) {
        return res.status(200).json({ success: true, bookings: [] });
      }
      query.providerId = provider._id;
    } else if (req.user.role === 'admin') {
      // Admin sees all
    }

    if (status && status !== 'all') {
      query.status = status;
    }

    const bookings = await Booking.find(query)
      .populate('customerId', 'name email phone avatar city address')
      .populate({
        path: 'providerId',
        populate: { path: 'userId', select: 'name email phone avatar' }
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

// @desc    Get single booking by ID
// @route   GET /api/bookings/:id
// @access  Private
const getBookingById = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('customerId', 'name email phone avatar city address')
      .populate({
        path: 'providerId',
        populate: { path: 'userId', select: 'name email phone avatar' }
      });

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    // Ensure only involved parties or admin can access
    const isCustomer = booking.customerId._id.toString() === req.user._id.toString();
    const isProvider =
      booking.providerId?.userId?._id?.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isCustomer && !isProvider && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this booking'
      });
    }

    res.status(200).json({
      success: true,
      booking
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update booking status (accept, reject, complete, cancel)
// @route   PUT /api/bookings/:id/status
// @access  Private
const updateBookingStatus = async (req, res) => {
  try {
    const { status, note, finalPrice } = req.body;
    const allowedStatuses = ['accepted', 'completed', 'cancelled', 'rejected'];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Must be one of: ${allowedStatuses.join(', ')}`
      });
    }

    const booking = await Booking.findById(req.params.id)
      .populate('customerId', 'name email phone')
      .populate({
        path: 'providerId',
        populate: { path: 'userId', select: 'name email phone' }
      });

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    const isCustomer = booking.customerId._id.toString() === req.user._id.toString();
    const isProvider =
      booking.providerId?.userId?._id?.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isCustomer && !isProvider && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this booking'
      });
    }

    // Role-specific permission logic
    if (isCustomer && status !== 'cancelled') {
      return res.status(403).json({
        success: false,
        message: 'Customers can only cancel bookings'
      });
    }

    // Apply status update
    booking.status = status;
    if (finalPrice) {
      booking.finalPrice = Number(finalPrice);
    } else if (!booking.finalPrice) {
      booking.finalPrice = booking.budget;
    }

    booking.statusHistory.push({
      status,
      updatedAt: new Date(),
      note: note || `Status updated to ${status} by ${req.user.name} (${req.user.role})`
    });

    await booking.save();

    // If completed, update provider earnings & completed count
    if (status === 'completed') {
      await Provider.findByIdAndUpdate(booking.providerId._id, {
        $inc: {
          completedBookingsCount: 1,
          totalEarnings: booking.finalPrice || booking.budget || 0
        }
      });
    }

    // Real-time notification via Socket.io
    const io = req.app.get('io');
    if (io) {
      // Notify customer
      const customerUserId = booking.customerId._id.toString();
      io.to(`user_${customerUserId}`).emit('booking_status_updated', {
        message: `Your booking for ${booking.serviceCategory} was updated to: ${status.toUpperCase()}`,
        bookingId: booking._id,
        status,
        booking
      });

      // Notify provider if customer cancelled
      if (booking.providerId?.userId?._id) {
        const providerUserId = booking.providerId.userId._id.toString();
        io.to(`user_${providerUserId}`).emit('booking_status_updated', {
          message: `Booking #${booking._id.toString().slice(-6)} status updated to: ${status.toUpperCase()}`,
          bookingId: booking._id,
          status,
          booking
        });
      }

      // Room notification
      io.to(`booking_${booking._id}`).emit('booking_update', {
        bookingId: booking._id,
        status,
        booking
      });
    }

    res.status(200).json({
      success: true,
      message: `Booking marked as ${status}`,
      booking
    });
  } catch (error) {
    console.error('[Update Booking Status Error]:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  createBooking,
  getMyBookings,
  getBookingById,
  updateBookingStatus
};
