import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaUser, FaCreditCard, FaCheckCircle, FaArrowLeft, FaTicketAlt, FaMapMarkerAlt, FaClock, FaBus } from 'react-icons/fa';
import { useAuth } from '../contexts/AuthContext';
import { useBooking } from '../contexts/BookingContext';
import LoadingSpinner from '../components/common/LoadingSpinner';

const BookingForm = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated } = useAuth();
  const { createBooking } = useBooking();
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [bookingData, setBookingData] = useState(null);
  const [routeData, setRouteData] = useState(null);
  const [passengerDetails, setPassengerDetails] = useState([]);
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [paymentDetails, setPaymentDetails] = useState({
    cardNumber: '',
    cardHolder: '',
    expiry: '',
    cvv: ''
  });

  useEffect(() => {
    if (location.state?.bookingData && location.state?.routeData) {
      setBookingData(location.state.bookingData);
      setRouteData(location.state.routeData);
      
      // Initialize passenger details
      const initialPassengers = [];
      for (let i = 0; i < location.state.bookingData.passengers; i++) {
        initialPassengers.push({
          firstName: '',
          lastName: '',
          age: '',
          gender: '',
          phone: '',
          email: user?.email || ''
        });
      }
      setPassengerDetails(initialPassengers);
    } else {
      // Redirect if no booking data
      navigate('/search');
    }
  }, [location.state, navigate, user?.email]);

  const handlePassengerChange = (index, field, value) => {
    const updatedPassengers = [...passengerDetails];
    updatedPassengers[index][field] = value;
    setPassengerDetails(updatedPassengers);
  };

  const handlePaymentChange = (field, value) => {
    setPaymentDetails(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const nextStep = () => {
    if (currentStep === 1 && !validatePassengerDetails()) {
      alert('Please fill in all passenger details');
      return;
    }
    if (currentStep === 2 && !validatePaymentDetails()) {
      alert('Please fill in all payment details');
      return;
    }
    setCurrentStep(currentStep + 1);
  };

  const prevStep = () => {
    setCurrentStep(currentStep - 1);
  };

  const validatePassengerDetails = () => {
    return passengerDetails.every(passenger => 
      passenger.firstName && passenger.lastName && passenger.age && passenger.gender && passenger.phone
    );
  };

  const validatePaymentDetails = () => {
    return paymentDetails.cardNumber && paymentDetails.cardHolder && paymentDetails.expiry && paymentDetails.cvv;
  };

  const handleSubmit = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    setIsLoading(true);
    try {
      const finalBookingData = {
        ...bookingData,
        passengerDetails,
        paymentMethod,
        paymentDetails,
        status: 'confirmed',
        bookingDate: new Date().toISOString()
      };

      // In a real app, this would call the API
      console.log('Final booking data:', finalBookingData);
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Navigate to confirmation
      navigate('/booking-confirmation', { 
        state: { 
          bookingData: finalBookingData,
          routeData: routeData
        } 
      });
    } catch (error) {
      console.error('Booking failed:', error);
      alert('Booking failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!bookingData || !routeData) {
    return <LoadingSpinner />;
  }

  const steps = [
    { number: 1, title: 'Passenger Details', icon: FaUser },
    { number: 2, title: 'Payment', icon: FaCreditCard },
    { number: 3, title: 'Confirmation', icon: FaCheckCircle }
  ];

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={() => navigate(-1)}
          className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 mb-6 transition-colors"
        >
          <FaArrowLeft />
          <span>Back to Route Details</span>
        </motion.button>

        {/* Route Summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-lg p-6 mb-8"
        >
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold text-gray-900">Booking Summary</h1>
            <div className="text-right">
              <p className="text-2xl font-bold text-green-600">₹{bookingData.totalPrice}</p>
              <p className="text-sm text-gray-500">{bookingData.passengers} passenger(s)</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center space-x-3">
              <FaMapMarkerAlt className="text-blue-500" />
              <div>
                <p className="text-sm text-gray-500">Route</p>
                <p className="font-semibold">{routeData.origin} → {routeData.destination}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <FaClock className="text-green-500" />
              <div>
                <p className="text-sm text-gray-500">Date & Time</p>
                <p className="font-semibold">{routeData.date} • {routeData.departureTime}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <FaBus className="text-purple-500" />
              <div>
                <p className="text-sm text-gray-500">Bus & Seats</p>
                <p className="font-semibold">{routeData.busType} • {bookingData.seats.join(', ')}</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Progress Steps */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-center mb-8"
        >
          {steps.map((step, index) => (
            <div key={step.number} className="flex items-center">
              <div className={`flex items-center justify-center w-10 h-10 rounded-full ${
                currentStep >= step.number 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-200 text-gray-500'
              }`}>
                <step.icon />
              </div>
              <span className={`ml-2 font-medium ${
                currentStep >= step.number ? 'text-blue-600' : 'text-gray-500'
              }`}>
                {step.title}
              </span>
              {index < steps.length - 1 && (
                <div className={`w-16 h-0.5 mx-4 ${
                  currentStep > step.number ? 'bg-blue-600' : 'bg-gray-200'
                }`} />
              )}
            </div>
          ))}
        </motion.div>

        {/* Step Content */}
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white rounded-2xl shadow-lg p-6"
        >
          {/* Step 1: Passenger Details */}
          {currentStep === 1 && (
            <div>
              <h2 className="text-xl font-semibold mb-6">Passenger Details</h2>
              <div className="space-y-6">
                {passengerDetails.map((passenger, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4">
                    <h3 className="font-medium mb-4">Passenger {index + 1}</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          First Name *
                        </label>
                        <input
                          type="text"
                          value={passenger.firstName}
                          onChange={(e) => handlePassengerChange(index, 'firstName', e.target.value)}
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Last Name *
                        </label>
                        <input
                          type="text"
                          value={passenger.lastName}
                          onChange={(e) => handlePassengerChange(index, 'lastName', e.target.value)}
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Age *
                        </label>
                        <input
                          type="number"
                          value={passenger.age}
                          onChange={(e) => handlePassengerChange(index, 'age', e.target.value)}
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          min="1"
                          max="120"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Gender *
                        </label>
                        <select
                          value={passenger.gender}
                          onChange={(e) => handlePassengerChange(index, 'gender', e.target.value)}
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          required
                        >
                          <option value="">Select Gender</option>
                          <option value="male">Male</option>
                          <option value="female">Female</option>
                          <option value="other">Other</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Phone Number *
                        </label>
                        <input
                          type="tel"
                          value={passenger.phone}
                          onChange={(e) => handlePassengerChange(index, 'phone', e.target.value)}
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Email
                        </label>
                        <input
                          type="email"
                          value={passenger.email}
                          onChange={(e) => handlePassengerChange(index, 'email', e.target.value)}
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Step 2: Payment */}
          {currentStep === 2 && (
            <div>
              <h2 className="text-xl font-semibold mb-6">Payment Details</h2>
              <div className="space-y-6">
                {/* Payment Method Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Payment Method
                  </label>
                  <div className="space-y-3">
                    <label className="flex items-center space-x-3">
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="card"
                        checked={paymentMethod === 'card'}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        className="text-blue-600"
                      />
                      <span>Credit/Debit Card</span>
                    </label>
                    <label className="flex items-center space-x-3">
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="upi"
                        checked={paymentMethod === 'upi'}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        className="text-blue-600"
                      />
                      <span>UPI</span>
                    </label>
                    <label className="flex items-center space-x-3">
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="netbanking"
                        checked={paymentMethod === 'netbanking'}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        className="text-blue-600"
                      />
                      <span>Net Banking</span>
                    </label>
                  </div>
                </div>

                {/* Card Details */}
                {paymentMethod === 'card' && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Card Number *
                      </label>
                      <input
                        type="text"
                        value={paymentDetails.cardNumber}
                        onChange={(e) => handlePaymentChange('cardNumber', e.target.value)}
                        placeholder="1234 5678 9012 3456"
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        maxLength="19"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Card Holder Name *
                      </label>
                      <input
                        type="text"
                        value={paymentDetails.cardHolder}
                        onChange={(e) => handlePaymentChange('cardHolder', e.target.value)}
                        placeholder="JOHN DOE"
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Expiry Date *
                        </label>
                        <input
                          type="text"
                          value={paymentDetails.expiry}
                          onChange={(e) => handlePaymentChange('expiry', e.target.value)}
                          placeholder="MM/YY"
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          maxLength="5"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          CVV *
                        </label>
                        <input
                          type="text"
                          value={paymentDetails.cvv}
                          onChange={(e) => handlePaymentChange('cvv', e.target.value)}
                          placeholder="123"
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          maxLength="4"
                          required
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* UPI Details */}
                {paymentMethod === 'upi' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      UPI ID *
                    </label>
                    <input
                      type="text"
                      placeholder="username@upi"
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>
                )}

                {/* Net Banking Details */}
                {paymentMethod === 'netbanking' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Select Bank *
                    </label>
                    <select className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" required>
                      <option value="">Select your bank</option>
                      <option value="sbi">State Bank of India</option>
                      <option value="hdfc">HDFC Bank</option>
                      <option value="icici">ICICI Bank</option>
                      <option value="axis">Axis Bank</option>
                      <option value="pnb">Punjab National Bank</option>
                    </select>
                  </div>
                )}

                {/* Payment Summary */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-medium mb-3">Payment Summary</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Base Fare ({bookingData.passengers} × ₹{routeData.price})</span>
                      <span>₹{routeData.price * bookingData.passengers}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Taxes & Fees</span>
                      <span>₹{(routeData.price * bookingData.passengers * 0.05).toFixed(2)}</span>
                    </div>
                    <div className="border-t pt-2 flex justify-between font-semibold">
                      <span>Total Amount</span>
                      <span>₹{bookingData.totalPrice}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Confirmation */}
          {currentStep === 3 && (
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaCheckCircle className="text-green-600 text-2xl" />
              </div>
              <h2 className="text-xl font-semibold mb-4">Review Your Booking</h2>
              <p className="text-gray-600 mb-6">
                Please review all the details before confirming your booking
              </p>
              
              <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
                <h3 className="font-medium mb-3">Booking Summary</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Route:</span>
                    <span>{routeData.origin} → {routeData.destination}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Date:</span>
                    <span>{routeData.date}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Time:</span>
                    <span>{routeData.departureTime}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Seats:</span>
                    <span>{bookingData.seats.join(', ')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Passengers:</span>
                    <span>{bookingData.passengers}</span>
                  </div>
                  <div className="flex justify-between font-medium">
                    <span>Total Amount:</span>
                    <span>₹{bookingData.totalPrice}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8">
            {currentStep > 1 && (
              <button
                onClick={prevStep}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Previous
              </button>
            )}
            
            {currentStep < 3 ? (
              <button
                onClick={nextStep}
                className="ml-auto px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Next
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={isLoading}
                className="ml-auto px-8 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                {isLoading ? (
                  <>
                    <LoadingSpinner />
                    <span>Processing...</span>
                  </>
                ) : (
                  <>
                    <FaTicketAlt />
                    <span>Confirm Booking</span>
                  </>
                )}
              </button>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default BookingForm;
