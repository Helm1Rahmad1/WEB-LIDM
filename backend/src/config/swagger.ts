import swaggerJsdoc from 'swagger-jsdoc';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Sign Quran API',
      version: '1.0.0',
      description: 'API Documentation untuk Sign Quran Learning Management System - Platform pembelajaran huruf hijaiyah',
      contact: {
        name: 'LIDM Team',
        email: 'juarasatulidm2025@gmail.com',
      },
    },
    servers: [
      {
        url: process.env.NODE_ENV === 'production'
          ? `https://${process.env.DOMAIN || 'signquran.site'}`
          : `http://localhost:${process.env.PORT || 3001}`,
        description: process.env.NODE_ENV === 'production' ? 'Production Server' : 'Development Server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'JWT token dari response login',
        },
        cookieAuth: {
          type: 'apiKey',
          in: 'cookie',
          name: 'token',
          description: 'JWT token stored in cookie',
        },
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            user_id: {
              type: 'string',
              format: 'uuid',
              example: '123e4567-e89b-12d3-a456-426614174000',
            },
            name: {
              type: 'string',
              example: 'John Doe',
            },
            email: {
              type: 'string',
              format: 'email',
              example: 'john@example.com',
            },
            role: {
              type: 'string',
              enum: ['guru', 'murid'],
              example: 'murid',
            },
            is_verified: {
              type: 'boolean',
              example: true,
            },
          },
        },
        Room: {
          type: 'object',
          properties: {
            room_id: {
              type: 'integer',
              example: 1,
            },
            name: {
              type: 'string',
              example: 'Kelas Iqra 1',
            },
            description: {
              type: 'string',
              example: 'Belajar dasar-dasar hijaiyah',
            },
            code: {
              type: 'string',
              example: 'ABC123',
            },
            created_by: {
              type: 'string',
              format: 'uuid',
            },
            created_at: {
              type: 'string',
              format: 'date-time',
            },
          },
        },
        Hijaiyah: {
          type: 'object',
          properties: {
            hijaiyah_id: {
              type: 'integer',
              example: 1,
            },
            latin_name: {
              type: 'string',
              example: 'Alif',
            },
            arabic_char: {
              type: 'string',
              example: 'ا',
            },
            ordinal: {
              type: 'integer',
              example: 1,
            },
          },
        },
        Error: {
          type: 'object',
          properties: {
            error: {
              type: 'string',
              example: 'Error message here',
            },
          },
        },
      },
    },
    tags: [
      {
        name: 'Authentication',
        description: 'Endpoints untuk authentication (register, login, verify)',
      },
      {
        name: 'Rooms',
        description: 'Endpoints untuk manajemen kelas/ruang belajar',
      },
      {
        name: 'Progress',
        description: 'Endpoints untuk tracking progress belajar',
      },
      {
        name: 'Tests',
        description: 'Endpoints untuk ujian dan hasil test',
      },
      {
        name: 'Hijaiyah',
        description: 'Endpoints untuk data huruf hijaiyah',
      },
      {
        name: 'Jilid',
        description: 'Endpoints untuk data jilid (level pembelajaran)',
      },
      {
        name: 'Pages',
        description: 'Endpoints untuk data halaman (pages) dan huruf hijaiyah per halaman',
      },
    ],
  },
  apis: ['./src/routes/*.ts', './dist/routes/*.js'], // Path untuk development dan production
};

export const swaggerSpec = swaggerJsdoc(options);
