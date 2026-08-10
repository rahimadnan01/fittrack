import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';

export async function authenticateToken(req, res, next) {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer <token>

    if (!token) {
      return res.status(401).json({ message: 'Access denied: No authentication token provided' });
    }

    const secret = process.env.JWT_SECRET || 'fittrack_fallback_secret_2026';
    const decoded = jwt.verify(token, secret);

    const user = await User.findById(decoded.userId).select('-passwordHash');
    if (!user) {
      return res.status(401).json({ message: 'Invalid token: User no longer exists' });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(403).json({ message: 'Invalid or expired token', error: error.message });
  }
}
