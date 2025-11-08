# 🚀 Setup Swagger UI untuk API Documentation

## Install Dependencies

```bash
cd backend
npm install swagger-ui-express swagger-jsdoc
npm install --save-dev @types/swagger-ui-express @types/swagger-jsdoc
```

## Implementasi

### 1. Buat file `swagger.ts`

```typescript
// backend/src/config/swagger.ts
import swaggerJsdoc from 'swagger-jsdoc';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Sign Quran API',
      version: '1.0.0',
      description: 'API Documentation untuk Sign Quran Learning Management System',
      contact: {
        name: 'LIDM Team',
      },
    },
    servers: [
      {
        url: 'https://signquran.site/api',
        description: 'Production server',
      },
      {
        url: 'http://localhost:3001',
        description: 'Development server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
        cookieAuth: {
          type: 'apiKey',
          in: 'cookie',
          name: 'token',
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
      {
        cookieAuth: [],
      },
    ],
  },
  apis: ['./src/routes/*.ts'], // Path to API routes
};

export const swaggerSpec = swaggerJsdoc(options);
```

### 2. Update `index.ts`

```typescript
// backend/src/index.ts
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './config/swagger';

// ... existing imports ...

const app = express();

// ... existing middleware ...

// Swagger Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'Sign Quran API Docs',
}));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// ... rest of your code ...
```

### 3. Tambah JSDoc Comments di Routes

Contoh untuk auth routes:

```typescript
// backend/src/routes/auth.ts

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Register user baru
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - password
 *               - role
 *             properties:
 *               name:
 *                 type: string
 *                 example: John Doe
 *               email:
 *                 type: string
 *                 format: email
 *                 example: john@example.com
 *               password:
 *                 type: string
 *                 format: password
 *                 example: password123
 *               role:
 *                 type: string
 *                 enum: [guru, murid]
 *                 example: murid
 *     responses:
 *       201:
 *         description: Registration successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 userId:
 *                   type: string
 *                 user:
 *                   type: object
 *       400:
 *         description: Bad request
 */
router.post('/register', async (req, res) => {
  // ... your code ...
});

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Login user
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 format: password
 *     responses:
 *       200:
 *         description: Login successful
 *       401:
 *         description: Invalid credentials
 *       403:
 *         description: Email not verified
 */
router.post('/login', async (req, res) => {
  // ... your code ...
});
```

## Akses Documentation

Setelah setup:

### Development:
```
http://localhost:3001/api-docs
```

### Production:
```
https://signquran.site/api-docs
```

## Update Nginx Config

Pastikan nginx config meneruskan `/api-docs`:

```nginx
# Backend API dan docs proxy
location ~ ^/(api|api-docs) {
    proxy_pass http://localhost:3001;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_cache_bypass $http_upgrade;
}
```

## Deploy

```bash
# Di VPS
cd /root/lombalidm2025

# Install dependencies
cd backend
npm install swagger-ui-express swagger-jsdoc
cd ..

# Rebuild & restart
docker-compose build backend --no-cache
docker-compose up -d

# Check logs
docker-compose logs -f backend
```

## Test

```bash
# Open browser
https://signquran.site/api-docs

# Atau curl
curl https://signquran.site/health
```

---

## Alternatif: Redoc

Jika ingin tampilan lebih clean seperti Stripe docs:

```bash
npm install redoc-express
```

```typescript
import redoc from 'redoc-express';

app.get('/docs', redoc({
  title: 'Sign Quran API',
  specUrl: '/swagger.json',
}));

app.get('/swagger.json', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerSpec);
});
```

Akses: `https://signquran.site/docs`
