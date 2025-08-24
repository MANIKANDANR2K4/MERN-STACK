const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  paymentId: {
    type: String,
    required: true,
    unique: true
  },
  booking: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking',
    required: [true, 'Booking is required']
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User is required']
  },
  amount: {
    baseAmount: {
      type: Number,
      required: [true, 'Base amount is required'],
      min: [0, 'Amount cannot be negative']
    },
    taxes: {
      type: Number,
      default: 0,
      min: 0
    },
    fees: {
      type: Number,
      default: 0,
      min: 0
    },
    discounts: {
      type: Number,
      default: 0,
      min: 0
    },
    totalAmount: {
      type: Number,
      required: [true, 'Total amount is required'],
      min: [0, 'Total amount cannot be negative']
    },
    currency: {
      type: String,
      default: 'USD'
    }
  },
  paymentMethod: {
    type: {
      type: String,
      enum: ['credit-card', 'debit-card', 'net-banking', 'upi', 'wallet', 'cash', 'bank-transfer'],
      required: [true, 'Payment method type is required']
    },
    details: {
      cardType: String,
      cardLast4: String,
      bankName: String,
      accountNumber: String,
      upiId: String,
      walletName: String
    },
    isSaved: {
      type: Boolean,
      default: false
    }
  },
  status: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'failed', 'cancelled', 'refunded', 'partially-refunded'],
    default: 'pending'
  },
  transaction: {
    transactionId: String,
    referenceId: String,
    gateway: {
      type: String,
      enum: ['stripe', 'razorpay', 'paypal', 'square', 'cash', 'bank'],
      default: 'stripe'
    },
    gatewayResponse: mongoose.Schema.Types.Mixed,
    processingTime: Number // in milliseconds
  },
  refund: {
    isRefunded: {
      type: Boolean,
      default: false
    },
    refundAmount: {
      type: Number,
      default: 0
    },
    refundReason: String,
    refundDate: Date,
    refundMethod: String,
    refundTransactionId: String,
    partialRefunds: [{
      amount: Number,
      reason: String,
      date: Date,
      transactionId: String
    }]
  },
  billing: {
    billingAddress: {
      street: String,
      city: String,
      state: String,
      zipCode: String,
      country: String
    },
    billingEmail: String,
    billingPhone: String,
    taxId: String
  },
  metadata: {
    ipAddress: String,
    userAgent: String,
    deviceType: String,
    location: {
      country: String,
      city: String
    }
  },
  notifications: {
    emailSent: { type: Boolean, default: false },
    smsSent: { type: Boolean, default: false },
    pushSent: { type: Boolean, default: false }
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for formatted amount
paymentSchema.virtual('formattedAmount').get(function() {
  return `${this.amount.currency} ${this.amount.totalAmount.toFixed(2)}`;
});

// Virtual for isRefundable
paymentSchema.virtual('isRefundable').get(function() {
  return this.status === 'completed' && !this.refund.isRefunded;
});

// Virtual for refundableAmount
paymentSchema.virtual('refundableAmount').get(function() {
  if (!this.isRefundable) return 0;
  return this.amount.totalAmount - this.refund.refundAmount;
});

// Index for better query performance
paymentSchema.index({ paymentId: 1 });
paymentSchema.index({ booking: 1 });
paymentSchema.index({ user: 1 });
paymentSchema.index({ status: 1 });
paymentSchema.index({ 'transaction.gateway': 1 });
paymentSchema.index({ 'transaction.transactionId': 1 });
paymentSchema.index({ createdAt: 1 });
paymentSchema.index({ isActive: 1 });

// Pre-save middleware to generate payment ID
paymentSchema.pre('save', function(next) {
  if (this.isNew && !this.paymentId) {
    const timestamp = Date.now().toString();
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    this.paymentId = `PAY${timestamp.slice(-6)}${random}`;
  }
  
  // Calculate total amount
  if (this.amount.baseAmount !== undefined) {
    this.amount.totalAmount = this.amount.baseAmount + this.amount.taxes + this.amount.fees - this.amount.discounts;
    this.amount.totalAmount = Math.max(0, this.amount.totalAmount);
  }
  
  next();
});

// Method to process payment
paymentSchema.methods.processPayment = function(gatewayResponse) {
  this.status = 'processing';
  this.transaction.gatewayResponse = gatewayResponse;
  this.transaction.processingTime = Date.now() - this.createdAt;
  
  return this.save();
};

// Method to complete payment
paymentSchema.methods.completePayment = function(transactionId, referenceId) {
  this.status = 'completed';
  this.transaction.transactionId = transactionId;
  this.transaction.referenceId = referenceId;
  
  return this.save();
};

// Method to fail payment
paymentSchema.methods.failPayment = function(reason) {
  this.status = 'failed';
  this.transaction.gatewayResponse = { error: reason };
  
  return this.save();
};

// Method to process refund
paymentSchema.methods.processRefund = function(amount, reason, method = 'original') {
  if (!this.isRefundable) {
    throw new Error('Payment is not refundable');
  }
  
  if (amount > this.refundableAmount) {
    throw new Error('Refund amount exceeds refundable amount');
  }
  
  this.refund.isRefunded = true;
  this.refund.refundAmount += amount;
  this.refund.refundDate = new Date();
  this.refund.refundMethod = method;
  
  // Add to partial refunds
  this.refund.partialRefunds.push({
    amount,
    reason,
    date: new Date(),
    transactionId: `REF${Date.now()}`
  });
  
  // Update status
  if (this.refund.refundAmount >= this.amount.totalAmount) {
    this.status = 'refunded';
  } else {
    this.status = 'partially-refunded';
  }
  
  return this.save();
};

// Method to cancel payment
paymentSchema.methods.cancelPayment = function(reason) {
  if (this.status !== 'pending' && this.status !== 'processing') {
    throw new Error('Payment cannot be cancelled');
  }
  
  this.status = 'cancelled';
  this.transaction.gatewayResponse = { cancellationReason: reason };
  
  return this.save();
};

// Method to get payment summary
paymentSchema.methods.getSummary = function() {
  return {
    paymentId: this.paymentId,
    amount: this.formattedAmount,
    status: this.status,
    method: this.paymentMethod.type,
    date: this.createdAt,
    isRefundable: this.isRefundable,
    refundableAmount: this.refundableAmount
  };
};

// Static method to find payments by user
paymentSchema.statics.findByUser = function(userId) {
  return this.find({ user: userId, isActive: true }).sort({ createdAt: -1 });
};

// Static method to find payments by status
paymentSchema.statics.findByStatus = function(status) {
  return this.find({ status, isActive: true });
};

// Static method to find payments by date range
paymentSchema.statics.findByDateRange = function(startDate, endDate) {
  return this.find({
    createdAt: {
      $gte: startDate,
      $lte: endDate
    },
    isActive: true
  });
};

// Static method to find failed payments
paymentSchema.statics.findFailed = function() {
  return this.find({ status: 'failed', isActive: true });
};

// Static method to find pending payments
paymentSchema.statics.findPending = function() {
  return this.find({ status: 'pending', isActive: true });
};

module.exports = mongoose.model('Payment', paymentSchema);
