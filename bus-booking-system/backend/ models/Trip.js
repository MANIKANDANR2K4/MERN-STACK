const mongoose = require('mongoose');

const tripSchema = new mongoose.Schema({
  tripNumber: {
    type: String,
    required: true,
    unique: true
  },
  route: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Route',
    required: [true, 'Route is required']
  },
  bus: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Bus',
    required: [true, 'Bus is required']
  },
  driver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Driver is required']
  },
  conductor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  schedule: {
    departureDate: {
      type: Date,
      required: [true, 'Departure date is required']
    },
    departureTime: {
      type: String,
      required: [true, 'Departure time is required']
    },
    arrivalDate: {
      type: Date,
      required: [true, 'Arrival date is required']
    },
    arrivalTime: {
      type: String,
      required: [true, 'Arrival time is required']
    },
    actualDeparture: Date,
    actualArrival: Date,
    delay: {
      type: Number,
      default: 0,
      min: 0
    }
  },
  status: {
    type: String,
    enum: ['scheduled', 'boarding', 'departed', 'in-transit', 'arrived', 'cancelled', 'delayed'],
    default: 'scheduled'
  },
  currentLocation: {
    latitude: Number,
    longitude: Number,
    address: String,
    lastUpdated: {
      type: Date,
      default: Date.now
    }
  },
  progress: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  stops: [{
    city: String,
    terminal: String,
    scheduledArrival: String,
    scheduledDeparture: String,
    actualArrival: String,
    actualDeparture: String,
    status: {
      type: String,
      enum: ['pending', 'arrived', 'departed', 'skipped'],
      default: 'pending'
    },
    passengers: {
      boarding: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      }],
      alighting: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      }]
    }
  }],
  occupancy: {
    totalSeats: {
      type: Number,
      required: true
    },
    bookedSeats: {
      type: Number,
      default: 0
    },
    availableSeats: {
      type: Number,
      default: function() { return this.totalSeats; }
    },
    seatMap: [{
      seatNumber: String,
      isBooked: {
        type: Boolean,
        default: false
      },
      passenger: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      seatType: {
        type: String,
        enum: ['window', 'aisle', 'front', 'back'],
        default: 'aisle'
      }
    }]
  },
  weather: {
    current: {
      temperature: Number,
      condition: String,
      humidity: Number,
      windSpeed: Number
    },
    forecast: [{
      time: Date,
      temperature: Number,
      condition: String,
      humidity: Number,
      windSpeed: Number
    }]
  },
  traffic: {
    current: {
      level: {
        type: String,
        enum: ['low', 'medium', 'high', 'severe'],
        default: 'low'
      },
      description: String,
      estimatedDelay: Number
    },
    updates: [{
      time: Date,
      level: String,
      description: String,
      location: String
    }]
  },
  incidents: [{
    type: {
      type: String,
      enum: ['accident', 'breakdown', 'weather', 'traffic', 'medical', 'other'],
      required: true
    },
    description: String,
    location: String,
    time: {
      type: Date,
      default: Date.now
    },
    severity: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical'],
      default: 'low'
    },
    status: {
      type: String,
      enum: ['reported', 'investigating', 'resolved'],
      default: 'reported'
    },
    resolution: String,
    resolvedAt: Date
  }],
  notifications: {
    sent: [{
      type: String,
      recipients: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      }],
      sentAt: {
        type: Date,
        default: Date.now
      }
    }],
    scheduled: [{
      type: String,
      scheduledFor: Date,
      recipients: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      }]
    }]
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

// Virtual for occupancy percentage
tripSchema.virtual('occupancyPercentage').get(function() {
  if (this.occupancy.totalSeats === 0) return 0;
  return Math.round((this.occupancy.bookedSeats / this.occupancy.totalSeats) * 100);
});

// Virtual for isFull
tripSchema.virtual('isFull').get(function() {
  return this.occupancy.bookedSeats >= this.occupancy.totalSeats;
});

// Virtual for isDelayed
tripSchema.virtual('isDelayed').get(function() {
  return this.schedule.delay > 0;
});

// Virtual for estimatedArrival
tripSchema.virtual('estimatedArrival').get(function() {
  if (this.schedule.actualArrival) return this.schedule.actualArrival;
  
  const scheduledArrival = new Date(this.schedule.arrivalDate);
  scheduledArrival.setHours(parseInt(this.schedule.arrivalTime.split(':')[0]));
  scheduledArrival.setMinutes(parseInt(this.schedule.arrivalTime.split(':')[1]));
  
  if (this.schedule.delay > 0) {
    scheduledArrival.setMinutes(scheduledArrival.getMinutes() + this.schedule.delay);
  }
  
  return scheduledArrival;
});

// Index for better query performance
tripSchema.index({ tripNumber: 1 });
tripSchema.index({ route: 1 });
tripSchema.index({ bus: 1 });
tripSchema.index({ driver: 1 });
tripSchema.index({ status: 1 });
tripSchema.index({ 'schedule.departureDate': 1 });
tripSchema.index({ 'schedule.departureTime': 1 });
tripSchema.index({ isActive: 1 });

// Pre-save middleware to generate trip number
tripSchema.pre('save', function(next) {
  if (this.isNew && !this.tripNumber) {
    const timestamp = Date.now().toString();
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    this.tripNumber = `TR${timestamp.slice(-6)}${random}`;
  }
  
  // Update available seats
  if (this.occupancy.totalSeats) {
    this.occupancy.availableSeats = this.occupancy.totalSeats - this.occupancy.bookedSeats;
  }
  
  next();
});

// Method to update trip status
tripSchema.methods.updateStatus = function(newStatus, additionalData = {}) {
  this.status = newStatus;
  
  switch (newStatus) {
    case 'boarding':
      this.schedule.actualDeparture = new Date();
      break;
    case 'departed':
      this.schedule.actualDeparture = new Date();
      break;
    case 'arrived':
      this.schedule.actualArrival = new Date();
      break;
    case 'delayed':
      if (additionalData.delay) {
        this.schedule.delay = additionalData.delay;
      }
      break;
  }
  
  return this.save();
};

// Method to update current location
tripSchema.methods.updateLocation = function(latitude, longitude, address) {
  this.currentLocation = {
    latitude,
    longitude,
    address,
    lastUpdated: new Date()
  };
  
  // Calculate progress based on route distance
  if (this.route) {
    // This would need to be implemented based on actual route calculation
    // For now, we'll use a simple time-based progress
    const totalDuration = this.getTotalDuration();
    const elapsedTime = Date.now() - this.schedule.actualDeparture;
    this.progress = Math.min(100, Math.max(0, (elapsedTime / totalDuration) * 100));
  }
  
  return this.save();
};

// Method to book seat
tripSchema.methods.bookSeat = function(seatNumber, passengerId, seatType = 'aisle') {
  const seat = this.occupancy.seatMap.find(s => s.seatNumber === seatNumber);
  
  if (!seat) {
    throw new Error('Seat not found');
  }
  
  if (seat.isBooked) {
    throw new Error('Seat already booked');
  }
  
  seat.isBooked = true;
  seat.passenger = passengerId;
  seat.seatType = seatType;
  
  this.occupancy.bookedSeats += 1;
  this.occupancy.availableSeats = this.occupancy.totalSeats - this.occupancy.bookedSeats;
  
  return this.save();
};

// Method to release seat
tripSchema.methods.releaseSeat = function(seatNumber) {
  const seat = this.occupancy.seatMap.find(s => s.seatNumber === seatNumber);
  
  if (!seat || !seat.isBooked) {
    throw new Error('Seat not booked or not found');
  }
  
  seat.isBooked = false;
  seat.passenger = null;
  
  this.occupancy.bookedSeats -= 1;
  this.occupancy.availableSeats = this.occupancy.totalSeats - this.occupancy.bookedSeats;
  
  return this.save();
};

// Method to add incident
tripSchema.methods.addIncident = function(incidentData) {
  this.incidents.push(incidentData);
  return this.save();
};

// Method to resolve incident
tripSchema.methods.resolveIncident = function(incidentIndex, resolution) {
  if (this.incidents[incidentIndex]) {
    this.incidents[incidentIndex].status = 'resolved';
    this.incidents[incidentIndex].resolution = resolution;
    this.incidents[incidentIndex].resolvedAt = new Date();
    return this.save();
  }
  throw new Error('Incident not found');
};

// Method to get total duration in milliseconds
tripSchema.methods.getTotalDuration = function() {
  const departure = new Date(this.schedule.departureDate);
  departure.setHours(parseInt(this.schedule.departureTime.split(':')[0]));
  departure.setMinutes(parseInt(this.schedule.departureTime.split(':')[1]));
  
  const arrival = new Date(this.schedule.arrivalDate);
  arrival.setHours(parseInt(this.schedule.arrivalTime.split(':')[0]));
  arrival.setMinutes(parseInt(this.schedule.arrivalTime.split(':')[1]));
  
  return arrival.getTime() - departure.getTime();
};

// Static method to find upcoming trips
tripSchema.statics.findUpcoming = function() {
  const now = new Date();
  return this.find({
    'schedule.departureDate': { $gt: now },
    status: { $in: ['scheduled', 'boarding'] },
    isActive: true
  });
};

// Static method to find trips by status
tripSchema.statics.findByStatus = function(status) {
  return this.find({ status, isActive: true });
};

// Static method to find trips by date range
tripSchema.statics.findByDateRange = function(startDate, endDate) {
  return this.find({
    'schedule.departureDate': {
      $gte: startDate,
      $lte: endDate
    },
    isActive: true
  });
};

module.exports = mongoose.model('Trip', tripSchema);
