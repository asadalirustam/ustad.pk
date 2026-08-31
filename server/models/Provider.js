const mongoose = require('mongoose');

const availabilitySchema = new mongoose.Schema(
  {
    day: {
      type: String,
      enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
      required: true
    },
    slots: {
      type: [String],
      default: ['09:00 - 12:00', '12:00 - 15:00', '15:00 - 18:00', '18:00 - 21:00']
    }
  },
  { _id: false }
);

const providerSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true
    },
    category: {
      type: String,
      required: [true, 'Please specify a service category'],
      trim: true,
      enum: [
        'Electrician',
        'Plumber',
        'AC Mechanic',
        'Home Tutor',
        'Painter',
        'Carpenter',
        'Cleaner',
        'Appliance Repair',
        'CCTV & Security',
        'Gardener / Landscaping'
      ]
    },
    skills: {
      type: [String],
      default: []
    },
    bio: {
      type: String,
      default: '',
      maxlength: [1000, 'Bio cannot exceed 1000 characters']
    },
    priceRange: {
      min: {
        type: Number,
        required: true,
        default: 500
      },
      max: {
        type: Number,
        required: true,
        default: 2500
      }
    },
    location: {
      lat: {
        type: Number,
        required: true,
        default: 31.5204 // Default Lahore lat
      },
      long: {
        type: Number,
        required: true,
        default: 74.3587 // Default Lahore long
      },
      city: {
        type: String,
        required: true,
        default: 'Lahore'
      },
      address: {
        type: String,
        default: 'Gulberg, Lahore'
      }
    },
    availability: {
      type: [availabilitySchema],
      default: [
        { day: 'Monday', slots: ['09:00 - 12:00', '14:00 - 17:00'] },
        { day: 'Tuesday', slots: ['09:00 - 12:00', '14:00 - 17:00'] },
        { day: 'Wednesday', slots: ['09:00 - 12:00', '14:00 - 17:00'] },
        { day: 'Thursday', slots: ['09:00 - 12:00', '14:00 - 17:00'] },
        { day: 'Friday', slots: ['09:00 - 12:00', '14:30 - 18:00'] },
        { day: 'Saturday', slots: ['10:00 - 15:00'] }
      ]
    },
    avgRating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    totalReviews: {
      type: Number,
      default: 0
    },
    completedBookingsCount: {
      type: Number,
      default: 0
    },
    totalEarnings: {
      type: Number,
      default: 0
    },
    experienceYears: {
      type: Number,
      default: 3
    },
    verified: {
      type: Boolean,
      default: false
    },
    verificationDocuments: {
      cnicNumber: { type: String, default: '' },
      submittedAt: { type: Date, default: Date.now }
    }
  },
  {
    timestamps: true
  }
);

// Helpful index for search
providerSchema.index({ category: 1, 'location.city': 1, verified: 1 });

const Provider = mongoose.model('Provider', providerSchema);
module.exports = Provider;
