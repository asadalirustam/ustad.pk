const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const morgan = require('morgan');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const { notFound, errorHandler } = require('./middleware/errorHandler');

// Load environment variables
dotenv.config();

// Connect to Database
connectDB();

const app = express();
const server = http.createServer(app);

// Configure Socket.io
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true
  }
});

// Attach Socket.io to Express App instance
app.set('io', io);

// Middleware
app.use(
  cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}

// Health Check / Root Endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'online',
    service: 'Ustaad.pk API',
    timestamp: new Date().toISOString(),
    env: process.env.NODE_ENV || 'development'
  });
});

// Mount API Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/providers', require('./routes/providerRoutes'));
app.use('/api/bookings', require('./routes/bookingRoutes'));
app.use('/api/reviews', require('./routes/reviewRoutes'));
app.use('/api/services', require('./routes/serviceRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));

// Socket.io Real-time connection handling
io.on('connection', (socket) => {
  console.log(`[Socket.io] Client connected: ${socket.id}`);

  // User joins their private room (for direct booking pings, status updates)
  socket.on('join_user', (userId) => {
    if (userId) {
      const room = `user_${userId}`;
      socket.join(room);
      console.log(`[Socket.io] Socket ${socket.id} joined room: ${room}`);
    }
  });

  // Client joins a specific booking room
  socket.on('join_booking', (bookingId) => {
    if (bookingId) {
      const room = `booking_${bookingId}`;
      socket.join(room);
      console.log(`[Socket.io] Socket ${socket.id} joined room: ${room}`);
    }
  });

  // Real-time chat/ping inside a booking
  socket.on('booking_chat_message', ({ bookingId, senderName, message, role }) => {
    if (bookingId && message) {
      io.to(`booking_${bookingId}`).emit('new_booking_message', {
        bookingId,
        senderName,
        message,
        role,
        timestamp: new Date().toISOString()
      });
    }
  });

  socket.on('disconnect', () => {
    console.log(`[Socket.io] Client disconnected: ${socket.id}`);
  });
});

// Error handling middleware
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(
    `[Ustaad.pk Server] Running in ${process.env.NODE_ENV || 'development'} mode on http://localhost:${PORT}`
  );
});

module.exports = { app, server };
