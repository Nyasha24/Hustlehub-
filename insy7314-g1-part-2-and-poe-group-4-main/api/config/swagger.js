const swaggerUi = require('swagger-ui-express');

const swaggerDocument = {
  openapi: '3.0.0',
  info: {
    title: 'HustleHub+ API Documentation',
    version: '2.0.0',
    description: 'Interactive REST API specification for HustleHub+ Secure Freelance Marketplace platform (INSY7314 / APDS7311). Includes RBAC, JWT Authorization, Gigs, Bookings, and Financial Analytics.',
    contact: {
      name: 'Group 4 (Mthunzi Sibiya, Jean-Remy Mugenga, Nyasha Marova)',
      email: 'mthunzi.sibiya2005@gmail.com'
    }
  },
  servers: [
    {
      url: 'https://hustlehub-api-production.up.railway.app',
      description: 'Production Railway Cloud Server'
    },
    {
      url: 'http://localhost:4000',
      description: 'Local Development Server'
    }
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Enter your JWT token in the format: Bearer <token>'
      }
    },
    schemas: {
      User: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          fullName: { type: 'string', example: 'Alex Rivera' },
          email: { type: 'string', format: 'email', example: 'alex@example.com' },
          role: { type: 'string', enum: ['client', 'freelancer', 'admin'], example: 'freelancer' }
        }
      },
      Gig: {
        type: 'object',
        properties: {
          _id: { type: 'string' },
          title: { type: 'string', example: 'Full-Stack React & Node Security Development' },
          category: { type: 'string', example: 'Web Development' },
          description: { type: 'string', example: 'Professional web development service.' },
          price: { type: 'number', example: 250 },
          deliveryDays: { type: 'number', example: 5 },
          location: { type: 'string', example: 'Johannesburg, South Africa' },
          freelancer: { type: 'object' }
        }
      },
      Booking: {
        type: 'object',
        properties: {
          _id: { type: 'string' },
          client: { type: 'string' },
          freelancer: { type: 'string' },
          gig: { type: 'string' },
          amount: { type: 'number', example: 250 },
          requirements: { type: 'string', example: 'Build secure authentication system.' },
          status: { type: 'string', enum: ['pending', 'in_progress', 'completed', 'cancelled'] }
        }
      },
      Transaction: {
        type: 'object',
        properties: {
          _id: { type: 'string' },
          booking: { type: 'string' },
          amount: { type: 'number', example: 250 },
          platformFee: { type: 'number', example: 25 },
          netFreelancerIncome: { type: 'number', example: 225 },
          estimatedTax: { type: 'number', example: 33.75 },
          status: { type: 'string', example: 'completed' }
        }
      }
    }
  },
  paths: {
    '/health': {
      get: {
        tags: ['System'],
        summary: 'Health check endpoint',
        responses: {
          '200': {
            description: 'API is healthy and operational'
          }
        }
      }
    },
    '/api/auth/register': {
      post: {
        tags: ['Authentication'],
        summary: 'Register a new User (Client or Freelancer)',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['fullName', 'email', 'password'],
                properties: {
                  fullName: { type: 'string' },
                  email: { type: 'string' },
                  password: { type: 'string' },
                  role: { type: 'string', enum: ['client', 'freelancer'] }
                }
              }
            }
          }
        },
        responses: {
          '201': { description: 'User created and JWT issued' },
          '400': { description: 'Validation error' },
          '409': { description: 'User already exists' }
        }
      }
    },
    '/api/auth/login': {
      post: {
        tags: ['Authentication'],
        summary: 'Authenticate User with Email and Password',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email', 'password'],
                properties: {
                  email: { type: 'string' },
                  password: { type: 'string' }
                }
              }
            }
          }
        },
        responses: {
          '200': { description: 'Login successful' },
          '401': { description: 'Invalid credentials' }
        }
      }
    },
    '/api/auth/google': {
      post: {
        tags: ['Authentication'],
        summary: 'Google OAuth 2.0 Single Sign-On',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['idToken'],
                properties: {
                  idToken: { type: 'string', description: 'Google ID Token from client OAuth flow' },
                  role: { type: 'string', enum: ['client', 'freelancer'], default: 'client' }
                }
              }
            }
          }
        },
        responses: {
          '200': { description: 'Google SSO authentication successful' },
          '401': { description: 'Invalid Google token' }
        }
      }
    },
    '/api/auth/me': {
      get: {
        tags: ['Authentication'],
        summary: 'Get Current Authenticated User Profile',
        security: [{ bearerAuth: [] }],
        responses: {
          '200': { description: 'Profile returned' },
          '401': { description: 'Unauthorized' }
        }
      }
    },
    '/api/gigs': {
      get: {
        tags: ['Marketplace Gigs'],
        summary: 'Get All Available Gigs (Public)',
        responses: {
          '200': { description: 'Array of gigs returned' }
        }
      },
      post: {
        tags: ['Marketplace Gigs'],
        summary: 'Create New Gig (Freelancers & Admins)',
        security: [{ bearerAuth: [] }],
        responses: {
          '201': { description: 'Gig created' },
          '403': { description: 'Forbidden: Requires Freelancer or Admin role' }
        }
      }
    },
    '/api/bookings': {
      get: {
        tags: ['Bookings'],
        summary: 'Get User Bookings (RBAC Filtered)',
        security: [{ bearerAuth: [] }],
        responses: {
          '200': { description: 'Bookings list' }
        }
      },
      post: {
        tags: ['Bookings'],
        summary: 'Book a Gig / Service (Clients & Admins)',
        security: [{ bearerAuth: [] }],
        responses: {
          '201': { description: 'Booking and simulated transaction created' }
        }
      }
    },
    '/api/transactions': {
      get: {
        tags: ['Transactions & Financials'],
        summary: 'Get User Transactions',
        security: [{ bearerAuth: [] }],
        responses: {
          '200': { description: 'Transactions list' }
        }
      }
    },
    '/api/transactions/freelancer-income': {
      get: {
        tags: ['Transactions & Financials'],
        summary: 'Get Freelancer Income & Tax Obligation Summary',
        security: [{ bearerAuth: [] }],
        responses: {
          '200': { description: 'Gross income, platform fees, net earnings, and estimated tax' }
        }
      }
    }
  }
};

const setupSwagger = (app) => {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
  app.get('/api-docs.json', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(swaggerDocument);
  });
};

module.exports = {
  setupSwagger,
  swaggerDocument
};