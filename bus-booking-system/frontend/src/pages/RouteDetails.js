import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaBus, FaClock, FaMapMarkerAlt, FaUsers, FaStar, FaArrowLeft, FaTicketAlt, FaWifi, FaSnowflake, FaCouch, FaShieldAlt } from 'react-icons/fa';
import { useAuth } from '../contexts/AuthContext';
import { useBooking } from '../contexts/BookingContext';
import LoadingSpinner from '../components/common/LoadingSpinner';

const RouteDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated } = useAuth();
  const { createBooking } = useBooking();
  const [route, setRoute] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [passengerCount, setPassengerCount] = useState(1);

  useEffect(() => {
    // Get route data from navigation state or use mock data
    if (location.state?.routeData) {
      setRoute(location.state.routeData);
      setPassengerCount(location.state.searchForm?.passengers || 1);
    } else {
      // Fallback mock route data
      const mockRoute = {
        id: id,
        origin: 'Chennai',
        destination: 'Madurai',
        departureTime: '08:00 AM',
        arrivalTime: '06:00 PM',
        date: '2024-01-15',
        price: 89.99,
        busType: 'Premium',
        availableSeats: 45,
        totalSeats: 50,
        amenities: ['WiFi', 'AC', 'Reclining Seats', 'USB Charging'],
        duration: '10 hours',
        operator: 'Express Bus Co.',
        rating: 4.5,
        reviews: 128
      };
      setRoute(mockRoute);
    }
    setIsLoading(false);
  }, [id, location.state]);

  const handleSeatSelection = (seatNumber) => {
    if (selectedSeats.includes(seatNumber)) {
      setSelectedSeats(selectedSeats.filter(seat => seat !== seatNumber));
    } else if (selectedSeats.length < passengerCount) {
      setSelectedSeats([...selectedSeats, seatNumber]);
    }
  };

  const handleBooking = async () => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: `/route/${id}` } });
      return;
    }

    if (selectedSeats.length !== passengerCount) {
      alert('Please select the correct number of seats');
      return;
    }

    try {
      const bookingData = {
        routeId: id,
        seats: selectedSeats,
        passengers: passengerCount,
        totalPrice: route.price * passengerCount,
        routeData: route
      };

      // Navigate to booking form with the booking data
      navigate('/booking-form', { 
        state: { 
          bookingData: bookingData,
          routeData: route
        } 
      });
    } catch (error) {
      console.error('Navigation failed:', error);
    }
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!route) {
    return <div>Route not found</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={() => navigate(-1)}
          className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 mb-6 transition-colors"
        >
          <FaArrowLeft />
          <span>Back to Search</span>
        </motion.button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Route Details */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl shadow-lg p-6 mb-6"
            >
              <div className="flex items-center justify-between mb-6">
                <h1 className="text-3xl font-bold text-gray-900">
                  {route.origin} → {route.destination}
                </h1>
                <div className="flex items-center space-x-2">
                  <FaStar className="text-yellow-400" />
                  <span className="font-semibold">{route.rating}</span>
                  <span className="text-gray-500">({route.reviews} reviews)</span>
                </div>
              </div>

              {/* Route Info Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="text-center p-3 bg-blue-50 rounded-lg">
                  <FaClock className="text-blue-600 mx-auto mb-2" />
                  <p className="text-sm text-gray-600">Departure</p>
                  <p className="font-semibold">{route.departureTime}</p>
                </div>
                <div className="text-center p-3 bg-green-50 rounded-lg">
                  <FaMapMarkerAlt className="text-green-600 mx-auto mb-2" />
                  <p className="text-sm text-gray-600">Arrival</p>
                  <p className="font-semibold">{route.arrivalTime}</p>
                </div>
                <div className="text-center p-3 bg-purple-50 rounded-lg">
                  <FaUsers className="text-purple-600 mx-auto mb-2" />
                  <p className="text-sm text-gray-600">Duration</p>
                  <p className="font-semibold">{route.duration}</p>
                </div>
                <div className="text-center p-3 bg-orange-50 rounded-lg">
                  <FaBus className="text-orange-600 mx-auto mb-2" />
                  <p className="text-sm text-gray-600">Bus Type</p>
                  <p className="font-semibold">{route.busType}</p>
                </div>
              </div>

              {/* Amenities */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-3">Amenities</h3>
                <div className="flex flex-wrap gap-3">
                  {route.amenities.map((amenity, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center space-x-2 px-3 py-2 bg-gray-100 rounded-full text-sm"
                    >
                      {amenity === 'WiFi' && <FaWifi className="text-blue-500" />}
                      {amenity === 'AC' && <FaSnowflake className="text-blue-500" />}
                      {amenity === 'Reclining Seats' && <FaCouch className="text-green-500" />}
                      {amenity === 'USB Charging' && <FaShieldAlt className="text-purple-500" />}
                      <span>{amenity}</span>
                    </span>
                  ))}
                </div>
              </div>

              {/* Operator Info */}
              <div className="border-t pt-4">
                <p className="text-gray-600">
                  <span className="font-semibold">Operator:</span> {route.operator}
                </p>
              </div>
            </motion.div>
          </div>

          {/* Booking Sidebar */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white rounded-2xl shadow-lg p-6 sticky top-24"
            >
              <h2 className="text-2xl font-bold mb-4">Book Your Trip</h2>

              {/* Price Display */}
              <div className="mb-6">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-600">Price per seat:</span>
                  <span className="text-2xl font-bold text-green-600">₹{route.price}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Total:</span>
                  <span className="text-xl font-semibold">
                    ₹{(route.price * passengerCount).toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Passenger Selection */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Number of Passengers
                </label>
                <select
                  value={passengerCount}
                  onChange={(e) => {
                    const newCount = Number(e.target.value);
                    setPassengerCount(newCount);
                    // Adjust selected seats if needed
                    if (selectedSeats.length > newCount) {
                      setSelectedSeats(selectedSeats.slice(0, newCount));
                    }
                  }}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {[1, 2, 3, 4, 5].map(num => (
                    <option key={num} value={num}>
                      {num} {num === 1 ? 'Passenger' : 'Passengers'}
                    </option>
                  ))}
                </select>
              </div>

              {/* Available Seats */}
              <div className="mb-6">
                <p className="text-sm text-gray-600 mb-2">
                  Available Seats: {route.availableSeats}
                </p>
                <div className="grid grid-cols-5 gap-2">
                  {[...Array(route.totalSeats)].map((_, i) => {
                    const seatNumber = i + 1;
                    const isAvailable = seatNumber <= route.availableSeats;
                    const isSelected = selectedSeats.includes(seatNumber);

                    return (
                      <button
                        key={seatNumber}
                        onClick={() => isAvailable && handleSeatSelection(seatNumber)}
                        disabled={!isAvailable}
                        className={`
                          p-2 text-xs rounded-lg transition-all
                          ${isAvailable && isSelected
                            ? 'bg-blue-600 text-white'
                            : isAvailable
                            ? 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                            : 'bg-red-200 text-red-600 cursor-not-allowed'
                          }
                        `}
                      >
                        {seatNumber}
                      </button>
                    );
                  })}
                </div>
                {selectedSeats.length > 0 && (
                  <p className="text-sm text-blue-600 mt-2">
                    Selected seats: {selectedSeats.join(', ')}
                  </p>
                )}
              </div>

              {/* Book Button */}
              <button
                onClick={handleBooking}
                disabled={selectedSeats.length !== passengerCount}
                className={`
                  w-full py-3 px-6 rounded-xl font-semibold text-white transition-all
                  ${selectedSeats.length === passengerCount
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700'
                    : 'bg-gray-400 cursor-not-allowed'
                  }
                `}
              >
                <FaTicketAlt className="inline mr-2" />
                Continue to Booking
              </button>

              {/* Safety Notice */}
              <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                <p className="text-xs text-blue-700">
                  <FaShieldAlt className="inline mr-1" />
                  Your booking is secure and protected
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RouteDetails;
