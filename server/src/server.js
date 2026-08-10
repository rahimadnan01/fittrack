import app from './app.js';
import { connectDB } from './config/db.js';
import dotenv from 'dotenv';

dotenv.config();

const PORT = process.env.PORT || 5000;

async function startServer() {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`🚀 FitTrack REST API Server running on port ${PORT}`);
  });
}

startServer();
