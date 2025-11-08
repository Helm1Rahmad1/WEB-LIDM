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

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
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
