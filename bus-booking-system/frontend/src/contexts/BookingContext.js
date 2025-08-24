import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { bookingsAPI, routesAPI, busesAPI } from '../services/api';
import { useAuth } from './AuthContext';
import { useSocket } from './SocketContext';
import toast from 'react-hot-toast';

// Initial state
const initialState = {
  // Current search and filters
  searchQuery: '',
  filters: {
    origin: '',
    destination: '',
    date: '',
    passengers: 1,
    busType: '',
    priceRange: { min: 0, max: 1000 },
  },
  
  // Search results
  routes: [],
  filteredRoutes: [],
  selectedRoute: null,
  
  // Booking process
  currentBooking: null,
  selectedSeats: [],
  passengerDetails: [],
  
  // User's bookings
  userBookings: [],
  upcomingBookings: [],
  completedBookings: [],
  cancelledBookings: [],
  
  // Loading states
  isLoading: false,
  isSearching: false,
  isBooking: false,
  
  // Error states
  error: null,
  searchError: null,
  bookingError: null,
  
  // Pagination
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  },
};

// Action types
const BOOKING_ACTIONS = {
  // Search actions
  SET_SEARCH_QUERY: 'SET_SEARCH_QUERY',
  SET_FILTERS: 'SET_FILTERS',
  CLEAR_FILTERS: 'CLEAR_FILTERS',
  SEARCH_ROUTES_START: 'SEARCH_ROUTES_START',
  SEARCH_ROUTES_SUCCESS: 'SEARCH_ROUTES_SUCCESS',
  SEARCH_ROUTES_FAILURE: 'SEARCH_ROUTES_FAILURE',
  
  // Route selection
  SELECT_ROUTE: 'SELECT_ROUTE',
  CLEAR_SELECTED_ROUTE: 'CLEAR_SELECTED_ROUTE',
  
  // Booking process
  SET_CURRENT_BOOKING: 'SET_CURRENT_BOOKING',
  SET_SELECTED_SEATS: 'SET_SELECTED_SEATS',
  SET_PASSENGER_DETAILS: 'SET_PASSENGER_DETAILS',
  CLEAR_BOOKING_DATA: 'CLEAR_BOOKING_DATA',
  
  // User bookings
  FETCH_USER_BOOKINGS_START: 'FETCH_USER_BOOKINGS_START',
  FETCH_USER_BOOKINGS_SUCCESS: 'FETCH_USER_BOOKINGS_SUCCESS',
  FETCH_USER_BOOKINGS_FAILURE: 'FETCH_USER_BOOKINGS_FAILURE',
  
  // Booking operations
  CREATE_BOOKING_START: 'CREATE_BOOKING_START',
  CREATE_BOOKING_SUCCESS: 'CREATE_BOOKING_SUCCESS',
  CREATE_BOOKING_FAILURE: 'CREATE_BOOKING_FAILURE',
  
  CANCEL_BOOKING_START: 'CANCEL_BOOKING_START',
  CANCEL_BOOKING_SUCCESS: 'CANCEL_BOOKING_SUCCESS',
  CANCEL_BOOKING_FAILURE: 'CANCEL_BOOKING_FAILURE',
  
  // Real-time updates
  UPDATE_BOOKING: 'UPDATE_BOOKING',
  REMOVE_BOOKING: 'REMOVE_BOOKING',
  
  // Pagination
  SET_PAGE: 'SET_PAGE',
  SET_LIMIT: 'SET_LIMIT',
  
  // Loading states
  SET_LOADING: 'SET_LOADING',
  SET_SEARCH_LOADING: 'SET_SEARCH_LOADING',
  SET_BOOKING_LOADING: 'SET_BOOKING_LOADING',
  
  // Error handling
  SET_ERROR: 'SET_ERROR',
  SET_SEARCH_ERROR: 'SET_SEARCH_ERROR',
  SET_BOOKING_ERROR: 'SET_BOOKING_ERROR',
  CLEAR_ERRORS: 'CLEAR_ERRORS',
};

// Reducer function
const bookingReducer = (state, action) => {
  switch (action.type) {
    case BOOKING_ACTIONS.SET_SEARCH_QUERY:
      return {
        ...state,
        searchQuery: action.payload,
      };
    
    case BOOKING_ACTIONS.SET_FILTERS:
      return {
        ...state,
        filters: { ...state.filters, ...action.payload },
      };
    
    case BOOKING_ACTIONS.CLEAR_FILTERS:
      return {
        ...state,
        filters: initialState.filters,
        searchQuery: '',
      };
    
    case BOOKING_ACTIONS.SEARCH_ROUTES_START:
      return {
        ...state,
        isSearching: true,
        searchError: null,
      };
    
    case BOOKING_ACTIONS.SEARCH_ROUTES_SUCCESS:
      return {
        ...state,
        routes: action.payload.routes,
        filteredRoutes: action.payload.routes,
        isSearching: false,
        searchError: null,
        pagination: {
          ...state.pagination,
          total: action.payload.total,
          totalPages: Math.ceil(action.payload.total / state.pagination.limit),
        },
      };
    
    case BOOKING_ACTIONS.SEARCH_ROUTES_FAILURE:
      return {
        ...state,
        isSearching: false,
        searchError: action.payload,
        routes: [],
        filteredRoutes: [],
      };
    
    case BOOKING_ACTIONS.SELECT_ROUTE:
      return {
        ...state,
        selectedRoute: action.payload,
      };
    
    case BOOKING_ACTIONS.CLEAR_SELECTED_ROUTE:
      return {
        ...state,
        selectedRoute: null,
      };
    
    case BOOKING_ACTIONS.SET_CURRENT_BOOKING:
      return {
        ...state,
        currentBooking: action.payload,
      };
    
    case BOOKING_ACTIONS.SET_SELECTED_SEATS:
      return {
        ...state,
        selectedSeats: action.payload,
      };
    
    case BOOKING_ACTIONS.SET_PASSENGER_DETAILS:
      return {
        ...state,
        passengerDetails: action.payload,
      };
    
    case BOOKING_ACTIONS.CLEAR_BOOKING_DATA:
      return {
        ...state,
        currentBooking: null,
        selectedSeats: [],
        passengerDetails: [],
      };
    
    case BOOKING_ACTIONS.FETCH_USER_BOOKINGS_START:
      return {
        ...state,
        isLoading: true,
        error: null,
      };
    
    case BOOKING_ACTIONS.FETCH_USER_BOOKINGS_SUCCESS:
      const { bookings, upcoming, completed, cancelled } = action.payload;
      return {
        ...state,
        userBookings: bookings,
        upcomingBookings: upcoming,
        completedBookings: completed,
        cancelledBookings: cancelled,
        isLoading: false,
        error: null,
      };
    
    case BOOKING_ACTIONS.FETCH_USER_BOOKINGS_FAILURE:
      return {
        ...state,
        isLoading: false,
        error: action.payload,
      };
    
    case BOOKING_ACTIONS.CREATE_BOOKING_START:
      return {
        ...state,
        isBooking: true,
        bookingError: null,
      };
    
    case BOOKING_ACTIONS.CREATE_BOOKING_SUCCESS:
      const newBooking = action.payload;
      return {
        ...state,
        isBooking: false,
        bookingError: null,
        userBookings: [newBooking, ...state.userBookings],
        upcomingBookings: [newBooking, ...state.upcomingBookings],
        currentBooking: null,
        selectedSeats: [],
        passengerDetails: [],
      };
    
    case BOOKING_ACTIONS.CREATE_BOOKING_FAILURE:
      return {
        ...state,
        isBooking: false,
        bookingError: action.payload,
      };
    
    case BOOKING_ACTIONS.CANCEL_BOOKING_START:
      return {
        ...state,
        isLoading: true,
        error: null,
      };
    
    case BOOKING_ACTIONS.CANCEL_BOOKING_SUCCESS:
      const { cancelledBooking } = action.payload;
      return {
        ...state,
        isLoading: false,
        error: null,
        userBookings: state.userBookings.map(booking =>
          booking._id === cancelledBooking._id ? cancelledBooking : booking
        ),
        upcomingBookings: state.upcomingBookings.filter(
          booking => booking._id !== cancelledBooking._id
        ),
        cancelledBookings: [cancelledBooking, ...state.cancelledBookings],
      };
    
    case BOOKING_ACTIONS.CANCEL_BOOKING_FAILURE:
      return {
        ...state,
        isLoading: false,
        error: action.payload,
      };
    
    case BOOKING_ACTIONS.UPDATE_BOOKING:
      const updatedBooking = action.payload;
      return {
        ...state,
        userBookings: state.userBookings.map(booking =>
          booking._id === updatedBooking._id ? updatedBooking : booking
        ),
        upcomingBookings: state.upcomingBookings.map(booking =>
          booking._id === updatedBooking._id ? updatedBooking : booking
        ),
        completedBookings: state.completedBookings.map(booking =>
          booking._id === updatedBooking._id ? updatedBooking : booking
        ),
        cancelledBookings: state.cancelledBookings.map(booking =>
          booking._id === updatedBooking._id ? updatedBooking : booking
        ),
      };
    
    case BOOKING_ACTIONS.REMOVE_BOOKING:
      const removedBookingId = action.payload;
      return {
        ...state,
        userBookings: state.userBookings.filter(
          booking => booking._id !== removedBookingId
        ),
        upcomingBookings: state.upcomingBookings.filter(
          booking => booking._id !== removedBookingId
        ),
        completedBookings: state.completedBookings.filter(
          booking => booking._id !== removedBookingId
        ),
        cancelledBookings: state.cancelledBookings.filter(
          booking => booking._id !== removedBookingId
        ),
      };
    
    case BOOKING_ACTIONS.SET_PAGE:
      return {
        ...state,
        pagination: { ...state.pagination, page: action.payload },
      };
    
    case BOOKING_ACTIONS.SET_LIMIT:
      return {
        ...state,
        pagination: { ...state.pagination, limit: action.payload, page: 1 },
      };
    
    case BOOKING_ACTIONS.SET_LOADING:
      return {
        ...state,
        isLoading: action.payload,
      };
    
    case BOOKING_ACTIONS.SET_SEARCH_LOADING:
      return {
        ...state,
        isSearching: action.payload,
      };
    
    case BOOKING_ACTIONS.SET_BOOKING_LOADING:
      return {
        ...state,
        isBooking: action.payload,
      };
    
    case BOOKING_ACTIONS.SET_ERROR:
      return {
        ...state,
        error: action.payload,
      };
    
    case BOOKING_ACTIONS.SET_SEARCH_ERROR:
      return {
        ...state,
        searchError: action.payload,
      };
    
    case BOOKING_ACTIONS.SET_BOOKING_ERROR:
      return {
        ...state,
        bookingError: action.payload,
      };
    
    case BOOKING_ACTIONS.CLEAR_ERRORS:
      return {
        ...state,
        error: null,
        searchError: null,
        bookingError: null,
      };
    
    default:
      return state;
  }
};

// Create context
const BookingContext = createContext();

// Provider component
export const BookingProvider = ({ children }) => {
  const [state, dispatch] = useReducer(bookingReducer, initialState);
  const { user, isAuthenticated } = useAuth();
  const { socket, isConnected } = useSocket();

  // Listen for real-time booking updates
  useEffect(() => {
    if (isConnected && socket) {
      socket.on('booking-update', (data) => {
        if (data.booking && data.booking.user === user?._id) {
          dispatch({
            type: BOOKING_ACTIONS.UPDATE_BOOKING,
            payload: data.booking,
          });
        }
      });

      return () => {
        socket.off('booking-update');
      };
    }
  }, [isConnected, socket, user]);

  // Search routes function
  const searchRoutes = async (searchParams = {}) => {
    const params = { ...state.filters, ...searchParams };
    
    dispatch({ type: BOOKING_ACTIONS.SEARCH_ROUTES_START });
    
    try {
      const response = await routesAPI.search(params);
      const { routes, total } = response.data.data;
      
      dispatch({
        type: BOOKING_ACTIONS.SEARCH_ROUTES_SUCCESS,
        payload: { routes, total },
      });
      
      return { success: true, routes, total };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Search failed';
      dispatch({
        type: BOOKING_ACTIONS.SEARCH_ROUTES_FAILURE,
        payload: errorMessage,
      });
      
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  // Fetch user bookings function
  const fetchUserBookings = async (params = {}) => {
    if (!isAuthenticated) return;
    
    dispatch({ type: BOOKING_ACTIONS.FETCH_USER_BOOKINGS_START });
    
    try {
      const [bookingsResponse, upcomingResponse] = await Promise.all([
        bookingsAPI.getAll(params),
        bookingsAPI.getUpcoming(),
      ]);
      
      const bookings = bookingsResponse.data.data;
      const upcoming = upcomingResponse.data.data;
      
      // Categorize bookings
      const completed = bookings.filter(booking => booking.status === 'completed');
      const cancelled = bookings.filter(booking => booking.status === 'cancelled');
      
      dispatch({
        type: BOOKING_ACTIONS.FETCH_USER_BOOKINGS_SUCCESS,
        payload: { bookings, upcoming, completed, cancelled },
      });
      
      return { success: true, bookings, upcoming, completed, cancelled };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to fetch bookings';
      dispatch({
        type: BOOKING_ACTIONS.FETCH_USER_BOOKINGS_FAILURE,
        payload: errorMessage,
      });
      
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  // Create booking function
  const createBooking = async (bookingData) => {
    dispatch({ type: BOOKING_ACTIONS.CREATE_BOOKING_START });
    
    try {
      const response = await bookingsAPI.create(bookingData);
      const newBooking = response.data.data;
      
      dispatch({
        type: BOOKING_ACTIONS.CREATE_BOOKING_SUCCESS,
        payload: newBooking,
      });
      
      toast.success('Booking created successfully!');
      return { success: true, booking: newBooking };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Booking creation failed';
      dispatch({
        type: BOOKING_ACTIONS.CREATE_BOOKING_FAILURE,
        payload: errorMessage,
      });
      
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  // Cancel booking function
  const cancelBooking = async (bookingId, reason) => {
    dispatch({ type: BOOKING_ACTIONS.CANCEL_BOOKING_START });
    
    try {
      const response = await bookingsAPI.cancel(bookingId, reason);
      const cancelledBooking = response.data.data;
      
      dispatch({
        type: BOOKING_ACTIONS.CANCEL_BOOKING_SUCCESS,
        payload: { cancelledBooking },
      });
      
      toast.success('Booking cancelled successfully!');
      return { success: true, booking: cancelledBooking };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Booking cancellation failed';
      dispatch({
        type: BOOKING_ACTIONS.CANCEL_BOOKING_FAILURE,
        payload: errorMessage,
      });
      
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  // Helper functions
  const setSearchQuery = (query) => {
    dispatch({ type: BOOKING_ACTIONS.SET_SEARCH_QUERY, payload: query });
  };

  const setFilters = (filters) => {
    dispatch({ type: BOOKING_ACTIONS.SET_FILTERS, payload: filters });
  };

  const clearFilters = () => {
    dispatch({ type: BOOKING_ACTIONS.CLEAR_FILTERS });
  };

  const selectRoute = (route) => {
    dispatch({ type: BOOKING_ACTIONS.SELECT_ROUTE, payload: route });
  };

  const clearSelectedRoute = () => {
    dispatch({ type: BOOKING_ACTIONS.CLEAR_SELECTED_ROUTE });
  };

  const setCurrentBooking = (booking) => {
    dispatch({ type: BOOKING_ACTIONS.SET_CURRENT_BOOKING, payload: booking });
  };

  const setSelectedSeats = (seats) => {
    dispatch({ type: BOOKING_ACTIONS.SET_SELECTED_SEATS, payload: seats });
  };

  const setPassengerDetails = (details) => {
    dispatch({ type: BOOKING_ACTIONS.SET_PASSENGER_DETAILS, payload: details });
  };

  const clearBookingData = () => {
    dispatch({ type: BOOKING_ACTIONS.CLEAR_BOOKING_DATA });
  };

  const setPage = (page) => {
    dispatch({ type: BOOKING_ACTIONS.SET_PAGE, payload: page });
  };

  const setLimit = (limit) => {
    dispatch({ type: BOOKING_ACTIONS.SET_LIMIT, payload: limit });
  };

  const clearErrors = () => {
    dispatch({ type: BOOKING_ACTIONS.CLEAR_ERRORS });
  };

  // Context value
  const value = {
    ...state,
    // Actions
    searchRoutes,
    fetchUserBookings,
    createBooking,
    cancelBooking,
    
    // Helper functions
    setSearchQuery,
    setFilters,
    clearFilters,
    selectRoute,
    clearSelectedRoute,
    setCurrentBooking,
    setSelectedSeats,
    setPassengerDetails,
    clearBookingData,
    setPage,
    setLimit,
    clearErrors,
  };

  return (
    <BookingContext.Provider value={value}>
      {children}
    </BookingContext.Provider>
  );
};

// Custom hook to use booking context
export const useBooking = () => {
  const context = useContext(BookingContext);
  if (!context) {
    throw new Error('useBooking must be used within a BookingProvider');
  }
  return context;
};

export default BookingContext;
