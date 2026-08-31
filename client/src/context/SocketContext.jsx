import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
  const { user } = useAuth();
  const [socket, setSocket] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [latestNotification, setLatestNotification] = useState(null);

  useEffect(() => {
    // Initialize socket connection
    const socketInstance = io(window.location.origin, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 10
    });

    socketInstance.on('connect', () => {
      console.log('[Socket.io] Connected to server with ID:', socketInstance.id);
      if (user?._id) {
        socketInstance.emit('join_user', user._id);
      }
    });

    // Listen for new booking requests (Provider side)
    socketInstance.on('new_booking_request', (data) => {
      console.log('[Socket.io] Received new_booking_request:', data);
      const notification = {
        id: Date.now(),
        type: 'new_booking',
        title: 'New Booking Request Received!',
        message: data.message,
        booking: data.booking,
        timestamp: new Date()
      };
      setNotifications((prev) => [notification, ...prev]);
      setLatestNotification(notification);
    });

    // Listen for booking status changes (Customer & Provider side)
    socketInstance.on('booking_status_updated', (data) => {
      console.log('[Socket.io] Received booking_status_updated:', data);
      const notification = {
        id: Date.now(),
        type: 'status_update',
        title: `Booking Status: ${data.status.toUpperCase()}`,
        message: data.message,
        bookingId: data.bookingId,
        status: data.status,
        booking: data.booking,
        timestamp: new Date()
      };
      setNotifications((prev) => [notification, ...prev]);
      setLatestNotification(notification);
    });

    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
    };
  }, [user?._id]);

  // Join room when user changes
  useEffect(() => {
    if (socket && user?._id) {
      socket.emit('join_user', user._id);
    }
  }, [socket, user?._id]);

  const clearLatestNotification = () => {
    setLatestNotification(null);
  };

  const clearAllNotifications = () => {
    setNotifications([]);
  };

  return (
    <SocketContext.Provider
      value={{
        socket,
        notifications,
        latestNotification,
        clearLatestNotification,
        clearAllNotifications
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);
