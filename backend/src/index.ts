import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './config/swagger';

import authRoutes from './routes/auth';
import roomsRoutes from './routes/rooms';
import progressRoutes from './routes/progress';
import hijaiyahRoutes from './routes/hijaiyah';
import jilidRoutes from './routes/jilid';
import jilidLettersRoutes from './routes/jilid-letters';
import pagesRoutes from './routes/pages';
import usersRoutes from './routes/users';
import enrollmentsRoutes from './routes/enrollments';
import messagesRoutes from './routes/messages';

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

// Swagger UI Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customSiteTitle: 'SignQuran API Documentation',
  customCss: '.swagger-ui .topbar { display: none }',
}));

app.use('/api/auth', authRoutes);
app.use('/api/rooms', roomsRoutes);
app.use('/api/progress', progressRoutes);
app.use('/api/hijaiyah', hijaiyahRoutes);
app.use('/api/jilid', jilidRoutes);
app.use('/api/jilid-letters', jilidLettersRoutes);
app.use('/api/pages', pagesRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/enrollments', enrollmentsRoutes);
app.use('/api/messages', messagesRoutes);

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
