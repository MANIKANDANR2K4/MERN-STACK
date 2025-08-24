const express = require('express');
const { body, validationResult } = require('express-validator');
const Booking = require('../models/Booking');
const Trip = require('../models/Trip');
const Route = require('../models/Route');
const Bus = require('../models/Bus');
const { protect, admin, driver } = require('../middleware/auth');

const router = express.Router();

// @desc    Get all bookings (Admin/Driver) or user's own bookings
// @route   GET /api/bookings
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    let filter = { isActive: true };
    
    // If not admin, only show user's own bookings
    if (req.user.role !== 'admin') {
      filter.user = req.user.id;
    }

    // Filter by status
    if (req.query.status) {
      filter.status = req.query.status;
    }

    // Filter by date range
    if (req.query.startDate && req.query.endDate) {
      filter['journeyDetails.departureDate'] = {
        $gte: new Date(req.query.startDate),
        $lte: new Date(req.query.endDate)
      };
    }

    // Search by booking number
    if (req.query.search) {
      filter.bookingNumber = { $regex: req.query.search, $options: 'i' };
    }

    const bookings = await Booking.find(filter)
      .populate('route', 'routeNumber routeName origin destination')
      .populate('bus', 'busNumber busName busType')
      .populate('trip', 'tripNumber status')
      .populate('user', 'firstName lastName email phone')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Booking.countDocuments(filter);

    res.json({
      success: true,
      data: bookings,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalBookings: total,
        bookingsPerPage: limit
      }
    });

  } catch (error) {
    console.error('Get bookings error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching bookings'
    });
  }
});

// @desc    Get booking by ID
// @route   GET /api/bookings/:id
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('route', 'routeNumber routeName origin destination schedule pricing')
      .populate('bus', 'busNumber busName busType amenities')
      .populate('trip', 'tripNumber status schedule')
      .populate('user', 'firstName lastName email phone profileImage');
    
    if (!booking || !booking.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Users can only view their own bookings unless they're admin
    if (req.user.role !== 'admin' && req.user.id !== booking.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this booking'
      });
    }

    res.json({
      success: true,
      data: booking
    });

  } catch (error) {
    console.error('Get booking error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching booking'
    });
  }
});

// @desc    Create new booking
// @route   POST /api/bookings
// @access  Private
router.post('/', protect, [
  body('routeId').isMongoId().withMessage('Valid route ID is required'),
  body('busId').isMongoId().withMessage('Valid bus ID is required'),
  body('tripId').isMongoId().withMessage('Valid trip ID is required'),
  body('departureDate').isISO8601().withMessage('Valid departure date is required'),
  body('departureTime').notEmpty().withMessage('Departure time is required'),
  body('passengers').isArray({ min: 1 }).withMessage('At least one passenger is required'),
  body('passengers.*.firstName').notEmpty().withMessage('Passenger first name is required'),
  body('passengers.*.lastName').notEmpty().withMessage('Passenger last name is required'),
  body('passengers.*.age').isInt({ min: 0 }).withMessage('Valid passenger age is required'),
  body('passengers.*.seatNumber').notEmpty().withMessage('Seat number is required'),
  body('pickupPoint.city').notEmpty().withMessage('Pickup city is required'),
  body('dropPoint.city').notEmpty().withMessage('Drop city is required')
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
      routeId,
      busId,
      tripId,
      departureDate,
      departureTime,
      passengers,
      pickupPoint,
      dropPoint,
      specialRequests
    } = req.body;

    // Verify route exists and is active
    const route = await Route.findById(routeId);
    if (!route || !route.isActive || route.status !== 'active') {
      return res.status(400).json({
        success: false,
        message: 'Route not found or inactive'
      });
    }

    // Verify bus exists and is available
    const bus = await Bus.findById(busId);
    if (!bus || !bus.isActive || bus.status !== 'active') {
      return res.status(400).json({
        success: false,
        message: 'Bus not found or unavailable'
      });
    }

    // Verify trip exists and is active
    const trip = await Trip.findById(tripId);
    if (!trip || !trip.isActive) {
      return res.status(400).json({
        success: false,
        message: 'Trip not found or inactive'
      });
    }

    // Check seat availability
    const seatNumbers = passengers.map(p => p.seatNumber);
    const unavailableSeats = trip.occupancy.seatMap
      .filter(seat => seatNumbers.includes(seat.seatNumber) && seat.isBooked)
      .map(seat => seat.seatNumber);

    if (unavailableSeats.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Seats ${unavailableSeats.join(', ')} are not available`
      });
    }

    // Calculate arrival date and time
    const departureDateTime = new Date(departureDate);
    const [hours, minutes] = departureTime.split(':');
    departureDateTime.setHours(parseInt(hours), parseInt(minutes));

    const arrivalDateTime = new Date(departureDateTime);
    arrivalDateTime.setMinutes(arrivalDateTime.getMinutes() + route.duration.estimated);

    // Calculate total fare
    const baseFare = route.pricing.baseFare;
    const totalFare = baseFare * passengers.length;

    // Create booking
    const booking = new Booking({
      user: req.user.id,
      route: routeId,
      bus: busId,
      trip: tripId,
      passengers,
      journeyDetails: {
        departureDate: departureDateTime,
        departureTime,
        arrivalDate: arrivalDateTime,
        arrivalTime: `${arrivalDateTime.getHours().toString().padStart(2, '0')}:${arrivalDateTime.getMinutes().toString().padStart(2, '0')}`,
        pickupPoint,
        dropPoint
      },
      pricing: {
        baseFare,
        totalAmount: totalFare,
        currency: route.pricing.currency
      },
      specialRequests
    });

    await booking.save();

    // Update trip seat availability
    for (const passenger of passengers) {
      await trip.bookSeat(passenger.seatNumber, req.user.id, passenger.seatType);
    }

    // Update bus available seats
    await bus.updateAvailableSeats(-passengers.length);

    // Emit real-time update via Socket.IO
    const io = req.app.get('io');
    if (io) {
      io.emit('booking-updated', {
        bookingId: booking._id,
        tripId: tripId,
        action: 'created',
        timestamp: new Date()
      });
    }

    const populatedBooking = await Booking.findById(booking._id)
      .populate('route', 'routeNumber routeName origin destination')
      .populate('bus', 'busNumber busName busType')
      .populate('trip', 'tripNumber status');

    res.status(201).json({
      success: true,
      message: 'Booking created successfully',
      data: populatedBooking
    });

  } catch (error) {
    console.error('Create booking error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while creating booking'
    });
  }
});

// @desc    Update booking
// @route   PUT /api/bookings/:id
// @access  Private
router.put('/:id', protect, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    
    if (!booking || !booking.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Users can only update their own bookings unless they're admin
    if (req.user.role !== 'admin' && req.user.id !== booking.user.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this booking'
      });
    }

    // Only allow updates for pending or confirmed bookings
    if (!['pending', 'confirmed'].includes(booking.status)) {
      return res.status(400).json({
        success: false,
        message: 'Cannot update booking in current status'
      });
    }

    const updates = req.body;

    // Fields that can be updated
    const allowedUpdates = [
      'passengers', 'pickupPoint', 'dropPoint', 'specialRequests'
    ];

    allowedUpdates.forEach(field => {
      if (updates[field] !== undefined) {
        booking[field] = updates[field];
      }
    });

    await booking.save();

    const updatedBooking = await Booking.findById(booking._id)
      .populate('route', 'routeNumber routeName origin destination')
      .populate('bus', 'busNumber busName busType')
      .populate('trip', 'tripNumber status');

    res.json({
      success: true,
      message: 'Booking updated successfully',
      data: updatedBooking
    });

  } catch (error) {
    console.error('Update booking error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating booking'
    });
  }
});

// @desc    Cancel booking
// @route   PUT /api/bookings/:id/cancel
// @access  Private
router.put('/:id/cancel', protect, [
  body('reason').notEmpty().withMessage('Cancellation reason is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const booking = await Booking.findById(req.params.id);
    
    if (!booking || !booking.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Users can only cancel their own bookings unless they're admin
    if (req.user.role !== 'admin' && req.user.id !== booking.user.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to cancel this booking'
      });
    }

    const { reason } = req.body;
    const cancelledBy = req.user.role === 'admin' ? 'admin' : 'user';

    await booking.cancelBooking(reason, cancelledBy);

    // Update trip seat availability
    const trip = await Trip.findById(booking.trip);
    if (trip) {
      for (const passenger of booking.passengers) {
        await trip.releaseSeat(passenger.seatNumber);
      }
    }

    // Update bus available seats
    const bus = await Bus.findById(booking.bus);
    if (bus) {
      await bus.updateAvailableSeats(booking.passengers.length);
    }

    // Emit real-time update via Socket.IO
    const io = req.app.get('io');
    if (io) {
      io.emit('booking-updated', {
        bookingId: booking._id,
        tripId: booking.trip,
        action: 'cancelled',
        timestamp: new Date()
      });
    }

    res.json({
      success: true,
      message: 'Booking cancelled successfully',
      data: {
        cancellationFee: booking.cancellation.cancellationFee,
        refundAmount: booking.cancellation.refundAmount
      }
    });

  } catch (error) {
    console.error('Cancel booking error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error while cancelling booking'
    });
  }
});

// @desc    Mark booking as completed (Admin/Driver only)
// @route   PUT /api/bookings/:id/complete
// @access  Private/Admin/Driver
router.put('/:id/complete', protect, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    
    if (!booking || !booking.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Only admin or driver can mark as completed
    if (req.user.role !== 'admin' && req.user.role !== 'driver') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to complete this booking'
      });
    }

    await booking.markAsCompleted();

    res.json({
      success: true,
      message: 'Booking marked as completed'
    });

  } catch (error) {
    console.error('Complete booking error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error while completing booking'
    });
  }
});

// @desc    Get booking statistics (Admin only)
// @route   GET /api/bookings/stats/overview
// @access  Private/Admin
router.get('/stats/overview', protect, admin, async (req, res) => {
  try {
    const totalBookings = await Booking.countDocuments();
    const confirmedBookings = await Booking.countDocuments({ status: 'confirmed' });
    const cancelledBookings = await Booking.countDocuments({ status: 'cancelled' });
    const completedBookings = await Booking.countDocuments({ status: 'completed' });

    // Monthly booking trends
    const monthlyTrends = await Booking.aggregate([
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          count: { $sum: 1 },
          revenue: { $sum: '$pricing.totalAmount' }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
      { $limit: 12 }
    ]);

    // Status distribution
    const statusStats = await Booking.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    // Average booking value
    const avgBookingValue = await Booking.aggregate([
      { $match: { status: { $in: ['confirmed', 'completed'] } } },
      {
        $group: {
          _id: null,
          avgValue: { $avg: '$pricing.totalAmount' },
          totalRevenue: { $sum: '$pricing.totalAmount' }
        }
      }
    ]);

    res.json({
      success: true,
      data: {
        totalBookings,
        confirmedBookings,
        cancelledBookings,
        completedBookings,
        monthlyTrends,
        statusStats,
        avgBookingValue: avgBookingValue[0] || {}
      }
    });

  } catch (error) {
    console.error('Get booking stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching booking statistics'
    });
  }
});

// @desc    Get upcoming bookings
// @route   GET /api/bookings/upcoming
// @access  Private
router.get('/upcoming', protect, async (req, res) => {
  try {
    let filter = { isActive: true };
    
    // If not admin, only show user's own bookings
    if (req.user.role !== 'admin') {
      filter.user = req.user.id;
    }

    const upcomingBookings = await Booking.findUpcoming()
      .populate('route', 'routeNumber routeName origin destination')
      .populate('bus', 'busNumber busName busType')
      .populate('trip', 'tripNumber status');

    res.json({
      success: true,
      data: upcomingBookings
    });

  } catch (error) {
    console.error('Get upcoming bookings error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching upcoming bookings'
    });
  }
});

module.exports = router;
