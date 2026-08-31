const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide service name'],
      trim: true
    },
    category: {
      type: String,
      required: [true, 'Please specify category'],
      trim: true
    },
    description: {
      type: String,
      default: ''
    },
    icon: {
      type: String,
      default: 'Wrench' // Lucide icon identifier
    },
    basePrice: {
      type: Number,
      default: 500
    },
    estimatedDuration: {
      type: String,
      default: '1 - 2 hours'
    }
  },
  {
    timestamps: true
  }
);

const Service = mongoose.model('Service', serviceSchema);
module.exports = Service;
