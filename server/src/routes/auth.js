import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';
import { MaintenanceHistory } from '../models/MaintenanceHistory.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Helper to sign JWT
function generateToken(userId) {
  const secret = process.env.JWT_SECRET || 'fittrack_fallback_secret_2026';
  return jwt.sign({ userId }, secret, { expiresIn: '30d' });
}

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, maintenanceCalories, startingWeightKg, heightCm, goal } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email, and password are required' });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ message: 'An account with this email already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const initialMaintenance = Number(maintenanceCalories) || 2000;
    const today = new Date().toISOString().split('T')[0];

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      passwordHash,
      maintenanceCalories: initialMaintenance,
      startingWeightKg: startingWeightKg ? Number(startingWeightKg) : null,
      heightCm: heightCm ? Number(heightCm) : null,
      goal: goal || 'CUT'
    });

    // Record initial maintenance history entry
    await MaintenanceHistory.create({
      userId: user._id,
      maintenanceCalories: initialMaintenance,
      effectiveFrom: today
    });

    const token = generateToken(user._id);

    res.status(201).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        maintenanceCalories: user.maintenanceCalories,
        startingWeightKg: user.startingWeightKg,
        heightCm: user.heightCm,
        goal: user.goal
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Registration failed', error: error.message });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const token = generateToken(user._id);

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        maintenanceCalories: user.maintenanceCalories,
        startingWeightKg: user.startingWeightKg,
        heightCm: user.heightCm,
        goal: user.goal
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Login failed', error: error.message });
  }
});

// GET /api/auth/me
router.get('/me', authenticateToken, async (req, res) => {
  res.json({
    user: {
      id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      maintenanceCalories: req.user.maintenanceCalories,
      startingWeightKg: req.user.startingWeightKg,
      heightCm: req.user.heightCm,
      goal: req.user.goal
    }
  });
});

export default router;
