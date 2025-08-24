const mongoose = require('mongoose');

const routeSchema = new mongoose.Schema({
  routeNumber: {
    type: String,
    required: [true, 'Route number is required'],
    unique: true,
    trim: true
  },
  routeName: {
    type: String,
    required: [true, 'Route name is required'],
    trim: true
  },
  origin: {
    city: {
      type: String,
      required: [true, 'Origin city is required']
    },
    state: {
      type: String,
      required: [true, 'Origin state is required']
    },
    country: {
      type: String,
      required: [true, 'Origin country is required']
    },
    coordinates: {
      latitude: Number,
      longitude: Number
    },
    terminal: String,
    address: String
  },
  destination: {
    city: {
      type: String,
      required: [true, 'Destination city is required']
    },
    state: {
      type: String,
      required: [true, 'Destination state is required']
    },
    country: {
      type: String,
      required: [true, 'Destination country is required']
    },
    coordinates: {
      latitude: Number,
      longitude: Number
    },
    terminal: String,
    address: String
  },
  stops: [{
    city: String,
    state: String,
    coordinates: {
      latitude: Number,
      longitude: Number
    },
    terminal: String,
    address: String,
    arrivalTime: String,
    departureTime: String,
    stopDuration: Number, // in minutes
    isPickupPoint: { type: Boolean, default: true },
    isDropPoint: { type: Boolean, default: true }
  }],
  distance: {
    total: {
      type: Number,
      required: [true, 'Total distance is required'],
      min: [1, 'Distance must be at least 1 km']
    },
    unit: {
      type: String,
      enum: ['km', 'miles'],
      default: 'km'
    }
  },
  duration: {
    estimated: {
      type: Number,
      required: [true, 'Estimated duration is required'],
      min: [1, 'Duration must be at least 1 minute']
    },
    unit: {
      type: String,
      enum: ['minutes', 'hours'],
      default: 'minutes'
    }
  },
  schedule: {
    frequency: {
      type: String,
      enum: ['daily', 'weekly', 'monthly', 'custom'],
      default: 'daily'
    },
    daysOfWeek: [{
      type: String,
      enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
    }],
    departureTimes: [String], // Array of departure times in HH:MM format
    seasonalAdjustments: [{
      season: String,
      startDate: Date,
      endDate: Date,
      adjustments: {
        departureTime: String,
        duration: Number,
        frequency: String
      }
    }]
  },
  pricing: {
    baseFare: {
      type: Number,
      required: [true, 'Base fare is required'],
      min: [0, 'Base fare cannot be negative']
    },
    currency: {
      type: String,
      default: 'USD'
    },
    fareStructure: [{
      fromStop: String,
      toStop: String,
      fare: Number,
      discount: {
        type: Number,
        default: 0,
        min: 0,
        max: 100
      }
    }],
    discounts: {
      student: { type: Number, default: 0, min: 0, max: 100 },
      senior: { type: Number, default: 0, min: 0, max: 100 },
      child: { type: Number, default: 0, min: 0, max: 100 },
      group: { type: Number, default: 0, min: 0, max: 100 }
    }
  },
  amenities: [{
    type: String,
    enum: [
      'wifi',
      'power-outlets',
      'air-conditioning',
      'heating',
      'entertainment-system',
      'reading-lights',
      'usb-charging',
      'bathroom',
      'refreshments',
      'luggage-space',
      'wheelchair-accessible',
      'pet-friendly'
    ]
  }],
  restrictions: {
    maxLuggage: {
      weight: Number,
      unit: { type: String, enum: ['kg', 'lbs'], default: 'kg' }
    },
    prohibitedItems: [String],
    ageRestrictions: {
      minAge: Number,
      maxAge: Number
    },
    healthRequirements: [String]
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'maintenance', 'discontinued'],
    default: 'active'
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

// Virtual for full route description
routeSchema.virtual('fullRoute').get(function() {
  return `${this.origin.city}, ${this.origin.state} → ${this.destination.city}, ${this.destination.state}`;
});

// Virtual for formatted duration
routeSchema.virtual('formattedDuration').get(function() {
  if (this.duration.unit === 'minutes') {
    const hours = Math.floor(this.duration.estimated / 60);
    const minutes = this.duration.estimated % 60;
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  }
  return `${this.duration.estimated} ${this.duration.unit}`;
});

// Virtual for formatted distance
routeSchema.virtual('formattedDistance').get(function() {
  return `${this.distance.total} ${this.distance.unit}`;
});

// Index for better query performance
routeSchema.index({ routeNumber: 1 });
routeSchema.index({ 'origin.city': 1, 'origin.state': 1 });
routeSchema.index({ 'destination.city': 1, 'destination.state': 1 });
routeSchema.index({ status: 1 });
routeSchema.index({ isActive: 1 });
routeSchema.index({ 'schedule.daysOfWeek': 1 });

// Method to calculate fare between two stops
routeSchema.methods.calculateFare = function(fromStop, toStop) {
  const fareInfo = this.pricing.fareStructure.find(
    fare => fare.fromStop === fromStop && fare.toStop === toStop
  );
  
  if (fareInfo) {
    const discountAmount = (fareInfo.fare * fareInfo.discount) / 100;
    return fareInfo.fare - discountAmount;
  }
  
  // If no specific fare found, calculate based on distance ratio
  return this.pricing.baseFare;
};

// Method to check if route operates on a specific day
routeSchema.methods.operatesOnDay = function(day) {
  if (this.schedule.frequency === 'daily') return true;
  return this.schedule.daysOfWeek.includes(day.toLowerCase());
};

// Method to get next departure time
routeSchema.methods.getNextDepartureTime = function(currentTime = new Date()) {
  const currentHour = currentTime.getHours();
  const currentMinute = currentTime.getMinutes();
  const currentTimeString = `${currentHour.toString().padStart(2, '0')}:${currentMinute.toString().padStart(2, '0')}`;
  
  const sortedTimes = this.schedule.departureTimes.sort();
  const nextTime = sortedTimes.find(time => time > currentTimeString);
  
  return nextTime || sortedTimes[0]; // Return first time of next day if no time found
};

// Static method to find routes by origin and destination
routeSchema.statics.findByOriginDestination = function(originCity, destinationCity) {
  return this.find({
    'origin.city': { $regex: originCity, $options: 'i' },
    'destination.city': { $regex: destinationCity, $options: 'i' },
    isActive: true,
    status: 'active'
  });
};

// Static method to find active routes
routeSchema.statics.findActive = function() {
  return this.find({ isActive: true, status: 'active' });
};

// Static method to find routes by day of week
routeSchema.statics.findByDay = function(day) {
  return this.find({
    $or: [
      { 'schedule.frequency': 'daily' },
      { 'schedule.daysOfWeek': day.toLowerCase() }
    ],
    isActive: true,
    status: 'active'
  });
};

module.exports = mongoose.model('Route', routeSchema);
