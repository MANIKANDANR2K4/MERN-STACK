import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaCheckCircle, FaTicketAlt, FaMapMarkerAlt, FaClock, FaBus, FaDownload, FaHome, FaTicketAlt as FaTicket } from 'react-icons/fa';
import { useAuth } from '../contexts/AuthContext';

const BookingConfirmation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const [bookingData, setBookingData] = useState(null);
  const [routeData, setRouteData] = useState(null);

  useEffect(() => {
    if (location.state?.bookingData && location.state?.routeData) {
      setBookingData(location.state.bookingData);
      setRouteData(location.state.routeData);
    } else {
      // Redirect if no booking data
      navigate('/search');
    }
  }, [location.state, navigate]);

  const handleDownloadTicket = () => {
    // In a real app, this would generate and download a PDF ticket
    alert('Ticket download feature will be implemented soon!');
  };

  const handleViewBookings = () => {
    navigate('/my-bookings');
  };

  const handleGoHome = () => {
    navigate('/');
  };

  if (!bookingData || !routeData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Loading confirmation...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 pt-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Success Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FaCheckCircle className="text-green-600 text-4xl" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Booking Confirmed! 🎉</h1>
          <p className="text-xl text-gray-600">
            Your Tamil Nadu bus journey has been successfully booked
          </p>
        </motion.div>

        {/* Booking Details Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl shadow-xl p-8 mb-8"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Booking Details</h2>
            <div className="text-right">
              <p className="text-sm text-gray-500">Booking ID</p>
              <p className="text-lg font-mono font-semibold text-blue-600">
                #{Math.random().toString(36).substr(2, 9).toUpperCase()}
              </p>
            </div>
          </div>

          {/* Route Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <FaMapMarkerAlt className="text-blue-500 text-xl" />
                <div>
                  <p className="text-sm text-gray-500">Route</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {routeData.origin} → {routeData.destination}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <FaClock className="text-green-500 text-xl" />
                <div>
                  <p className="text-sm text-gray-500">Date & Time</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {routeData.date} • {routeData.departureTime}
                  </p>
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <FaBus className="text-purple-500 text-xl" />
                <div>
                  <p className="text-sm text-gray-500">Bus Type</p>
                  <p className="text-lg font-semibold text-gray-900">{routeData.busType}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <FaTicket className="text-orange-500 text-xl" />
                <div>
                  <p className="text-sm text-gray-500">Seats</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {bookingData.seats.join(', ')}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Passenger Details */}
          <div className="border-t pt-6 mb-6">
            <h3 className="text-lg font-semibold mb-4">Passenger Information</h3>
            <div className="space-y-3">
              {bookingData.passengerDetails?.map((passenger, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">
                      {passenger.firstName} {passenger.lastName}
                    </p>
                    <p className="text-sm text-gray-500">
                      Age: {passenger.age} • Gender: {passenger.gender}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500">Seat {bookingData.seats[index]}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Payment Summary */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold mb-4">Payment Summary</h3>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Base Fare</span>
                  <span>₹{(routeData.price * bookingData.passengers).toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Taxes & Fees</span>
                  <span>₹{(routeData.price * bookingData.passengers * 0.05).toFixed(2)}</span>
                </div>
                <div className="border-t pt-2 flex justify-between font-semibold text-lg">
                  <span>Total Paid</span>
                  <span className="text-green-600">₹{bookingData.totalPrice}</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          <button
            onClick={handleDownloadTicket}
            className="flex items-center justify-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <FaDownload />
            <span>Download Ticket</span>
          </button>
          
          <button
            onClick={handleViewBookings}
            className="flex items-center justify-center space-x-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <FaTicket />
            <span>View My Bookings</span>
          </button>
          
          <button
            onClick={handleGoHome}
            className="flex items-center justify-center space-x-2 px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            <FaHome />
            <span>Go Home</span>
          </button>
        </motion.div>

        {/* Important Information */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mt-8 bg-blue-50 rounded-xl p-6 border border-blue-200"
        >
          <h3 className="text-lg font-semibold text-blue-900 mb-3">Important Information</h3>
          <ul className="space-y-2 text-blue-800">
            <li className="flex items-start space-x-2">
              <span className="text-blue-600 mt-1">•</span>
              <span>Please arrive at the bus stand 30 minutes before departure time</span>
            </li>
            <li className="flex items-start space-x-2">
              <span className="text-blue-600 mt-1">•</span>
              <span>Carry a valid ID proof along with your ticket</span>
            </li>
            <li className="flex items-start space-x-2">
              <span className="text-blue-600 mt-1">•</span>
              <span>Face mask is mandatory during the journey</span>
            </li>
            <li className="flex items-start space-x-2">
              <span className="text-blue-600 mt-1">•</span>
              <span>For any queries, contact our support at 1800-123-4567</span>
            </li>
          </ul>
        </motion.div>

        {/* Contact Support */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="mt-8 text-center"
        >
          <p className="text-gray-600 mb-2">
            Need help? Our customer support team is available 24/7
          </p>
          <p className="text-blue-600 font-medium">
            📧 support@tamilnadubus.com | 📞 1800-123-4567
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default BookingConfirmation;
