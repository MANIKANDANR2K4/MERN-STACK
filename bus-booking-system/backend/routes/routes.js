const express = require('express');
const { body, validationResult } = require('express-validator');
const Route = require('../models/Route');
const { protect, admin } = require('../middleware/auth');

const router = express.Router();

// @desc    Get all routes
// @route   GET /api/routes
// @access  Public
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const filter = { isActive: true, status: 'active' };
    
    // Search by route number or name
    if (req.query.search) {
      filter.$or = [
        { routeNumber: { $regex: req.query.search, $options: 'i' } },
        { routeName: { $regex: req.query.search, $options: 'i' } }
      ];
    }

    // Filter by origin city
    if (req.query.origin) {
      filter['origin.city'] = { $regex: req.query.origin, $options: 'i' };
    }

    // Filter by destination city
    if (req.query.destination) {
      filter['destination.city'] = { $regex: req.query.destination, $options: 'i' };
    }

    // Filter by bus type
    if (req.query.busType) {
      filter.busType = req.query.busType;
    }

    // Filter by amenities
    if (req.query.amenities) {
      const amenities = req.query.amenities.split(',');
      filter.amenities = { $all: amenities };
    }

    // Filter by day of week
    if (req.query.day) {
      filter['schedule.daysOfWeek'] = req.query.day.toLowerCase();
    }

    const routes = await Route.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Route.countDocuments(filter);

    res.json({
      success: true,
      data: routes,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalRoutes: total,
        routesPerPage: limit
      }
    });

  } catch (error) {
    console.error('Get routes error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching routes'
    });
  }
});

// @desc    Get route by ID
// @route   GET /api/routes/:id
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const route = await Route.findById(req.params.id);
    
    if (!route || !route.isActive || route.status !== 'active') {
      return res.status(404).json({
        success: false,
        message: 'Route not found'
      });
    }

    res.json({
      success: true,
      data: route
    });

  } catch (error) {
    console.error('Get route error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching route'
    });
  }
});

// @desc    Create new route (Admin only)
// @route   POST /api/routes
// @access  Private/Admin
router.post('/', protect, admin, [
  body('routeNumber').notEmpty().withMessage('Route number is required'),
  body('routeName').notEmpty().withMessage('Route name is required'),
  body('origin.city').notEmpty().withMessage('Origin city is required'),
  body('origin.state').notEmpty().withMessage('Origin state is required'),
  body('origin.country').notEmpty().withMessage('Origin country is required'),
  body('destination.city').notEmpty().withMessage('Destination city is required'),
  body('destination.state').notEmpty().withMessage('Destination state is required'),
  body('destination.country').notEmpty().withMessage('Destination country is required'),
  body('distance.total').isFloat({ min: 1 }).withMessage('Distance must be greater than 0'),
  body('duration.estimated').isInt({ min: 1 }).withMessage('Duration must be greater than 0'),
  body('pricing.baseFare').isFloat({ min: 0 }).withMessage('Base fare cannot be negative'),
  body('schedule.departureTimes').isArray({ min: 1 }).withMessage('At least one departure time is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const {
      routeNumber,
      routeName,
      origin,
      destination,
      stops,
      distance,
      duration,
      schedule,
      pricing,
      amenities,
      restrictions
    } = req.body;

    // Check if route number already exists
    const existingRoute = await Route.findOne({ routeNumber });
    if (existingRoute) {
      return res.status(400).json({
        success: false,
        message: 'Route with this number already exists'
      });
    }

    const route = new Route({
      routeNumber,
      routeName,
      origin,
      destination,
      stops: stops || [],
      distance,
      duration,
      schedule,
      pricing,
      amenities: amenities || [],
      restrictions: restrictions || {}
    });

    await route.save();

    res.status(201).json({
      success: true,
      message: 'Route created successfully',
      data: route
    });

  } catch (error) {
    console.error('Create route error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while creating route'
    });
  }
});

// @desc    Update route (Admin only)
// @route   PUT /api/routes/:id
// @access  Private/Admin
router.put('/:id', protect, admin, async (req, res) => {
  try {
    const route = await Route.findById(req.params.id);
    
    if (!route) {
      return res.status(404).json({
        success: false,
        message: 'Route not found'
      });
    }

    const updates = req.body;

    // Fields that can be updated
    const allowedUpdates = [
      'routeName', 'origin', 'destination', 'stops', 'distance', 'duration',
      'schedule', 'pricing', 'amenities', 'restrictions', 'status'
    ];

    allowedUpdates.forEach(field => {
      if (updates[field] !== undefined) {
        route[field] = updates[field];
      }
    });

    await route.save();

    res.json({
      success: true,
      message: 'Route updated successfully',
      data: route
    });

  } catch (error) {
    console.error('Update route error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating route'
    });
  }
});

// @desc    Delete route (Admin only)
// @route   DELETE /api/routes/:id
// @access  Private/Admin
router.delete('/:id', protect, admin, async (req, res) => {
  try {
    const route = await Route.findById(req.params.id);
    
    if (!route) {
      return res.status(404).json({
        success: false,
        message: 'Route not found'
      });
    }

    // Soft delete - mark as inactive
    route.isActive = false;
    route.status = 'discontinued';
    await route.save();

    res.json({
      success: true,
      message: 'Route deleted successfully'
    });

  } catch (error) {
    console.error('Delete route error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting route'
    });
  }
});

// @desc    Search routes by origin and destination
// @route   GET /api/routes/search
// @access  Public
router.get('/search', async (req, res) => {
  try {
    const { origin, destination, date, passengers = 1 } = req.query;

    if (!origin || !destination) {
      return res.status(400).json({
        success: false,
        message: 'Origin and destination are required'
      });
    }

    const routes = await Route.findByOriginDestination(origin, destination);

    // Filter routes by date if provided
    let filteredRoutes = routes;
    if (date) {
      const searchDate = new Date(date);
      const dayOfWeek = searchDate.toLocaleDateString('en-US', { weekday: 'monday' }).toLowerCase();
      
      filteredRoutes = routes.filter(route => route.operatesOnDay(dayOfWeek));
    }

    // Calculate fares and add pricing information
    const routesWithPricing = filteredRoutes.map(route => {
      const baseFare = route.pricing.baseFare;
      const totalFare = baseFare * passengers;
      
      return {
        ...route.toObject(),
        pricing: {
          ...route.pricing,
          totalFare,
          perPassenger: baseFare
        }
      };
    });

    res.json({
      success: true,
      data: routesWithPricing,
      searchCriteria: {
        origin,
        destination,
        date,
        passengers
      }
    });

  } catch (error) {
    console.error('Search routes error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while searching routes'
    });
  }
});

// @desc    Get routes by day of week
// @route   GET /api/routes/day/:day
// @access  Public
router.get('/day/:day', async (req, res) => {
  try {
    const { day } = req.params;
    const validDays = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    
    if (!validDays.includes(day.toLowerCase())) {
      return res.status(400).json({
        success: false,
        message: 'Invalid day of week'
      });
    }

    const routes = await Route.findByDay(day);

    res.json({
      success: true,
      data: routes
    });

  } catch (error) {
    console.error('Get routes by day error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching routes by day'
    });
  }
});

// @desc    Get popular routes
// @route   GET /api/routes/popular
// @access  Public
router.get('/popular', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;

    // This would need to be implemented based on actual booking data
    // For now, return recent routes
    const popularRoutes = await Route.find({ isActive: true, status: 'active' })
      .sort({ createdAt: -1 })
      .limit(limit);

    res.json({
      success: true,
      data: popularRoutes
    });

  } catch (error) {
    console.error('Get popular routes error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching popular routes'
    });
  }
});

// @desc    Get route statistics (Admin only)
// @route   GET /api/routes/stats/overview
// @access  Private/Admin
router.get('/stats/overview', protect, admin, async (req, res) => {
  try {
    const totalRoutes = await Route.countDocuments();
    const activeRoutes = await Route.countDocuments({ isActive: true, status: 'active' });
    const inactiveRoutes = await Route.countDocuments({ isActive: true, status: 'inactive' });
    const discontinuedRoutes = await Route.countDocuments({ status: 'discontinued' });

    // Route frequency distribution
    const frequencyStats = await Route.aggregate([
      { $group: { _id: '$schedule.frequency', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    // Average distance and duration
    const avgStats = await Route.aggregate([
      { $match: { isActive: true } },
      {
        $group: {
          _id: null,
          avgDistance: { $avg: '$distance.total' },
          avgDuration: { $avg: '$duration.estimated' },
          avgFare: { $avg: '$pricing.baseFare' }
        }
      }
    ]);

    // Routes by origin city
    const originStats = await Route.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: '$origin.city', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    res.json({
      success: true,
      data: {
        totalRoutes,
        activeRoutes,
        inactiveRoutes,
        discontinuedRoutes,
        frequencyStats,
        avgStats: avgStats[0] || {},
        originStats
      }
    });

  } catch (error) {
    console.error('Get route stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching route statistics'
    });
  }
});

// @desc    Get route schedule
// @route   GET /api/routes/:id/schedule
// @access  Public
router.get('/:id/schedule', async (req, res) => {
  try {
    const route = await Route.findById(req.params.id);
    
    if (!route || !route.isActive || route.status !== 'active') {
      return res.status(404).json({
        success: false,
        message: 'Route not found'
      });
    }

    const { date } = req.query;
    let schedule = route.schedule;

    // If date is provided, check for seasonal adjustments
    if (date) {
      const searchDate = new Date(date);
      const seasonalAdjustment = route.schedule.seasonalAdjustments.find(adjustment => {
        return searchDate >= adjustment.startDate && searchDate <= adjustment.endDate;
      });

      if (seasonalAdjustment) {
        schedule = {
          ...route.schedule,
          ...seasonalAdjustment.adjustments
        };
      }
    }

    res.json({
      success: true,
      data: {
        routeId: route._id,
        routeName: route.routeName,
        schedule,
        nextDeparture: route.getNextDepartureTime()
      }
    });

  } catch (error) {
    console.error('Get route schedule error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching route schedule'
    });
  }
});

module.exports = router;
