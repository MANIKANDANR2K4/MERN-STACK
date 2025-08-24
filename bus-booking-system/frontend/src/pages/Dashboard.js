import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaTicketAlt, FaMapMarkerAlt, FaClock, FaBus, FaRoute, FaStar, FaArrowRight, FaCalendarAlt, FaUsers, FaGlobe, FaSearch } from 'react-icons/fa';
import { useAuth } from '../contexts/AuthContext';
import { useBooking } from '../contexts/BookingContext';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { popularTamilNaduRoutes } from '../data/tamilNaduRoutes';

const Dashboard = () => {
  const { user } = useAuth();
  const { upcomingBookings, isLoading } = useBooking();
  const [quickStats, setQuickStats] = useState({
    totalTrips: 12,
    completedTrips: 8,
    upcomingTrips: 4,
    totalSpent: 4500
  });

  const [recentActivity, setRecentActivity] = useState([
    {
      id: 1,
      type: 'booking',
      message: 'Booked Chennai → Madurai for tomorrow',
      time: '2 hours ago',
      amount: '₹450'
    },
    {
      id: 2,
      type: 'trip',
      message: 'Completed trip from Coimbatore to Chennai',
      time: '1 day ago',
      amount: '₹520'
    },
    {
      id: 3,
      type: 'payment',
      message: 'Payment successful for Salem → Tiruchirappalli',
      time: '2 days ago',
      amount: '₹280'
    }
  ]);

  const popularRoutes = popularTamilNaduRoutes.slice(0, 4);

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Netflix-style Background */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/80"></div>
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2069&q=80')`,
            filter: 'brightness(0.5)'
          }}
        ></div>
      </div>

      <div className="relative z-10 pt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Welcome Section */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <h1 className="text-4xl font-bold text-white mb-2">
              Welcome back, {user?.firstName || 'Traveler'}! 🚌
            </h1>
            <p className="text-xl text-gray-300">
              Ready to explore more of Tamil Nadu? Here's your travel summary
            </p>
          </motion.div>

          {/* Quick Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8"
          >
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-300">Total Trips</p>
                  <p className="text-3xl font-bold text-white">{quickStats.totalTrips}</p>
                </div>
                <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
                  <FaTicketAlt className="text-blue-400 text-xl" />
                </div>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-300">Completed</p>
                  <p className="text-3xl font-bold text-green-400">{quickStats.completedTrips}</p>
                </div>
                <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center">
                  <FaRoute className="text-green-400 text-xl" />
                </div>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-300">Upcoming</p>
                  <p className="text-3xl font-bold text-yellow-400">{quickStats.upcomingTrips}</p>
                </div>
                <div className="w-12 h-12 bg-yellow-500/20 rounded-lg flex items-center justify-center">
                  <FaClock className="text-yellow-400 text-xl" />
                </div>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-300">Total Spent</p>
                  <p className="text-3xl font-bold text-purple-400">₹{quickStats.totalSpent}</p>
                </div>
                <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center">
                  <FaUsers className="text-purple-400 text-xl" />
                </div>
              </div>
            </div>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Upcoming Trips */}
            <div className="lg:col-span-2">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-white/10 backdrop-blur-md rounded-2xl shadow-lg p-6 border border-white/20"
              >
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-semibold text-white">Upcoming Trips</h2>
                  <Link
                    to="/my-bookings"
                    className="text-blue-400 hover:text-blue-300 text-sm font-medium"
                  >
                    View All
                  </Link>
                </div>

                {upcomingBookings.length === 0 ? (
                  <div className="text-center py-8">
                    <FaCalendarAlt className="text-4xl text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-white mb-2">No upcoming trips</h3>
                    <p className="text-gray-400 mb-4">Start planning your next Tamil Nadu adventure!</p>
                    <Link
                      to="/search"
                      className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <span>Search Routes</span>
                      <FaArrowRight />
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {upcomingBookings.slice(0, 3).map((booking, index) => (
                      <motion.div
                        key={booking.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 + index * 0.1 }}
                        className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/10"
                      >
                        <div className="flex items-center space-x-4">
                          <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                            <FaMapMarkerAlt className="text-blue-400" />
                          </div>
                          <div>
                            <p className="font-medium text-white">
                              {booking.route?.origin} → {booking.route?.destination}
                            </p>
                            <p className="text-sm text-gray-400">
                              {new Date(booking.route?.date).toLocaleDateString()} • {booking.route?.departureTime}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-green-400">₹{booking.totalPrice}</p>
                          <p className="text-sm text-gray-400">{booking.passengers} passenger(s)</p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </motion.div>
            </div>

            {/* Quick Actions & Recent Activity */}
            <div className="lg:col-span-1 space-y-6">
              {/* Quick Actions */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-white/10 backdrop-blur-md rounded-2xl shadow-lg p-6 border border-white/20"
              >
                <h3 className="text-lg font-semibold text-white mb-4">Quick Actions</h3>
                <div className="space-y-3">
                  <Link
                    to="/search"
                    className="flex items-center space-x-3 p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors border border-white/10"
                  >
                    <FaSearch className="text-blue-400" />
                    <span className="text-white">Search Routes</span>
                  </Link>
                  <Link
                    to="/my-bookings"
                    className="flex items-center space-x-3 p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors border border-white/10"
                  >
                    <FaTicketAlt className="text-green-400" />
                    <span className="text-white">My Bookings</span>
                  </Link>
                  <Link
                    to="/profile"
                    className="flex items-center space-x-3 p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors border border-white/10"
                  >
                    <FaUsers className="text-purple-400" />
                    <span className="text-white">Profile</span>
                  </Link>
                </div>
              </motion.div>

              {/* Recent Activity */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-white/10 backdrop-blur-md rounded-2xl shadow-lg p-6 border border-white/20"
              >
                <h3 className="text-lg font-semibold text-white mb-4">Recent Activity</h3>
                <div className="space-y-3">
                  {recentActivity.map((activity, index) => (
                    <div key={activity.id} className="flex items-start space-x-3">
                      <div className={`w-2 h-2 rounded-full mt-2 ${
                        activity.type === 'booking' ? 'bg-blue-400' :
                        activity.type === 'trip' ? 'bg-green-400' : 'bg-purple-400'
                      }`}></div>
                      <div className="flex-1">
                        <p className="text-sm text-white">{activity.message}</p>
                        <div className="flex items-center justify-between mt-1">
                          <span className="text-xs text-gray-400">{activity.time}</span>
                          <span className="text-xs text-green-400 font-medium">{activity.amount}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            </div>
          </div>

          {/* Popular Routes */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mt-8"
          >
            <div className="bg-white/10 backdrop-blur-md rounded-2xl shadow-lg p-6 border border-white/20">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-semibold text-white">Popular Tamil Nadu Routes</h2>
                <Link
                  to="/search"
                  className="text-blue-400 hover:text-blue-300 text-sm font-medium"
                >
                  View All
                </Link>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {popularRoutes.map((route, index) => (
                  <motion.div
                    key={route.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.6 + index * 0.1 }}
                    className="p-4 bg-white/5 rounded-lg border border-white/10 hover:bg-white/10 transition-all cursor-pointer"
                  >
                    <div className="text-center">
                      <FaGlobe className="text-2xl text-blue-400 mx-auto mb-2" />
                      <h3 className="font-medium text-white mb-1">
                        {route.origin} → {route.destination}
                      </h3>
                      <p className="text-green-400 font-semibold mb-2">₹{route.price}</p>
                      <div className="flex items-center justify-center space-x-1 mb-2">
                        <FaStar className="text-yellow-400 text-sm" />
                        <span className="text-sm text-gray-300">{route.rating}</span>
                      </div>
                      <p className="text-xs text-gray-400">{route.duration}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Contact Info */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="mt-8 text-center"
          >
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
              <h3 className="text-lg font-semibold text-white mb-2">Need Help?</h3>
              <p className="text-gray-300 mb-4">
                Our customer support team is available 24/7 to assist you with your Tamil Nadu travel plans
              </p>
              <div className="flex justify-center space-x-6">
                <div className="text-center">
                  <FaGlobe className="text-2xl text-blue-400 mx-auto mb-2" />
                  <p className="text-white font-medium">Website</p>
                  <p className="text-gray-400 text-sm">tamilnadubus.com</p>
                </div>
                <div className="text-center">
                  <FaUsers className="text-2xl text-green-400 mx-auto mb-2" />
                  <p className="text-white font-medium">Support</p>
                  <p className="text-gray-400 text-sm">1800-123-4567</p>
                </div>
                <div className="text-center">
                  <FaTicketAlt className="text-2xl text-purple-400 mx-auto mb-2" />
                  <p className="text-white font-medium">Bookings</p>
                  <p className="text-gray-400 text-sm">24/7 Available</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
