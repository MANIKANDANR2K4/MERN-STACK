const express = require('express');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const { protect, admin } = require('../middleware/auth');
const { upload } = require('../middleware/upload');

const router = express.Router();

// @desc    Get all users (Admin only)
// @route   GET /api/users
// @access  Private/Admin
router.get('/', protect, admin, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const filter = {};
    
    // Search by name or email
    if (req.query.search) {
      filter.$or = [
        { firstName: { $regex: req.query.search, $options: 'i' } },
        { lastName: { $regex: req.query.search, $options: 'i' } },
        { email: { $regex: req.query.search, $options: 'i' } }
      ];
    }

    // Filter by role
    if (req.query.role) {
      filter.role = req.query.role;
    }

    // Filter by status
    if (req.query.status) {
      filter.isActive = req.query.status === 'active';
    }

    const users = await User.find(filter)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await User.countDocuments(filter);

    res.json({
      success: true,
      data: users,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalUsers: total,
        usersPerPage: limit
      }
    });

  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching users'
    });
  }
});

// @desc    Get user by ID
// @route   GET /api/users/:id
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Users can only view their own profile unless they're admin
    if (req.user.role !== 'admin' && req.user.id !== req.params.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this user'
      });
    }

    res.json({
      success: true,
      data: user
    });

  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching user'
    });
  }
});

// @desc    Update user (Admin only or own profile)
// @route   PUT /api/users/:id
// @access  Private
router.put('/:id', protect, upload.single('profileImage'), async (req, res) => {
  try {
    // Check if user can update this profile
    if (req.user.role !== 'admin' && req.user.id !== req.params.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this user'
      });
    }

    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const updates = req.body;

    // Update profile image if uploaded
    if (req.file) {
      updates.profileImage = `/uploads/profiles/${req.file.filename}`;
    }

    // Fields that can be updated
    const allowedUpdates = [
      'firstName', 'lastName', 'phone', 'dateOfBirth', 'gender', 
      'address', 'emergencyContact', 'preferences'
    ];

    // Admin can update more fields
    if (req.user.role === 'admin') {
      allowedUpdates.push('role', 'isActive', 'isVerified');
    }

    allowedUpdates.forEach(field => {
      if (updates[field] !== undefined) {
        user[field] = updates[field];
      }
    });

    await user.save();

    res.json({
      success: true,
      message: 'User updated successfully',
      data: user
    });

  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating user'
    });
  }
});

// @desc    Delete user (Admin only)
// @route   DELETE /api/users/:id
// @access  Private/Admin
router.delete('/:id', protect, admin, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Soft delete - mark as inactive
    user.isActive = false;
    await user.save();

    res.json({
      success: true,
      message: 'User deactivated successfully'
    });

  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting user'
    });
  }
});

// @desc    Reactivate user (Admin only)
// @route   PUT /api/users/:id/reactivate
// @access  Private/Admin
router.put('/:id/reactivate', protect, admin, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    user.isActive = true;
    await user.save();

    res.json({
      success: true,
      message: 'User reactivated successfully',
      data: user
    });

  } catch (error) {
    console.error('Reactivate user error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while reactivating user'
    });
  }
});

// @desc    Get user statistics (Admin only)
// @route   GET /api/users/stats/overview
// @access  Private/Admin
router.get('/stats/overview', protect, admin, async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments({ isActive: true });
    const verifiedUsers = await User.countDocuments({ isVerified: true });
    const newUsersThisMonth = await User.countDocuments({
      createdAt: { $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) }
    });

    // Role distribution
    const roleStats = await User.aggregate([
      { $group: { _id: '$role', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    // Monthly user growth (last 12 months)
    const monthlyGrowth = await User.aggregate([
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
      { $limit: 12 }
    ]);

    res.json({
      success: true,
      data: {
        totalUsers,
        activeUsers,
        verifiedUsers,
        newUsersThisMonth,
        roleStats,
        monthlyGrowth
      }
    });

  } catch (error) {
    console.error('Get user stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching user statistics'
    });
  }
});

// @desc    Get user activity (Admin only)
// @route   GET /api/users/:id/activity
// @access  Private/Admin
router.get('/:id/activity', protect, admin, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Get user's recent activity (this would need to be implemented based on your activity tracking)
    const activity = {
      lastLogin: user.lastLogin,
      accountCreated: user.createdAt,
      profileUpdated: user.updatedAt,
      // Add more activity data as needed
    };

    res.json({
      success: true,
      data: activity
    });

  } catch (error) {
    console.error('Get user activity error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching user activity'
    });
  }
});

// @desc    Bulk update users (Admin only)
// @route   PUT /api/users/bulk-update
// @access  Private/Admin
router.put('/bulk-update', protect, admin, [
  body('userIds').isArray().withMessage('User IDs must be an array'),
  body('updates').isObject().withMessage('Updates must be an object')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { userIds, updates } = req.body;

    // Fields that can be bulk updated
    const allowedBulkUpdates = ['isActive', 'isVerified', 'role'];

    const filteredUpdates = {};
    allowedBulkUpdates.forEach(field => {
      if (updates[field] !== undefined) {
        filteredUpdates[field] = updates[field];
      }
    });

    if (Object.keys(filteredUpdates).length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No valid fields to update'
      });
    }

    const result = await User.updateMany(
      { _id: { $in: userIds } },
      { $set: filteredUpdates }
    );

    res.json({
      success: true,
      message: `Updated ${result.modifiedCount} users successfully`,
      data: {
        matchedCount: result.matchedCount,
        modifiedCount: result.modifiedCount
      }
    });

  } catch (error) {
    console.error('Bulk update users error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while bulk updating users'
    });
  }
});

// @desc    Export users (Admin only)
// @route   GET /api/users/export
// @access  Private/Admin
router.get('/export', protect, admin, async (req, res) => {
  try {
    const users = await User.find({}).select('-password').lean();

    // Convert to CSV format (simplified)
    const csvData = users.map(user => {
      return `${user.firstName},${user.lastName},${user.email},${user.phone},${user.role},${user.isActive},${user.createdAt}`;
    }).join('\n');

    const csvHeader = 'FirstName,LastName,Email,Phone,Role,IsActive,CreatedAt\n';
    const csvContent = csvHeader + csvData;

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=users.csv');
    res.send(csvContent);

  } catch (error) {
    console.error('Export users error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while exporting users'
    });
  }
});

module.exports = router;
