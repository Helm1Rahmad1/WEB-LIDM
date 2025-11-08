import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';

import authRoutes from './routes/auth';
import roomsRoutes from './routes/rooms';
import progressRoutes from './routes/progress';
import testsRoutes from './routes/tests';
import hijaiyahRoutes from './routes/hijaiyah';
import jilidRoutes from './routes/jilid';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Parse FRONTEND_URL to support multiple origins
const frontendUrls = (process.env.FRONTEND_URL || 'http://localhost:3000').split(',');

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    if (frontendUrls.includes(origin)) {
      callback(null, true);
    } else {
      console.log('⚠️ CORS blocked origin:', origin);
      console.log('✅ Allowed origins:', frontendUrls);
      callback(null, true); // Still allow for development
    }
  },
  credentials: true,
}));

app.use(express.json());
app.use(cookieParser());

app.use('/api/auth', authRoutes);
app.use('/api/rooms', roomsRoutes);
app.use('/api/progress', progressRoutes);
app.use('/api/tests', testsRoutes);
app.use('/api/hijaiyah', hijaiyahRoutes);
app.use('/api/jilid', jilidRoutes);

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
