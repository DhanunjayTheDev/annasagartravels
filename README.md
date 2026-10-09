# Annasagar Travels – Enterprise Travel Booking Platform

A full-stack, production-ready travel booking platform for **Cars & Buses** built with the MERN stack. Features real-time availability, Razorpay payments, role-based admin panel, PDF invoices, email notifications, and Docker deployment.

---

## Tech Stack

| Layer | Technologies |
|-------|-------------|
| **Frontend** | React 18, Vite 6, TypeScript, Tailwind CSS, Zustand, Axios, GSAP, PWA |
| **Admin** | React 18, Vite, TypeScript, Tailwind CSS, Recharts |
| **Backend** | Node.js, Express.js, MongoDB, Mongoose, Redis, BullMQ |
| **Payments** | Razorpay (Orders, Webhooks, Refunds) |
| **Storage** | Cloudinary (vehicle images) |
| **Email** | Nodemailer + BullMQ workers |
| **Docs** | Swagger / OpenAPI |

## Architecture

```
┌──────────┐   ┌──────────┐   ┌──────────────────────────┐
│  Client  │   │  Admin   │   │        Nginx             │
│ :5173    │   │ :5174    │──>│  Reverse Proxy + Static  │
└────┬─────┘   └────┬─────┘   └───────────┬──────────────┘
     │              │                     │
     └──────────────┴─────────────────────┘
                    │ /api/v1/*
            ┌───────▼────────┐
            │   Express API  │──── Swagger Docs
            │   :5000        │
            └──┬──────┬──────┘
               │      │
        ┌──────▼┐  ┌──▼──────┐
        │MongoDB│  │  Redis   │
        │       │  │ (cache,  │
        │       │  │  queues) │
        └───────┘  └──┬──────┘
                      │
               ┌──────▼──────┐
               │  BullMQ     │
               │  Workers    │
               │ email/pdf/  │
               │ payment     │
               └─────────────┘
```

**Backend Pattern:** Controller → Service → Repository → DB

## Project Structure

```
annasagartravels/
├── server/              # Express.js API
│   ├── src/
│   │   ├── config/      # DB, Redis, Cloudinary, Razorpay, Swagger
│   │   ├── middleware/   # Auth, validation, rate limiting, idempotency
│   │   ├── models/       # Mongoose schemas (User, Vehicle, Booking, etc.)
│   │   ├── validators/   # Zod validation schemas
│   │   ├── repositories/ # Data access layer
│   │   ├── services/     # Business logic
│   │   ├── controllers/  # Route handlers
│   │   ├── routes/       # Express routes
│   │   ├── queues/       # BullMQ queues & workers
│   │   ├── utils/        # Logger, errors, helpers
│   │   └── scripts/      # Seed data
│   └── tests/            # Jest tests
├── client/              # React customer app
│   └── src/
│       ├── components/  # UI, layout, auth, vehicles
│       ├── pages/       # Home, Vehicles, Booking, Auth, etc.
│       ├── stores/      # Zustand state management
│       ├── lib/         # API client, utils
│       └── types/       # TypeScript interfaces
├── admin/               # React admin panel
│   └── src/
│       ├── components/  # Sidebar, Layout, Guard
│       ├── pages/       # Dashboard, Vehicles, Bookings, Users, Analytics
│       ├── stores/      # Auth store
│       └── lib/         # API client, utils
├── docker-compose.yml   # Full stack Docker setup
├── nginx.conf           # Nginx reverse proxy config
├── ecosystem.config.cjs # PM2 production config
└── .github/workflows/   # CI/CD pipeline
```

## Getting Started

### Prerequisites

- Node.js 20+
- MongoDB 7+
- Redis 7+

### Setup

```bash
# 1. Clone the repo
git clone <repo-url> && cd annasagartravels

# 2. Install dependencies (use --legacy-peer-deps for client due to vite-plugin-pwa compatibility)
cd server && npm install --legacy-peer-deps
cd ../client && npm install --legacy-peer-deps
cd ../admin && npm install

# 3. Configure environment
cd ../server
cp .env.example .env
# Edit .env with your MongoDB URI, Redis URL, Razorpay keys, etc.

# 4. Seed database
npm run seed

# 5. Start development servers (in separate terminals)
cd server && npm run dev   # API on :5000
cd client && npm run dev   # Client on :5173
cd admin && npm run dev    # Admin on :5174
```

### Default Seed Users

| Role | Email | Password |
|------|-------|----------|
| Super Admin | superadmin@annasagartravels.com | Admin@12345 |
| Staff | staff@annasagartravels.com | Staff@12345 |
| Customer | customer@annasagartravels.com | Customer@12345 |

## API Documentation

Swagger docs available at `http://localhost:5000/api-docs` when the server is running.

### Key Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/auth/register` | Register user |
| POST | `/api/v1/auth/login` | Login |
| GET | `/api/v1/vehicles` | List vehicles (with filters) |
| POST | `/api/v1/bookings` | Create booking |
| POST | `/api/v1/payments/order` | Create Razorpay order |
| POST | `/api/v1/payments/webhook` | Razorpay webhook |
| GET | `/api/v1/admin/dashboard` | Admin dashboard stats |

## Docker Deployment

```bash
# Build and run all services
docker-compose up -d

# Access:
# Client: http://localhost
# Admin:  http://localhost/admin
# API:    http://localhost/api/v1
```

## PM2 Deployment

```bash
# Build frontend assets
cd client && npm run build
cd ../admin && npm run build

# Start with PM2
cd .. && pm2 start ecosystem.config.cjs
```

## Testing

```bash
cd server && npm test
```

## License

Private – Annasagar Travels