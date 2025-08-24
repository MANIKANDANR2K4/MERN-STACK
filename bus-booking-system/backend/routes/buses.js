const express = require('express');
const { body, validationResult } = require('express-validator');
const Bus = require('../models/Bus');
const User = require('../models/User');
const { protect, admin, driver } = require('../middleware/auth');
const { upload } = require('../middleware/upload');

const router = express.Router();

// @desc    Get all buses
// @route   GET /api/buses
// @access  Public
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const filter = { isActive: true };
    
    // Search by bus number or name
    if (req.query.search) {
      filter.$or = [
        { busNumber: { $regex: req.query.search, $options: 'i' } },
        { busName: { $regex: req.query.search, $options: 'i' } }
      ];
    }

    // Filter by bus type
    if (req.query.busType) {
      filter.busType = req.query.busType;
    }

    // Filter by status
    if (req.query.status) {
      filter.status = req.query.status;
    }

    // Filter by amenities
    if (req.query.amenities) {
      const amenities = req.query.amenities.split(',');
      filter.amenities = { $all: amenities };
    }

    const buses = await Bus.find(filter)
      .populate('driver', 'firstName lastName email phone')
      .populate('conductor', 'firstName lastName email phone')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Bus.countDocuments(filter);

    res.json({
      success: true,
      data: buses,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalBuses: total,
        busesPerPage: limit
      }
    });

  } catch (error) {
    console.error('Get buses error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching buses'
    });
  }
});

// @desc    Get bus by ID
// @route   GET /api/buses/:id
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const bus = await Bus.findById(req.params.id)
      .populate('driver', 'firstName lastName email phone profileImage')
      .populate('conductor', 'firstName lastName email phone profileImage');
    
    if (!bus || !bus.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Bus not found'
      });
    }

    res.json({
      success: true,
      data: bus
    });

  } catch (error) {
    console.error('Get bus error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching bus'
    });
  }
});

// @desc    Create new bus (Admin only)
// @route   POST /api/buses
// @access  Private/Admin
router.post('/', protect, admin, [
  body('busNumber').notEmpty().withMessage('Bus number is required'),
  body('busName').notEmpty().withMessage('Bus name is required'),
  body('busType').isIn(['standard', 'premium', 'luxury', 'sleeper', 'ac', 'non-ac']).withMessage('Invalid bus type'),
  body('capacity.totalSeats').isInt({ min: 1, max: 100 }).withMessage('Total seats must be between 1 and 100'),
  body('driver').isMongoId().withMessage('Valid driver ID is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { busNumber, busName, busType, capacity, amenities, specifications, driver, conductor } = req.body;

    // Check if bus number already exists
    const existingBus = await Bus.findOne({ busNumber });
    if (existingBus) {
      return res.status(400).json({
        success: false,
        message: 'Bus with this number already exists'
      });
    }

    // Verify driver exists and has driver role
    const driverUser = await User.findById(driver);
    if (!driverUser || driverUser.role !== 'driver') {
      return res.status(400).json({
        success: false,
        message: 'Driver not found or user is not a driver'
      });
    }

    // Verify conductor if provided
    if (conductor) {
      const conductorUser = await User.findById(conductor);
      if (!conductorUser) {
        return res.status(400).json({
          success: false,
          message: 'Conductor not found'
        });
      }
    }

    const bus = new Bus({
      busNumber,
      busName,
      busType,
      capacity,
      amenities: amenities || [],
      specifications: specifications || {},
      driver,
      conductor
    });

    await bus.save();

    const populatedBus = await Bus.findById(bus._id)
      .populate('driver', 'firstName lastName email phone')
      .populate('conductor', 'firstName lastName email phone');

    res.status(201).json({
      success: true,
      message: 'Bus created successfully',
      data: populatedBus
    });

  } catch (error) {
    console.error('Create bus error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while creating bus'
    });
  }
});

// @desc    Update bus (Admin only)
// @route   PUT /api/buses/:id
// @access  Private/Admin
router.put('/:id', protect, admin, upload.array('busImage', 5), async (req, res) => {
  try {
    const bus = await Bus.findById(req.params.id);
    
    if (!bus) {
      return res.status(404).json({
        success: false,
        message: 'Bus not found'
      });
    }

    const updates = req.body;

    // Update bus images if uploaded
    if (req.files && req.files.length > 0) {
      const newImages = req.files.map(file => ({
        url: `/uploads/buses/${file.filename}`,
        caption: file.originalname,
        isPrimary: false
      }));

      // Set first image as primary if no primary image exists
      if (bus.images.length === 0) {
        newImages[0].isPrimary = true;
      }

      bus.images.push(...newImages);
    }

    // Fields that can be updated
    const allowedUpdates = [
      'busName', 'busType', 'capacity', 'amenities', 'specifications', 
      'driver', 'conductor', 'status'
    ];

    allowedUpdates.forEach(field => {
      if (updates[field] !== undefined) {
        bus[field] = updates[field];
      }
    });

    await bus.save();

    const updatedBus = await Bus.findById(bus._id)
      .populate('driver', 'firstName lastName email phone')
      .populate('conductor', 'firstName lastName email phone');

    res.json({
      success: true,
      message: 'Bus updated successfully',
      data: updatedBus
    });

  } catch (error) {
    console.error('Update bus error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating bus'
    });
  }
});

// @desc    Delete bus (Admin only)
// @route   DELETE /api/buses/:id
// @access  Private/Admin
router.delete('/:id', protect, admin, async (req, res) => {
  try {
    const bus = await Bus.findById(req.params.id);
    
    if (!bus) {
      return res.status(404).json({
        success: false,
        message: 'Bus not found'
      });
    }

    // Soft delete - mark as inactive
    bus.isActive = false;
    await bus.save();

    res.json({
      success: true,
      message: 'Bus deleted successfully'
    });

  } catch (error) {
    console.error('Delete bus error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting bus'
    });
  }
});

// @desc    Update bus location (Driver only)
// @route   PUT /api/buses/:id/location
// @access  Private/Driver
router.put('/:id/location', protect, driver, [
  body('latitude').isFloat().withMessage('Valid latitude is required'),
  body('longitude').isFloat().withMessage('Valid longitude is required'),
  body('address').notEmpty().withMessage('Address is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const bus = await Bus.findById(req.params.id);
    
    if (!bus) {
      return res.status(404).json({
        success: false,
        message: 'Bus not found'
      });
    }

    // Check if user is the driver of this bus
    if (bus.driver.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this bus location'
      });
    }

    const { latitude, longitude, address } = req.body;
    await bus.updateLocation(latitude, longitude, address);

    // Emit real-time update via Socket.IO
    const io = req.app.get('io');
    if (io) {
      io.emit('bus-location-changed', {
        busId: bus._id,
        location: { latitude, longitude, address },
        timestamp: new Date()
      });
    }

    res.json({
      success: true,
      message: 'Bus location updated successfully',
      data: bus.currentLocation
    });

  } catch (error) {
    console.error('Update bus location error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating bus location'
    });
  }
});

// @desc    Add bus review
// @route   POST /api/buses/:id/reviews
// @access  Private
router.post('/:id/reviews', protect, [
  body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
  body('comment').optional().isLength({ max: 500 }).withMessage('Comment cannot exceed 500 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const bus = await Bus.findById(req.params.id);
    
    if (!bus || !bus.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Bus not found'
      });
    }

    const { rating, comment } = req.body;
    await bus.addReview(req.user.id, rating, comment);

    res.json({
      success: true,
      message: 'Review added successfully',
      data: {
        averageRating: bus.ratings.average,
        totalReviews: bus.ratings.totalReviews
      }
    });

  } catch (error) {
    console.error('Add bus review error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while adding review'
    });
  }
});

// @desc    Get bus reviews
// @route   GET /api/buses/:id/reviews
// @access  Public
router.get('/:id/reviews', async (req, res) => {
  try {
    const bus = await Bus.findById(req.params.id)
      .populate('ratings.reviews.user', 'firstName lastName profileImage');
    
    if (!bus || !bus.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Bus not found'
      });
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const reviews = bus.ratings.reviews
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(skip, skip + limit);

    res.json({
      success: true,
      data: {
        reviews,
        averageRating: bus.ratings.average,
        totalReviews: bus.ratings.totalReviews,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(bus.ratings.totalReviews / limit),
          totalReviews: bus.ratings.totalReviews,
          reviewsPerPage: limit
        }
      }
    });

  } catch (error) {
    console.error('Get bus reviews error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching reviews'
    });
  }
});

// @desc    Get buses near location
// @route   GET /api/buses/near/:latitude/:longitude
// @access  Public
router.get('/near/:latitude/:longitude', async (req, res) => {
  try {
    const { latitude, longitude } = req.params;
    const maxDistance = parseFloat(req.query.distance) || 10; // Default 10km

    const buses = await Bus.findNearLocation(
      parseFloat(latitude),
      parseFloat(longitude),
      maxDistance
    ).populate('driver', 'firstName lastName');

    res.json({
      success: true,
      data: buses
    });

  } catch (error) {
    console.error('Get buses near location error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching nearby buses'
    });
  }
});

// @desc    Get bus statistics (Admin only)
// @route   GET /api/buses/stats/overview
// @access  Private/Admin
router.get('/stats/overview', protect, admin, async (req, res) => {
  try {
    const totalBuses = await Bus.countDocuments();
    const activeBuses = await Bus.countDocuments({ status: 'active', isActive: true });
    const maintenanceBuses = await Bus.countDocuments({ status: 'maintenance' });
    const outOfServiceBuses = await Bus.countDocuments({ status: 'out-of-service' });

    // Bus type distribution
    const typeStats = await Bus.aggregate([
      { $group: { _id: '$busType', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    // Average occupancy
    const occupancyStats = await Bus.aggregate([
      { $match: { isActive: true } },
      {
        $group: {
          _id: null,
          avgOccupancy: { $avg: '$occupancyPercentage' },
          totalSeats: { $sum: '$capacity.totalSeats' },
          availableSeats: { $sum: '$capacity.availableSeats' }
        }
      }
    ]);

    res.json({
      success: true,
      data: {
        totalBuses,
        activeBuses,
        maintenanceBuses,
        outOfServiceBuses,
        typeStats,
        occupancyStats: occupancyStats[0] || {}
      }
    });

  } catch (error) {
    console.error('Get bus stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching bus statistics'
    });
  }
});

module.exports = router;
