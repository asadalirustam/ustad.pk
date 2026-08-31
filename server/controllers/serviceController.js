const Service = require('../models/Service');

// @desc    Get all service categories
// @route   GET /api/services
// @access  Public
const getAllServices = async (req, res) => {
  try {
    const services = await Service.find().sort({ category: 1 });
    res.status(200).json({
      success: true,
      count: services.length,
      services
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create new service (Admin)
// @route   POST /api/services
// @access  Private (Admin)
const createService = async (req, res) => {
  try {
    const { name, category, description, icon, basePrice, estimatedDuration } = req.body;

    const service = await Service.create({
      name,
      category,
      description,
      icon: icon || 'Wrench',
      basePrice: Number(basePrice) || 500,
      estimatedDuration: estimatedDuration || '1 - 2 hours'
    });

    res.status(201).json({
      success: true,
      message: 'Service created successfully',
      service
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getAllServices,
  createService
};
