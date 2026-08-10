import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth.js';
import profileRoutes from './routes/profile.js';
import logsRoutes from './routes/logs.js';
import weightRoutes from './routes/weight.js';
import summaryRoutes from './routes/summary.js';
import groupRoutes from './routes/group.js';

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/logs', logsRoutes);
app.use('/api/weight', weightRoutes);
app.use('/api/summary', summaryRoutes);
app.use('/api/group', groupRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', app: 'FitTrack API', timestamp: new Date().toISOString() });
});

// 404 Handler
app.use((req, res) => {
  res.status(404).json({ message: 'API Endpoint not found' });
});

export default app;
