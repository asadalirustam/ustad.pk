const express = require('express');
const router = express.Router();
const {
  getAllServices,
  createService
} = require('../controllers/serviceController');
const { protect, authorize } = require('../middleware/auth');

router.get('/', getAllServices);
router.post('/', protect, authorize('admin'), createService);

module.exports = router;
