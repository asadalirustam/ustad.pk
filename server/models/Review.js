const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
  {
    bookingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Booking',
      required: true,
      unique: true
    },
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    providerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Provider',
      required: true
    },
    rating: {
      type: Number,
      required: [true, 'Please provide a rating between 1 and 5'],
      min: [1, 'Rating must be at least 1'],
      max: [5, 'Rating cannot exceed 5']
    },
    comment: {
      type: String,
      required: [true, 'Please provide review comment'],
      trim: true,
      maxlength: [1000, 'Comment cannot exceed 1000 characters']
    },
    flagged: {
      type: Boolean,
      default: false
    },
    flagReason: {
      type: String,
      default: ''
    },
    adminReviewed: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true
  }
);

reviewSchema.index({ customerId: 1, providerId: 1, createdAt: -1 });

const Review = mongoose.model('Review', reviewSchema);
module.exports = Review;
