const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema(
  {
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
    serviceCategory: {
      type: String,
      required: true
    },
    serviceTitle: {
      type: String,
      default: 'General Service'
    },
    date: {
      type: Date,
      required: [true, 'Please provide booking date']
    },
    timeSlot: {
      type: String,
      required: [true, 'Please select a time slot']
    },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'completed', 'cancelled', 'rejected'],
      default: 'pending'
    },
    location: {
      address: {
        type: String,
        required: true,
        default: 'Model Town, Lahore'
      },
      city: {
        type: String,
        required: true,
        default: 'Lahore'
      },
      lat: {
        type: Number,
        default: 31.5204
      },
      long: {
        type: Number,
        default: 74.3587
      }
    },
    budget: {
      type: Number,
      default: 1000
    },
    finalPrice: {
      type: Number,
      default: 0
    },
    notes: {
      type: String,
      default: '',
      maxlength: [500, 'Notes cannot exceed 500 characters']
    },
    hasReview: {
      type: Boolean,
      default: false
    },
    statusHistory: [
      {
        status: { type: String },
        updatedAt: { type: Date, default: Date.now },
        note: { type: String, default: '' }
      }
    ]
  },
  {
    timestamps: true
  }
);

bookingSchema.index({ customerId: 1, providerId: 1, status: 1 });

const Booking = mongoose.model('Booking', bookingSchema);
module.exports = Booking;
