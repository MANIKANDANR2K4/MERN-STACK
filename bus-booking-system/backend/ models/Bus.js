const mongoose = require('mongoose');

const busSchema = new mongoose.Schema({
  busNumber: {
    type: String,
    required: [true, 'Bus number is required'],
    unique: true,
    trim: true
  },
  busName: {
    type: String,
    required: [true, 'Bus name is required'],
    trim: true
  },
  busType: {
    type: String,
    enum: ['standard', 'premium', 'luxury', 'sleeper', 'ac', 'non-ac'],
    default: 'standard'
  },
  capacity: {
    totalSeats: {
      type: Number,
      required: [true, 'Total seats is required'],
      min: [1, 'Total seats must be at least 1'],
      max: [100, 'Total seats cannot exceed 100']
    },
    availableSeats: {
      type: Number,
      default: function() { return this.totalSeats; }
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
      'wheelchair-accessible'
    ]
  }],
  images: [{
    url: String,
    caption: String,
    isPrimary: { type: Boolean, default: false }
  }],
  specifications: {
    manufacturer: String,
    model: String,
    year: Number,
    engineType: String,
    fuelType: String,
    mileage: Number
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
  currentLocation: {
    latitude: Number,
    longitude: Number,
    address: String,
    lastUpdated: {
      type: Date,
      default: Date.now
    }
  },
  status: {
    type: String,
    enum: ['active', 'maintenance', 'out-of-service', 'retired'],
    default: 'active'
  },
  maintenance: {
    lastService: Date,
    nextService: Date,
    serviceHistory: [{
      date: Date,
      description: String,
      cost: Number,
      serviceCenter: String
    }]
  },
  documents: [{
    type: String,
    enum: ['registration', 'insurance', 'permit', 'fitness', 'pollution'],
    number: String,
    expiryDate: Date,
    documentUrl: String
  }],
  ratings: {
    average: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    totalReviews: {
      type: Number,
      default: 0
    },
    reviews: [{
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      rating: {
        type: Number,
        required: true,
        min: 1,
        max: 5
      },
      comment: String,
      date: {
        type: Date,
        default: Date.now
      }
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
busSchema.virtual('occupancyPercentage').get(function() {
  if (this.capacity.totalSeats === 0) return 0;
  return Math.round(((this.capacity.totalSeats - this.capacity.availableSeats) / this.capacity.totalSeats) * 100);
});

// Virtual for isAvailable
busSchema.virtual('isAvailable').get(function() {
  return this.status === 'active' && this.capacity.availableSeats > 0;
});

// Index for better query performance
busSchema.index({ busNumber: 1 });
busSchema.index({ status: 1 });
busSchema.index({ 'currentLocation.latitude': 1, 'currentLocation.longitude': 1 });
busSchema.index({ busType: 1 });
busSchema.index({ isActive: 1 });

// Pre-save middleware to ensure available seats don't exceed total seats
busSchema.pre('save', function(next) {
  if (this.capacity.availableSeats > this.capacity.totalSeats) {
    this.capacity.availableSeats = this.capacity.totalSeats;
  }
  next();
});

// Method to update available seats
busSchema.methods.updateAvailableSeats = function(change) {
  const newAvailable = this.capacity.availableSeats + change;
  if (newAvailable >= 0 && newAvailable <= this.capacity.totalSeats) {
    this.capacity.availableSeats = newAvailable;
    return this.save();
  }
  throw new Error('Invalid seat count change');
};

// Method to add review and update average rating
busSchema.methods.addReview = function(userId, rating, comment) {
  // Remove existing review by this user if any
  this.ratings.reviews = this.ratings.reviews.filter(
    review => review.user.toString() !== userId.toString()
  );
  
  // Add new review
  this.ratings.reviews.push({ user: userId, rating, comment });
  
  // Update total reviews count
  this.ratings.totalReviews = this.ratings.reviews.length;
  
  // Calculate new average rating
  const totalRating = this.ratings.reviews.reduce((sum, review) => sum + review.rating, 0);
  this.ratings.average = totalRating / this.ratings.totalReviews;
  
  return this.save();
};

// Method to update current location
busSchema.methods.updateLocation = function(latitude, longitude, address) {
  this.currentLocation = {
    latitude,
    longitude,
    address,
    lastUpdated: new Date()
  };
  return this.save();
};

// Static method to find available buses
busSchema.statics.findAvailable = function() {
  return this.find({
    status: 'active',
    'capacity.availableSeats': { $gt: 0 },
    isActive: true
  });
};

// Static method to find buses by type
busSchema.statics.findByType = function(busType) {
  return this.find({ busType, isActive: true });
};

// Static method to find buses near location
busSchema.statics.findNearLocation = function(latitude, longitude, maxDistance = 10) {
  return this.find({
    isActive: true,
    status: 'active',
    'currentLocation.latitude': {
      $gte: latitude - maxDistance,
      $lte: latitude + maxDistance
    },
    'currentLocation.longitude': {
      $gte: longitude - maxDistance,
      $lte: longitude + maxDistance
    }
  });
};

module.exports = mongoose.model('Bus', busSchema);
