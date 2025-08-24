import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';
import toast from 'react-hot-toast';

// Create context
const SocketContext = createContext();

// Provider component
export const SocketProvider = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const socketRef = useRef(null);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState(null);

  // Initialize socket connection
  useEffect(() => {
    if (isAuthenticated && user) {
      const socket = io(process.env.REACT_APP_API_URL || 'http://localhost:5000', {
        auth: {
          token: localStorage.getItem('token'),
        },
        transports: ['websocket', 'polling'],
        timeout: 10000,
      });

      socketRef.current = socket;

      // Connection events
      socket.on('connect', () => {
        setIsConnected(true);
        setConnectionError(null);
        console.log('Socket connected:', socket.id);
        
        // Join user's personal room
        socket.emit('join-user-room', { userId: user._id });
      });

      socket.on('disconnect', () => {
        setIsConnected(false);
        console.log('Socket disconnected');
      });

      socket.on('connect_error', (error) => {
        setConnectionError(error.message);
        console.error('Socket connection error:', error);
      });

      // Real-time events
      socket.on('booking-update', (data) => {
        console.log('Booking update received:', data);
        handleBookingUpdate(data);
      });

      socket.on('bus-location-update', (data) => {
        console.log('Bus location update received:', data);
        handleBusLocationUpdate(data);
      });

      socket.on('trip-status-update', (data) => {
        console.log('Trip status update received:', data);
        handleTripStatusUpdate(data);
      });

      socket.on('payment-update', (data) => {
        console.log('Payment update received:', data);
        handlePaymentUpdate(data);
      });

      socket.on('notification', (data) => {
        console.log('Notification received:', data);
        handleNotification(data);
      });

      socket.on('system-alert', (data) => {
        console.log('System alert received:', data);
        handleSystemAlert(data);
      });

      // Error handling
      socket.on('error', (error) => {
        console.error('Socket error:', error);
        toast.error('Connection error occurred');
      });

      // Cleanup on unmount
      return () => {
        if (socket) {
          socket.disconnect();
        }
      };
    }
  }, [isAuthenticated, user]);

  // Handle booking updates
  const handleBookingUpdate = (data) => {
    const { type, booking, message } = data;
    
    switch (type) {
      case 'confirmed':
        toast.success(`Booking ${booking.bookingNumber} confirmed!`);
        break;
      case 'cancelled':
        toast.error(`Booking ${booking.bookingNumber} cancelled: ${message}`);
        break;
      case 'completed':
        toast.success(`Trip completed for booking ${booking.bookingNumber}`);
        break;
      case 'reminder':
        toast.success(`Reminder: Your trip is in ${message}`, {
          duration: 6000,
        });
        break;
      default:
        console.log('Unknown booking update type:', type);
    }
  };

  // Handle bus location updates
  const handleBusLocationUpdate = (data) => {
    const { busId, location, estimatedArrival } = data;
    
    // This could trigger a map update or notification
    console.log(`Bus ${busId} location updated:`, location);
    
    if (estimatedArrival) {
      toast.success(`Bus ${busId} will arrive in ${estimatedArrival}`, {
        duration: 4000,
      });
    }
  };

  // Handle trip status updates
  const handleTripStatusUpdate = (data) => {
    const { tripId, status, message } = data;
    
    switch (status) {
      case 'delayed':
        toast.error(`Trip ${tripId} is delayed: ${message}`, {
          duration: 8000,
        });
        break;
      case 'cancelled':
        toast.error(`Trip ${tripId} has been cancelled: ${message}`);
        break;
      case 'on-time':
        toast.success(`Trip ${tripId} is running on time`);
        break;
      case 'arrived':
        toast.success(`Trip ${tripId} has arrived at destination`);
        break;
      default:
        console.log('Unknown trip status:', status);
    }
  };

  // Handle payment updates
  const handlePaymentUpdate = (data) => {
    const { type, payment, message } = data;
    
    switch (type) {
      case 'successful':
        toast.success(`Payment successful for booking ${payment.booking}`);
        break;
      case 'failed':
        toast.error(`Payment failed: ${message}`);
        break;
      case 'refunded':
        toast.success(`Refund processed for payment ${payment._id}`);
        break;
      default:
        console.log('Unknown payment update type:', type);
    }
  };

  // Handle general notifications
  const handleNotification = (data) => {
    const { type, title, message, priority } = data;
    
    const toastOptions = {
      duration: priority === 'high' ? 8000 : 4000,
    };

    switch (type) {
      case 'info':
        toast(message, toastOptions);
        break;
      case 'success':
        toast.success(message, toastOptions);
        break;
      case 'warning':
        toast.error(message, toastOptions);
        break;
      case 'error':
        toast.error(message, { duration: 10000 });
        break;
      default:
        toast(message, toastOptions);
    }
  };

  // Handle system alerts
  const handleSystemAlert = (data) => {
    const { level, title, message, action } = data;
    
    const toastOptions = {
      duration: 10000,
    };

    switch (level) {
      case 'critical':
        toast.error(`🚨 ${title}: ${message}`, toastOptions);
        break;
      case 'warning':
        toast.error(`⚠️ ${title}: ${message}`, toastOptions);
        break;
      case 'info':
        toast.success(`ℹ️ ${title}: ${message}`, toastOptions);
        break;
      default:
        toast(`${title}: ${message}`, toastOptions);
    }
  };

  // Emit events to server
  const emitEvent = (eventName, data) => {
    if (socketRef.current && isConnected) {
      socketRef.current.emit(eventName, data);
    } else {
      console.warn('Socket not connected, cannot emit event:', eventName);
    }
  };

  // Join specific rooms
  const joinRoom = (roomName, data = {}) => {
    emitEvent('join-room', { room: roomName, ...data });
  };

  // Leave specific rooms
  const leaveRoom = (roomName) => {
    emitEvent('leave-room', { room: roomName });
  };

  // Send booking update
  const sendBookingUpdate = (bookingId, update) => {
    emitEvent('booking-update', { bookingId, update });
  };

  // Send bus location update
  const sendBusLocationUpdate = (busId, location) => {
    emitEvent('bus-location-update', { busId, location });
  };

  // Send trip status update
  const sendTripStatusUpdate = (tripId, status, message) => {
    emitEvent('trip-status-update', { tripId, status, message });
  };

  // Context value
  const value = {
    socket: socketRef.current,
    isConnected,
    connectionError,
    emitEvent,
    joinRoom,
    leaveRoom,
    sendBookingUpdate,
    sendBusLocationUpdate,
    sendTripStatusUpdate,
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};

// Custom hook to use socket context
export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};

export default SocketContext;
