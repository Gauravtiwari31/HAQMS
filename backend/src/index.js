const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

// Load environment variables first
dotenv.config();

// Validate critical environment variables
if (!process.env.JWT_SECRET) {
  console.error('[FATAL] JWT_SECRET is not defined in environment variables.');
  process.exit(1);
}

const authRoutes = require('./routes/auth');
const patientRoutes = require('./routes/patients');
const doctorRoutes = require('./routes/doctors');
const appointmentRoutes = require('./routes/appointments');
const queueRoutes = require('./routes/queue');
const reportRoutes = require('./routes/reports');

const app = express();
const PORT = process.env.PORT || 5000;
const NODE_ENV = process.env.NODE_ENV || 'development';

// ─── CORS Configuration ───────────────────────────────────────────────────────
// FIX: Restrict CORS to known origins instead of allowing all (*)
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',').map((o) => o.trim())
  : [
    'http://localhost:3000',
    'http://127.0.0.1:3000',
    'https://haqms-navy.vercel.app'
  ];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (e.g., server-to-server, curl in dev)
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error(`CORS: Origin ${origin} is not permitted.`));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// ─── Body Parser ──────────────────────────────────────────────────────────────
app.use(express.json({ limit: '1mb' }));

// ─── Request Logger (Dev only) ────────────────────────────────────────────────
if (NODE_ENV === 'development') {
  app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
    next();
  });
}

// ─── Health Check ─────────────────────────────────────────────────────────────
app.get('/health', (req, res) => {
  res.json({ status: 'ok', version: '2.0.0', timestamp: new Date().toISOString() });
});

// ─── API Routes ───────────────────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/patients', patientRoutes);
app.use('/api/doctors', doctorRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/queue', queueRoutes);
app.use('/api/reports', reportRoutes);

// ─── 404 Handler ──────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found.' });
});

// ─── Global Error Handler ─────────────────────────────────────────────────────
// FIX: Never leak internal error details or stack traces to the client in production
app.use((err, req, res, next) => {
  console.error('[ERROR]:', err.message);

  if (err.message && err.message.startsWith('CORS:')) {
    return res.status(403).json({ error: 'CORS policy violation.' });
  }

  res.status(err.status || 500).json({
    error: NODE_ENV === 'production' ? 'An unexpected error occurred.' : err.message,
  });
});

// ─── Start Server ─────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n===================================================`);
  console.log(`   HAQMS Backend API v2.0.0`);
  console.log(`   Listening on port ${PORT} [${NODE_ENV}]`);
  console.log(`===================================================\n`);
});

// ─── Unhandled Rejections ─────────────────────────────────────────────────────
process.on('unhandledRejection', (reason) => {
  console.error('[UNHANDLED REJECTION]:', reason);
  // In production, exit and let process manager restart
  if (NODE_ENV === 'production') {
    process.exit(1);
  }
});

process.on('uncaughtException', (error) => {
  console.error('[UNCAUGHT EXCEPTION]:', error.message);
  process.exit(1);
});
