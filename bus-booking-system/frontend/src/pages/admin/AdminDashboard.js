import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaUsers, FaBus, FaRoute, FaTicketAlt, FaChartLine, FaExclamationTriangle, FaCheckCircle, FaClock, FaDollarSign, FaMapMarkerAlt, FaCalendarAlt } from 'react-icons/fa';
import { useAuth } from '../../contexts/AuthContext';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const AdminDashboard = () => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [stats, setStats] = useState({
    totalUsers: 1250,
    totalBuses: 45,
    totalRoutes: 89,
    totalBookings: 2340,
    revenue: 45678.90,
    pendingBookings: 23,
    activeRoutes: 67,
    completedTrips: 1890
  });

  const [recentBookings, setRecentBookings] = useState([
    {
      id: '1',
      user: 'John Doe',
      route: 'New York → Los Angeles',
      date: '2024-01-15',
      status: 'confirmed',
      amount: 89.99
    },
    {
      id: '2',
      user: 'Jane Smith',
      route: 'Chicago → Miami',
      date: '2024-01-16',
      status: 'pending',
      amount: 75.50
    },
    {
      id: '3',
      user: 'Mike Johnson',
      route: 'Boston → Seattle',
      date: '2024-01-17',
      status: 'completed',
      amount: 120.00
    }
  ]);

  const [recentUsers, setRecentUsers] = useState([
    {
      id: '1',
      name: 'Alice Brown',
      email: 'alice@example.com',
      joinDate: '2024-01-10',
      status: 'active'
    },
    {
      id: '2',
      name: 'Bob Wilson',
      email: 'bob@example.com',
      joinDate: '2024-01-12',
      status: 'active'
    },
    {
      id: '3',
      name: 'Carol Davis',
      email: 'carol@example.com',
      joinDate: '2024-01-14',
      status: 'pending'
    }
  ]);

  useEffect(() => {
    // Fetch admin dashboard data
    // This would typically call an API endpoint
  }, []);

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
          <p className="text-gray-600">Welcome back, {user?.firstName}! Here's what's happening with your bus booking system.</p>
        </motion.div>

        {/* Stats Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        >
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Users</p>
                <p className="text-3xl font-bold text-gray-900">{stats.totalUsers}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <FaUsers className="text-blue-600 text-xl" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <FaChartLine className="text-green-500 mr-1" />
              <span className="text-green-600">+12%</span>
              <span className="text-gray-500 ml-1">from last month</span>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Buses</p>
                <p className="text-3xl font-bold text-gray-900">{stats.totalBuses}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <FaBus className="text-green-600 text-xl" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <FaChartLine className="text-green-500 mr-1" />
              <span className="text-green-600">+5%</span>
              <span className="text-gray-500 ml-1">from last month</span>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Routes</p>
                <p className="text-3xl font-bold text-gray-900">{stats.activeRoutes}</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <FaRoute className="text-purple-600 text-xl" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <FaChartLine className="text-green-500 mr-1" />
              <span className="text-green-600">+8%</span>
              <span className="text-gray-500 ml-1">from last month</span>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                <p className="text-3xl font-bold text-gray-900">${stats.revenue.toLocaleString()}</p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <FaDollarSign className="text-yellow-600 text-xl" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <FaChartLine className="text-green-500 mr-1" />
              <span className="text-green-600">+15%</span>
              <span className="text-gray-500 ml-1">from last month</span>
            </div>
          </div>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl shadow-lg p-6 mb-8"
        >
          <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <button className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              <FaUsers className="text-blue-500 text-2xl mb-2" />
              <span className="text-sm font-medium">Manage Users</span>
            </button>
            <button className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              <FaBus className="text-green-500 text-2xl mb-2" />
              <span className="text-sm font-medium">Manage Buses</span>
            </button>
            <button className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              <FaRoute className="text-purple-500 text-2xl mb-2" />
              <span className="text-sm font-medium">Manage Routes</span>
            </button>
            <button className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              <FaTicketAlt className="text-orange-500 text-2xl mb-2" />
              <span className="text-sm font-medium">View Bookings</span>
            </button>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Bookings */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-2xl shadow-lg p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Recent Bookings</h2>
              <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">View All</button>
            </div>
            <div className="space-y-4">
              {recentBookings.map((booking) => (
                <div key={booking.id} className="flex items-center justify-between p-3 border border-gray-100 rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center space-x-2">
                        {booking.status === 'confirmed' && <FaCheckCircle className="text-green-500" />}
                        {booking.status === 'pending' && <FaClock className="text-yellow-500" />}
                        {booking.status === 'completed' && <FaCheckCircle className="text-blue-500" />}
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          booking.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                          booking.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-blue-100 text-blue-800'
                        }`}>
                          {booking.status}
                        </span>
                      </div>
                    </div>
                    <p className="font-medium text-gray-900 mt-1">{booking.user}</p>
                    <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
                      <span className="flex items-center">
                        <FaMapMarkerAlt className="mr-1" />
                        {booking.route}
                      </span>
                      <span className="flex items-center">
                        <FaCalendarAlt className="mr-1" />
                        {new Date(booking.date).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-green-600">${booking.amount}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Recent Users */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-2xl shadow-lg p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Recent Users</h2>
              <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">View All</button>
            </div>
            <div className="space-y-4">
              {recentUsers.map((user) => (
                <div key={user.id} className="flex items-center justify-between p-3 border border-gray-100 rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center space-x-2">
                        {user.status === 'active' && <FaCheckCircle className="text-green-500" />}
                        {user.status === 'pending' && <FaExclamationTriangle className="text-yellow-500" />}
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          user.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {user.status}
                        </span>
                      </div>
                    </div>
                    <p className="font-medium text-gray-900 mt-1">{user.name}</p>
                    <p className="text-sm text-gray-600 mt-1">{user.email}</p>
                    <p className="text-xs text-gray-500 mt-1">Joined {new Date(user.joinDate).toLocaleDateString()}</p>
                  </div>
                  <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">View</button>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* System Status */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-2xl shadow-lg p-6 mt-8"
        >
          <h2 className="text-xl font-semibold mb-4">System Status</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <FaCheckCircle className="text-green-500 text-3xl mx-auto mb-2" />
              <h3 className="font-semibold text-green-800">Database</h3>
              <p className="text-sm text-green-600">Connected & Healthy</p>
            </div>
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <FaCheckCircle className="text-blue-500 text-3xl mx-auto mb-2" />
              <h3 className="font-semibold text-blue-800">API Server</h3>
              <p className="text-sm text-blue-600">Running Smoothly</p>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <FaCheckCircle className="text-green-500 text-3xl mx-auto mb-2" />
              <h3 className="font-semibold text-green-800">Real-time</h3>
              <p className="text-sm text-green-600">Socket Connected</p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default AdminDashboard;
