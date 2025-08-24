import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaSearch, FaMapMarkerAlt, FaCalendarAlt, FaUsers, FaBus, FaRoute, FaStar, FaClock, FaArrowRight } from 'react-icons/fa';
import { popularTamilNaduRoutes, tamilNaduDistricts } from '../data/tamilNaduRoutes';

const Home = () => {
  const navigate = useNavigate();
  const [searchForm, setSearchForm] = useState({
    origin: '',
    destination: '',
    date: '',
    passengers: 1
  });

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchForm.origin && searchForm.destination && searchForm.date) {
      // Navigate to search page with the form data
      const params = new URLSearchParams({
        origin: searchForm.origin,
        destination: searchForm.destination,
        date: searchForm.date,
        passengers: searchForm.passengers,
      });
      navigate(`/search?${params.toString()}`);
    }
  };

  const quickRoutes = [
    { origin: 'Chennai', destination: 'Madurai', price: '₹450' },
    { origin: 'Coimbatore', destination: 'Chennai', price: '₹520' },
    { origin: 'Salem', destination: 'Tiruchirappalli', price: '₹280' },
    { origin: 'Vellore', destination: 'Coimbatore', price: '₹380' }
  ];

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Netflix-style Background Video/Image */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/80"></div>
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2069&q=80')`,
            filter: 'brightness(0.7)'
          }}
        ></div>
      </div>

      {/* Hero Section */}
      <div className="relative z-10 pt-20 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-5xl md:text-7xl font-bold text-white mb-6"
          >
            <span className="bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
              Tamil Nadu
            </span>
            <br />
            <span className="text-white">Bus Booking</span>
          </motion.h1>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-xl md:text-2xl text-gray-200 mb-8 max-w-3xl mx-auto"
          >
            Discover the beauty of Tamil Nadu with our comprehensive bus network covering all 38 districts from North to South
          </motion.p>

          {/* Search Form */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20 shadow-2xl max-w-4xl mx-auto"
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
                className="w-full md:w-auto px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all text-lg font-semibold shadow-2xl hover:shadow-blue-500/25 flex items-center justify-center space-x-2"
              >
                <FaSearch />
                <span>Search Tamil Nadu Routes</span>
              </button>
            </form>
          </motion.div>
        </div>
      </div>

      {/* Quick Routes Section */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.6 }}
        className="relative z-10 py-16 bg-gradient-to-b from-transparent to-black/20"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-white text-center mb-12">Popular Tamil Nadu Routes</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {quickRoutes.map((route, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.8 + index * 0.1 }}
                className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20 hover:bg-white/20 transition-all cursor-pointer group"
              >
                <div className="text-center">
                  <FaRoute className="text-3xl text-blue-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-white mb-2">
                    {route.origin} → {route.destination}
                  </h3>
                  <p className="text-2xl font-bold text-green-400 mb-3">{route.price}</p>
                  <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm">
                    Book Now
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Features Section */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.8 }}
        className="relative z-10 py-16 bg-gradient-to-b from-black/20 to-black/40"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-white text-center mb-12">Why Choose Tamil Nadu Bus Network?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center"
            >
              <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaRoute className="text-2xl text-white" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">Complete Coverage</h3>
              <p className="text-gray-300">All 38 districts connected with comprehensive route network from North to South</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-center"
            >
              <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaBus className="text-2xl text-white" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">Premium Fleet</h3>
              <p className="text-gray-300">Modern buses with WiFi, AC, and premium amenities for comfortable travel</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="text-center"
            >
              <div className="w-16 h-16 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaClock className="text-2xl text-white" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">24/7 Service</h3>
              <p className="text-gray-300">Round-the-clock booking and support for your convenience</p>
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* CTA Section */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 1.0 }}
        className="relative z-10 py-16 bg-gradient-to-b from-black/40 to-black/60"
      >
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-white mb-6">Ready to Explore Tamil Nadu?</h2>
          <p className="text-xl text-gray-300 mb-8">
            Book your journey today and experience the rich culture, heritage, and beauty of Tamil Nadu
          </p>
          <Link
            to="/search"
            className="inline-flex items-center space-x-2 px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all text-lg font-semibold shadow-2xl hover:shadow-blue-500/25"
          >
            <span>Start Your Journey</span>
            <FaArrowRight />
          </Link>
        </div>
      </motion.div>
    </div>
  );
};

export default Home;
