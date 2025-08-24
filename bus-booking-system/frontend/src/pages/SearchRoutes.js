import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaSearch, FaMapMarkerAlt, FaCalendarAlt, FaUsers, FaFilter, FaRoute, FaBus, FaClock, FaStar, FaArrowRight, FaGlobe } from 'react-icons/fa';
import { useBooking } from '../contexts/BookingContext';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { 
  popularTamilNaduRoutes, 
  tamilNaduDistricts, 
  tamilNaduBusTypes, 
  tamilNaduAmenities,
  getRoutePrice,
  getRouteDuration
} from '../data/tamilNaduRoutes';

const SearchRoutes = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { searchRoutes, searchResults, isLoading } = useBooking();
  const [searchForm, setSearchForm] = useState({
    origin: '',
    destination: '',
    date: '',
    passengers: 1
  });
  const [filters, setFilters] = useState({
    priceRange: [0, 1000],
    busType: 'all',
    departureTime: 'all',
    amenities: []
  });
  const [searchPerformed, setSearchPerformed] = useState(false);

  // Handle URL parameters from Home page
  useEffect(() => {
    const origin = searchParams.get('origin');
    const destination = searchParams.get('destination');
    const date = searchParams.get('date');
    const passengers = searchParams.get('passengers');

    if (origin || destination || date || passengers) {
      setSearchForm(prev => ({
        ...prev,
        origin: origin || prev.origin,
        destination: destination || prev.destination,
        date: date || prev.date,
        passengers: passengers ? Number(passengers) : prev.passengers
      }));
      
      // Auto-search if we have the required fields
      if (origin && destination && date) {
        setSearchPerformed(true);
      }
    }
  }, [searchParams]);

  const popularDestinations = [
    { origin: 'Chennai', destination: 'Madurai', price: '₹450' },
    { origin: 'Coimbatore', destination: 'Chennai', price: '₹520' },
    { origin: 'Salem', destination: 'Tiruchirappalli', price: '₹280' },
    { origin: 'Vellore', destination: 'Coimbatore', price: '₹380' },
    { origin: 'Madurai', destination: 'Rameswaram', price: '₹180' },
    { origin: 'Tiruchirappalli', destination: 'Thanjavur', price: '₹120' }
  ];

  const timeSlots = ['All', 'Morning (6AM-12PM)', 'Afternoon (12PM-6PM)', 'Evening (6PM-12AM)', 'Night (12AM-6AM)'];

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchForm.origin && searchForm.destination && searchForm.date) {
      setSearchPerformed(true);
      // In a real app, this would call the API
      // For now, we'll just show the generated routes
    }
  };

  const handleBookNow = (route) => {
    // Navigate to route details with the route data
    navigate(`/route/${route.id}`, { 
      state: { 
        routeData: route,
        searchForm: searchForm
      } 
    });
  };

  const handleFilterChange = (filterType, value) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
  };

  const toggleAmenity = (amenity) => {
    setFilters(prev => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter(a => a !== amenity)
        : [...prev.amenities, amenity]
    }));
  };

  // Generate dynamic routes based on selected origin/destination
  const generateDynamicRoutes = () => {
    if (!searchForm.origin || !searchForm.destination) {
      return popularTamilNaduRoutes;
    }

    const routes = [];
    const busTypes = ['Standard', 'Premium', 'Luxury'];
    
    busTypes.forEach((busType, index) => {
      const price = getRoutePrice(searchForm.origin, searchForm.destination, busType);
      const duration = getRouteDuration(searchForm.origin, searchForm.destination);
      
      routes.push({
        id: `dynamic-${index}`,
        origin: searchForm.origin,
        destination: searchForm.destination,
        departureTime: `${6 + index * 2}:00 AM`,
        arrivalTime: `${6 + index * 2 + Math.floor(parseFloat(duration))}:00 ${parseFloat(duration) > 12 ? 'PM' : 'AM'}`,
        date: searchForm.date,
        price: price,
        busType: busType,
        availableSeats: 45 - index * 5,
        totalSeats: 50,
        amenities: busType === 'Standard' ? ['AC', 'Reclining Seats'] : 
                  busType === 'Premium' ? ['WiFi', 'AC', 'Reclining Seats', 'USB Charging'] :
                  ['WiFi', 'AC', 'Reclining Seats', 'USB Charging', 'Entertainment', 'Restroom'],
        duration: duration,
        operator: `${searchForm.origin} Express`,
        rating: 4.5 - index * 0.1,
        reviews: 100 - index * 20
      });
    });

    return routes;
  };

  const mockResults = generateDynamicRoutes();

  // Filter results based on selected filters
  const filteredResults = mockResults.filter(route => {
    if (filters.busType !== 'all' && route.busType.toLowerCase() !== filters.busType) {
      return false;
    }
    if (route.price > filters.priceRange[1]) {
      return false;
    }
    if (filters.amenities.length > 0) {
      const hasAllAmenities = filters.amenities.every(amenity => 
        route.amenities.includes(amenity)
      );
      if (!hasAllAmenities) return false;
    }
    return true;
  });

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Netflix-style Background */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-black/80"></div>
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80')`,
            filter: 'brightness(0.6)'
          }}
        ></div>
      </div>

      <div className="relative z-10 pt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <h1 className="text-4xl font-bold text-white mb-2">Search Tamil Nadu Bus Routes</h1>
            <p className="text-gray-300">Connect all 38 districts from North to South and East to West</p>
          </motion.div>

          {/* Search Form */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/10 backdrop-blur-md rounded-2xl shadow-lg p-6 mb-8 border border-white/20"
          >
            <form onSubmit={handleSearch} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    <FaMapMarkerAlt className="inline mr-2" />
                    From
                  </label>
                  <select
                    value={searchForm.origin}
                    onChange={(e) => setSearchForm(prev => ({ ...prev, origin: e.target.value }))}
                    placeholder="Enter origin city"
                    className="w-full p-3 bg-white/90 border border-white/30 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                    required
                  >
                    <option value="">Select Origin</option>
                    {tamilNaduDistricts.map(district => (
                      <option key={district} value={district}>{district}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    <FaMapMarkerAlt className="inline mr-2" />
                    To
                  </label>
                  <select
                    value={searchForm.destination}
                    onChange={(e) => setSearchForm(prev => ({ ...prev, destination: e.target.value }))}
                    placeholder="Enter destination city"
                    className="w-full p-3 bg-white/90 border border-white/30 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                    required
                  >
                    <option value="">Select Destination</option>
                    {tamilNaduDistricts.map(district => (
                      <option key={district} value={district}>{district}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    <FaCalendarAlt className="inline mr-2" />
                    Date
                  </label>
                  <input
                    type="date"
                    value={searchForm.date}
                    onChange={(e) => setSearchForm(prev => ({ ...prev, date: e.target.value }))}
                    className="w-full p-3 bg-white/90 border border-white/30 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    <FaUsers className="inline mr-2" />
                    Passengers
                  </label>
                  <select
                    value={searchForm.passengers}
                    onChange={(e) => setSearchForm(prev => ({ ...prev, passengers: Number(e.target.value) }))}
                    className="w-full p-3 bg-white/90 border border-white/30 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                  >
                    {[1, 2, 3, 4, 5].map(num => (
                      <option key={num} value={num}>
                        {num} {num === 1 ? 'Passenger' : 'Passengers'}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <button
                type="submit"
                className="w-full md:w-auto px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all flex items-center justify-center space-x-2"
              >
                <FaSearch />
                <span>Search Tamil Nadu Routes</span>
              </button>
            </form>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Filters Sidebar */}
            <div className="lg:col-span-1">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-white/10 backdrop-blur-md rounded-2xl shadow-lg p-6 border border-white/20 sticky top-24"
              >
                <div className="flex items-center space-x-2 mb-4">
                  <FaFilter className="text-blue-400" />
                  <h3 className="text-lg font-semibold text-white">Filters</h3>
                </div>

                {/* Price Range */}
                <div className="mb-6">
                  <h4 className="font-medium text-white mb-3">Price Range (₹)</h4>
                  <div className="space-y-2">
                    <input
                      type="range"
                      min="0"
                      max="1000"
                      value={filters.priceRange[1]}
                      onChange={(e) => setFilters(prev => ({ ...prev, priceRange: [0, Number(e.target.value)] }))}
                      className="w-full"
                    />
                    <div className="flex justify-between text-sm text-gray-300">
                      <span>₹0</span>
                      <span>₹{filters.priceRange[1]}</span>
                    </div>
                  </div>
                </div>

                {/* Bus Type */}
                <div className="mb-6">
                  <h4 className="font-medium text-white mb-3">Bus Type</h4>
                  <div className="space-y-2">
                    {tamilNaduBusTypes.map(type => (
                      <label key={type} className="flex items-center space-x-2">
                        <input
                          type="radio"
                          name="busType"
                          value={type.toLowerCase()}
                          checked={filters.busType === type.toLowerCase()}
                          onChange={(e) => handleFilterChange('busType', e.target.value)}
                          className="text-blue-600"
                        />
                        <span className="text-sm text-gray-300">{type}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Departure Time */}
                <div className="mb-6">
                  <h4 className="font-medium text-white mb-3">Departure Time</h4>
                  <div className="space-y-2">
                    {timeSlots.map(time => (
                      <label key={time} className="flex items-center space-x-2">
                        <input
                          type="radio"
                          name="departureTime"
                          value={time.toLowerCase()}
                          checked={filters.departureTime === time.toLowerCase()}
                          onChange={(e) => handleFilterChange('departureTime', e.target.value)}
                          className="text-blue-600"
                        />
                        <span className="text-sm text-gray-300">{time}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Amenities */}
                <div className="mb-6">
                  <h4 className="font-medium text-white mb-3">Amenities</h4>
                  <div className="space-y-2">
                    {tamilNaduAmenities.slice(0, 8).map(amenity => (
                      <label key={amenity} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={filters.amenities.includes(amenity)}
                          onChange={() => toggleAmenity(amenity)}
                          className="text-blue-600 rounded"
                        />
                        <span className="text-sm text-gray-300">{amenity}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Results */}
            <div className="lg:col-span-3">
              {/* Popular Destinations */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white/10 backdrop-blur-md rounded-2xl shadow-lg p-6 mb-6 border border-white/20"
              >
                <h3 className="text-lg font-semibold text-white mb-4">Popular Tamil Nadu Routes</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {popularDestinations.map((route, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.1 }}
                      className="p-4 border border-white/20 rounded-lg hover:border-blue-300 hover:bg-white/5 transition-all cursor-pointer"
                      onClick={() => setSearchForm({
                        origin: route.origin,
                        destination: route.destination,
                        date: searchForm.date,
                        passengers: searchForm.passengers
                      })}
                    >
                      <div className="text-center">
                        <FaGlobe className="text-2xl text-blue-400 mx-auto mb-2" />
                        <span className="font-medium text-white">{route.origin} → {route.destination}</span>
                        <p className="text-green-400 font-semibold mt-1">{route.price}</p>
                        <div className="text-xs text-gray-400 mt-1">Click to search this route</div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>

              {/* Search Results */}
              {isLoading ? (
                <LoadingSpinner />
              ) : searchPerformed && filteredResults.length > 0 ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-semibold text-white">
                      Found {filteredResults.length} routes from {searchForm.origin} to {searchForm.destination}
                    </h3>
                    <span className="text-gray-400 text-sm">
                      Date: {new Date(searchForm.date).toLocaleDateString()}
                    </span>
                  </div>
                  
                  {filteredResults.map((route, index) => (
                    <motion.div
                      key={route.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="bg-white/10 backdrop-blur-md rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow border border-white/20"
                    >
                      <div className="flex flex-col lg:flex-row lg:items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-4 mb-4">
                            <div className="flex items-center space-x-2">
                              <FaRoute className="text-blue-400" />
                              <span className="text-lg font-semibold text-white">{route.origin} → {route.destination}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <FaStar className="text-yellow-400" />
                              <span className="font-medium text-white">{route.rating}</span>
                              <span className="text-gray-400">({route.reviews} reviews)</span>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                            <div className="flex items-center space-x-3">
                              <FaClock className="text-blue-400" />
                              <div>
                                <p className="text-sm text-gray-400">Departure</p>
                                <p className="font-semibold text-white">{route.departureTime}</p>
                              </div>
                            </div>
                            <div className="flex items-center space-x-3">
                              <FaClock className="text-green-400" />
                              <div>
                                <p className="text-sm text-gray-400">Arrival</p>
                                <p className="font-semibold text-white">{route.arrivalTime}</p>
                              </div>
                            </div>
                            <div className="flex items-center space-x-3">
                              <FaBus className="text-purple-400" />
                              <div>
                                <p className="text-sm text-gray-400">Bus Type</p>
                                <p className="font-semibold text-white">{route.busType}</p>
                              </div>
                            </div>
                            <div className="flex items-center space-x-3">
                              <FaUsers className="text-orange-400" />
                              <div>
                                <p className="text-sm text-gray-400">Available Seats</p>
                                <p className="font-semibold text-white">{route.availableSeats}</p>
                              </div>
                            </div>
                          </div>

                          <div className="flex flex-wrap gap-2 mb-4">
                            {route.amenities.map((amenity, index) => (
                              <span
                                key={index}
                                className="px-3 py-1 bg-white/20 text-white rounded-full text-sm border border-white/30"
                              >
                                {amenity}
                              </span>
                            ))}
                          </div>

                          <div className="text-sm text-gray-400">
                            <span className="font-medium text-white">Operator:</span> {route.operator} • 
                            <span className="font-medium ml-2 text-white">Duration:</span> {route.duration}
                          </div>
                        </div>

                        <div className="mt-6 lg:mt-0 lg:ml-6 flex flex-col items-center space-y-4">
                          <div className="text-center">
                            <p className="text-3xl font-bold text-green-400">₹{route.price}</p>
                            <p className="text-sm text-gray-400">per passenger</p>
                          </div>
                          <button
                            onClick={() => handleBookNow(route)}
                            className="inline-flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all"
                          >
                            <span>Book Now</span>
                            <FaArrowRight />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : searchPerformed && filteredResults.length === 0 ? (
                <div className="text-center py-12">
                  <FaSearch className="text-6xl text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-medium text-white mb-2">No routes found</h3>
                  <p className="text-gray-400">Try adjusting your search criteria or filters</p>
                </div>
              ) : (
                <div className="text-center py-12">
                  <FaRoute className="text-6xl text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-medium text-white mb-2">Search for Routes</h3>
                  <p className="text-gray-400">Enter your origin, destination, and date to find available routes</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchRoutes;
