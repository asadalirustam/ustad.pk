const express = require('express');
const router = express.Router();
const {
  createBooking,
  getMyBookings,
  getBookingById,
  updateBookingStatus
} = require('../controllers/bookingController');
const { protect } = require('../middleware/auth');

router.use(protect); // All booking routes require authentication

router.post('/', createBooking);
router.get('/my', getMyBookings);
router.get('/:id', getBookingById);
router.put('/:id/status', updateBookingStatus);

module.exports = router;
