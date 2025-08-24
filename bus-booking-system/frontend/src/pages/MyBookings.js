import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaTicketAlt, FaClock, FaMapMarkerAlt, FaBus, FaCalendarAlt, FaArrowRight, FaCheckCircle, FaTimesCircle, FaExclamationTriangle } from 'react-icons/fa';
import { useAuth } from '../contexts/AuthContext';
import { useBooking } from '../contexts/BookingContext';
import LoadingSpinner from '../components/common/LoadingSpinner';

const MyBookings = () => {
  const { user } = useAuth();
  const { fetchUserBookings, upcomingBookings, isLoading } = useBooking();
  const [pastBookings, setPastBookings] = useState([]);
  const [activeTab, setActiveTab] = useState('upcoming');

  useEffect(() => {
    fetchUserBookings();
    // Mock past bookings data
    setPastBookings([
      {
        id: 'past-1',
        route: {
          origin: 'New York',
          destination: 'Los Angeles',
          departureTime: '08:00 AM',
          date: '2024-01-10'
        },
        seats: ['A1', 'A2'],
        passengers: 2,
        totalPrice: 179.98,
        status: 'completed',
        bookingDate: '2024-01-08'
      },
      {
        id: 'past-2',
        route: {
          origin: 'Chicago',
          destination: 'Miami',
          departureTime: '10:30 AM',
          date: '2024-01-05'
        },
        seats: ['B5'],
        passengers: 1,
        totalPrice: 89.99,
        status: 'cancelled',
        bookingDate: '2024-01-03'
      }
    ]);
  }, [fetchUserBookings]);

  const getStatusIcon = (status) => {
    switch (status) {
      case 'confirmed':
        return <FaCheckCircle className="text-green-500" />;
      case 'completed':
        return <FaCheckCircle className="text-blue-500" />;
      case 'cancelled':
        return <FaTimesCircle className="text-red-500" />;
      case 'pending':
        return <FaExclamationTriangle className="text-yellow-500" />;
      default:
        return <FaClock className="text-gray-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

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
          className="text-center mb-8"
        >
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Bookings</h1>
          <p className="text-gray-600">Manage and track all your bus bookings</p>
        </motion.div>

        {/* Tab Navigation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-center mb-8"
        >
          <div className="bg-white rounded-xl p-1 shadow-lg">
            <button
              onClick={() => setActiveTab('upcoming')}
              className={`px-6 py-3 rounded-lg font-medium transition-all ${
                activeTab === 'upcoming'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              Upcoming Trips
            </button>
            <button
              onClick={() => setActiveTab('past')}
              className={`px-6 py-3 rounded-lg font-medium transition-all ${
                activeTab === 'past'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              Past Trips
            </button>
          </div>
        </motion.div>

        {/* Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {activeTab === 'upcoming' && (
            <div>
              <h2 className="text-2xl font-semibold mb-6">Upcoming Trips</h2>
              {upcomingBookings.length === 0 ? (
                <div className="text-center py-12">
                  <FaTicketAlt className="text-6xl text-gray-300 mx-auto mb-4" />
                  <h3 className="text-xl font-medium text-gray-600 mb-2">No upcoming trips</h3>
                  <p className="text-gray-500 mb-6">Start planning your next journey!</p>
                  <Link
                    to="/search"
                    className="inline-flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all"
                  >
                    <span>Search Routes</span>
                    <FaArrowRight />
                  </Link>
                </div>
              ) : (
                <div className="grid gap-6">
                  {upcomingBookings.map((booking, index) => (
                    <motion.div
                      key={booking.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow"
                    >
                      <div className="flex flex-col lg:flex-row lg:items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-4 mb-4">
                            <div className="flex items-center space-x-2">
                              {getStatusIcon(booking.status)}
                              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(booking.status)}`}>
                                {booking.status}
                              </span>
                            </div>
                            <span className="text-sm text-gray-500">
                              Booked on {new Date(booking.bookingDate).toLocaleDateString()}
                            </span>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                            <div className="flex items-center space-x-3">
                              <FaMapMarkerAlt className="text-blue-500" />
                              <div>
                                <p className="text-sm text-gray-600">From</p>
                                <p className="font-semibold">{booking.route.origin}</p>
                              </div>
                            </div>
                            <div className="flex items-center space-x-3">
                              <FaMapMarkerAlt className="text-green-500" />
                              <div>
                                <p className="text-sm text-gray-600">To</p>
                                <p className="font-semibold">{booking.route.destination}</p>
                              </div>
                            </div>
                            <div className="flex items-center space-x-3">
                              <FaCalendarAlt className="text-purple-500" />
                              <div>
                                <p className="text-sm text-gray-600">Date</p>
                                <p className="font-semibold">{new Date(booking.route.date).toLocaleDateString()}</p>
                              </div>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div>
                              <p className="text-sm text-gray-600">Departure</p>
                              <p className="font-semibold">{booking.route.departureTime}</p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-600">Seats</p>
                              <p className="font-semibold">{booking.seats.join(', ')}</p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-600">Passengers</p>
                              <p className="font-semibold">{booking.passengers}</p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-600">Total Price</p>
                              <p className="font-semibold text-green-600">${booking.totalPrice}</p>
                            </div>
                          </div>
                        </div>

                        <div className="mt-6 lg:mt-0 lg:ml-6 flex flex-col space-y-3">
                          <Link
                            to={`/route/${booking.route.id}`}
                            className="inline-flex items-center justify-center px-4 py-2 border border-blue-300 text-blue-700 rounded-lg hover:bg-blue-50 transition-colors"
                          >
                            <FaBus className="mr-2" />
                            View Route
                          </Link>
                          <button className="inline-flex items-center justify-center px-4 py-2 border border-red-300 text-red-700 rounded-lg hover:bg-red-50 transition-colors">
                            Cancel Booking
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'past' && (
            <div>
              <h2 className="text-2xl font-semibold mb-6">Past Trips</h2>
              {pastBookings.length === 0 ? (
                <div className="text-center py-12">
                  <FaTicketAlt className="text-6xl text-gray-300 mx-auto mb-4" />
                  <h3 className="text-xl font-medium text-gray-600 mb-2">No past trips</h3>
                  <p className="text-gray-500">Your completed trips will appear here.</p>
                </div>
              ) : (
                <div className="grid gap-6">
                  {pastBookings.map((booking, index) => (
                    <motion.div
                      key={booking.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow"
                    >
                      <div className="flex flex-col lg:flex-row lg:items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-4 mb-4">
                            <div className="flex items-center space-x-2">
                              {getStatusIcon(booking.status)}
                              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(booking.status)}`}>
                                {booking.status}
                              </span>
                            </div>
                            <span className="text-sm text-gray-500">
                              Booked on {new Date(booking.bookingDate).toLocaleDateString()}
                            </span>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                            <div className="flex items-center space-x-3">
                              <FaMapMarkerAlt className="text-blue-500" />
                              <div>
                                <p className="text-sm text-gray-600">From</p>
                                <p className="font-semibold">{booking.route.origin}</p>
                              </div>
                            </div>
                            <div className="flex items-center space-x-3">
                              <FaMapMarkerAlt className="text-green-500" />
                              <div>
                                <p className="text-sm text-gray-600">To</p>
                                <p className="font-semibold">{booking.route.destination}</p>
                              </div>
                            </div>
                            <div className="flex items-center space-x-3">
                              <FaCalendarAlt className="text-purple-500" />
                              <div>
                                <p className="text-sm text-gray-600">Date</p>
                                <p className="font-semibold">{new Date(booking.route.date).toLocaleDateString()}</p>
                              </div>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div>
                              <p className="text-sm text-gray-600">Departure</p>
                              <p className="font-semibold">{booking.route.departureTime}</p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-600">Seats</p>
                              <p className="font-semibold">{booking.seats.join(', ')}</p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-600">Passengers</p>
                              <p className="font-semibold">{booking.passengers}</p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-600">Total Price</p>
                              <p className="font-semibold text-green-600">${booking.totalPrice}</p>
                            </div>
                          </div>
                        </div>

                        <div className="mt-6 lg:mt-0 lg:ml-6">
                          <button className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                            Download Ticket
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default MyBookings;
