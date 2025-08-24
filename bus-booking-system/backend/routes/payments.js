const express = require('express');
const { body, validationResult } = require('express-validator');
const Payment = require('../models/Payment');
const Booking = require('../models/Booking');
const { protect, admin } = require('../middleware/auth');

const router = express.Router();

// @desc    Get all payments (Admin) or user's own payments
// @route   GET /api/payments
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    let filter = { isActive: true };
    
    // If not admin, only show user's own payments
    if (req.user.role !== 'admin') {
      filter.user = req.user.id;
    }

    // Filter by status
    if (req.query.status) {
      filter.status = req.query.status;
    }

    // Filter by payment method
    if (req.query.method) {
      filter['paymentMethod.type'] = req.query.method;
    }

    // Filter by date range
    if (req.query.startDate && req.query.endDate) {
      filter.createdAt = {
        $gte: new Date(req.query.startDate),
        $lte: new Date(req.query.endDate)
      };
    }

    // Search by payment ID or transaction ID
    if (req.query.search) {
      filter.$or = [
        { paymentId: { $regex: req.query.search, $options: 'i' } },
        { 'transaction.transactionId': { $regex: req.query.search, $options: 'i' } }
      ];
    }

    const payments = await Payment.find(filter)
      .populate('booking', 'bookingNumber route bus')
      .populate('user', 'firstName lastName email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Payment.countDocuments(filter);

    res.json({
      success: true,
      data: payments,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalPayments: total,
        paymentsPerPage: limit
      }
    });

  } catch (error) {
    console.error('Get payments error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching payments'
    });
  }
});

// @desc    Get payment by ID
// @route   GET /api/payments/:id
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id)
      .populate('booking', 'bookingNumber route bus journeyDetails')
      .populate('user', 'firstName lastName email phone');
    
    if (!payment || !payment.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found'
      });
    }

    // Users can only view their own payments unless they're admin
    if (req.user.role !== 'admin' && req.user.id !== payment.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this payment'
      });
    }

    res.json({
      success: true,
      data: payment
    });

  } catch (error) {
    console.error('Get payment error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching payment'
    });
  }
});

// @desc    Create payment intent
// @route   POST /api/payments/create-intent
// @access  Private
router.post('/create-intent', protect, [
  body('bookingId').isMongoId().withMessage('Valid booking ID is required'),
  body('paymentMethod.type').isIn(['credit-card', 'debit-card', 'net-banking', 'upi', 'wallet']).withMessage('Valid payment method is required'),
  body('amount').isFloat({ min: 0.01 }).withMessage('Valid amount is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { bookingId, paymentMethod, amount, billingAddress } = req.body;

    // Verify booking exists and belongs to user
    const booking = await Booking.findById(bookingId);
    if (!booking || !booking.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    if (req.user.role !== 'admin' && req.user.id !== booking.user.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to pay for this booking'
      });
    }

    // Check if payment already exists
    const existingPayment = await Payment.findOne({ booking: bookingId });
    if (existingPayment) {
      return res.status(400).json({
        success: false,
        message: 'Payment already exists for this booking'
      });
    }

    // Create payment record
    const payment = new Payment({
      booking: bookingId,
      user: req.user.id,
      amount: {
        baseAmount: amount,
        totalAmount: amount,
        currency: booking.pricing.currency || 'USD'
      },
      paymentMethod,
      billing: billingAddress || {}
    });

    await payment.save();

    // TODO: Integrate with actual payment gateway (Stripe, Razorpay, etc.)
    // For now, simulate payment processing
    const paymentIntent = {
      id: `pi_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      client_secret: `pi_${Date.now()}_secret_${Math.random().toString(36).substr(2, 9)}`,
      amount: Math.round(amount * 100), // Convert to cents
      currency: payment.amount.currency.toLowerCase(),
      status: 'requires_payment_method'
    };

    res.json({
      success: true,
      message: 'Payment intent created successfully',
      data: {
        paymentId: payment.paymentId,
        paymentIntent,
        payment
      }
    });

  } catch (error) {
    console.error('Create payment intent error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while creating payment intent'
    });
  }
});

// @desc    Confirm payment
// @route   POST /api/payments/:id/confirm
// @access  Private
router.post('/:id/confirm', protect, [
  body('transactionId').notEmpty().withMessage('Transaction ID is required'),
  body('paymentMethod').notEmpty().withMessage('Payment method is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const payment = await Payment.findById(req.params.id);
    
    if (!payment || !payment.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found'
      });
    }

    // Users can only confirm their own payments unless they're admin
    if (req.user.role !== 'admin' && req.user.id !== payment.user.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to confirm this payment'
      });
    }

    const { transactionId, paymentMethod } = req.body;

    // Update payment method if provided
    if (paymentMethod) {
      payment.paymentMethod = paymentMethod;
    }

    // Complete payment
    await payment.completePayment(transactionId, `ref_${Date.now()}`);

    // Update booking status to confirmed
    const booking = await Booking.findById(payment.booking);
    if (booking) {
      booking.status = 'confirmed';
      booking.payment.status = 'completed';
      await booking.save();
    }

    res.json({
      success: true,
      message: 'Payment confirmed successfully',
      data: payment
    });

  } catch (error) {
    console.error('Confirm payment error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while confirming payment'
    });
  }
});

// @desc    Process refund
// @route   POST /api/payments/:id/refund
// @access  Private/Admin
router.post('/:id/refund', protect, admin, [
  body('amount').isFloat({ min: 0.01 }).withMessage('Valid refund amount is required'),
  body('reason').notEmpty().withMessage('Refund reason is required'),
  body('method').optional().isString().withMessage('Refund method must be a string')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const payment = await Payment.findById(req.params.id);
    
    if (!payment || !payment.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found'
      });
    }

    const { amount, reason, method = 'original' } = req.body;

    await payment.processRefund(amount, reason, method);

    res.json({
      success: true,
      message: 'Refund processed successfully',
      data: {
        refundAmount: payment.refund.refundAmount,
        refundDate: payment.refund.refundDate
      }
    });

  } catch (error) {
    console.error('Process refund error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error while processing refund'
    });
  }
});

// @desc    Cancel payment
// @route   POST /api/payments/:id/cancel
// @access  Private/Admin
router.post('/:id/cancel', protect, admin, [
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

    const payment = await Payment.findById(req.params.id);
    
    if (!payment || !payment.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found'
      });
    }

    const { reason } = req.body;

    await payment.cancelPayment(reason);

    res.json({
      success: true,
      message: 'Payment cancelled successfully'
    });

  } catch (error) {
    console.error('Cancel payment error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error while cancelling payment'
    });
  }
});

// @desc    Get payment statistics (Admin only)
// @route   GET /api/payments/stats/overview
// @access  Private/Admin
router.get('/stats/overview', protect, admin, async (req, res) => {
  try {
    const totalPayments = await Payment.countDocuments();
    const completedPayments = await Payment.countDocuments({ status: 'completed' });
    const failedPayments = await Payment.countDocuments({ status: 'failed' });
    const pendingPayments = await Payment.countDocuments({ status: 'pending' });

    // Total revenue
    const revenueStats = await Payment.aggregate([
      { $match: { status: 'completed' } },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$amount.totalAmount' },
          avgPayment: { $avg: '$amount.totalAmount' }
        }
      }
    ]);

    // Payment method distribution
    const methodStats = await Payment.aggregate([
      { $group: { _id: '$paymentMethod.type', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    // Monthly revenue trends
    const monthlyRevenue = await Payment.aggregate([
      { $match: { status: 'completed' } },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          revenue: { $sum: '$amount.totalAmount' },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
      { $limit: 12 }
    ]);

    // Refund statistics
    const refundStats = await Payment.aggregate([
      { $match: { 'refund.isRefunded': true } },
      {
        $group: {
          _id: null,
          totalRefunds: { $sum: '$refund.refundAmount' },
          refundCount: { $sum: 1 }
        }
      }
    ]);

    res.json({
      success: true,
      data: {
        totalPayments,
        completedPayments,
        failedPayments,
        pendingPayments,
        revenueStats: revenueStats[0] || {},
        methodStats,
        monthlyRevenue,
        refundStats: refundStats[0] || {}
      }
    });

  } catch (error) {
    console.error('Get payment stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching payment statistics'
    });
  }
});

// @desc    Get failed payments (Admin only)
// @route   GET /api/payments/failed
// @access  Private/Admin
router.get('/failed', protect, admin, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const failedPayments = await Payment.findFailed()
      .populate('booking', 'bookingNumber route bus')
      .populate('user', 'firstName lastName email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Payment.countDocuments({ status: 'failed' });

    res.json({
      success: true,
      data: failedPayments,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalFailed: total,
        failedPerPage: limit
      }
    });

  } catch (error) {
    console.error('Get failed payments error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching failed payments'
    });
  }
});

// @desc    Retry failed payment (Admin only)
// @route   POST /api/payments/:id/retry
// @access  Private/Admin
router.post('/:id/retry', protect, admin, async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id);
    
    if (!payment || !payment.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found'
      });
    }

    if (payment.status !== 'failed') {
      return res.status(400).json({
        success: false,
        message: 'Payment is not failed'
      });
    }

    // Reset payment status to pending for retry
    payment.status = 'pending';
    payment.transaction.gatewayResponse = {};
    await payment.save();

    res.json({
      success: true,
      message: 'Payment reset for retry',
      data: payment
    });

  } catch (error) {
    console.error('Retry payment error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while retrying payment'
    });
  }
});

// @desc    Export payments (Admin only)
// @route   GET /api/payments/export
// @access  Private/Admin
router.get('/export', protect, admin, async (req, res) => {
  try {
    const { startDate, endDate, status } = req.query;
    
    let filter = { isActive: true };
    
    if (startDate && endDate) {
      filter.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }
    
    if (status) {
      filter.status = status;
    }

    const payments = await Payment.find(filter)
      .populate('booking', 'bookingNumber')
      .populate('user', 'firstName lastName email')
      .lean();

    // Convert to CSV format
    const csvData = payments.map(payment => {
      return `${payment.paymentId},${payment.amount.totalAmount},${payment.amount.currency},${payment.status},${payment.paymentMethod.type},${payment.createdAt}`;
    }).join('\n');

    const csvHeader = 'PaymentID,Amount,Currency,Status,Method,CreatedAt\n';
    const csvContent = csvHeader + csvData;

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=payments.csv');
    res.send(csvContent);

  } catch (error) {
    console.error('Export payments error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while exporting payments'
    });
  }
});

module.exports = router;
