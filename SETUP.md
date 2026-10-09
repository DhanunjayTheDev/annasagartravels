# Setup Guide - Annasagar Travels

## Dependency Resolution Issues

This project required specific configuration due to peer dependency conflicts with some packages.

### Known Issues & Solutions

#### 1. Vite 6 & vite-plugin-pwa Compatibility
**Issue:** `vite-plugin-pwa@0.17.4` only supports Vite 3-5, not Vite 6.

**Solution:** 
- Updated to `vite-plugin-pwa@^0.20.0` in `client/package.json`
- Use `--legacy-peer-deps` flag when installing

```bash
cd client && npm install --legacy-peer-deps
```

#### 2. Cloudinary 2.x & multer-storage-cloudinary Compatibility
**Issue:** `multer-storage-cloudinary@4.0.0` requires `cloudinary@^1.21.0`, but project uses 2.x.

**Solution:**
- Use `--legacy-peer-deps` flag when installing server dependencies

```bash
cd server && npm install --legacy-peer-deps
```

## Prerequisites

- Node.js 20+ (LTS recommended)
- npm 10+
- MongoDB 7+
- Redis 7+

## Installation Steps

### 1. Install Dependencies

```bash
# Client (with legacy peer deps flag)
cd client && npm install --legacy-peer-deps

# Server (with legacy peer deps flag)
cd ../server && npm install --legacy-peer-deps

# Admin
cd ../admin && npm install
```

### 2. Configure Environment

Create `.env` file in `/server`:

```bash
cd server
cp .env.example .env
```

Edit `.env` with required values:

```env
# MongoDB
MONGODB_URI=mongodb://localhost:27017/annasagar_travels

# Redis
REDIS_URL=redis://localhost:6379

# JWT
JWT_ACCESS_SECRET=your_access_secret_key_here
JWT_REFRESH_SECRET=your_refresh_secret_key_here
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d

# Razorpay
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Email (Nodemailer)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password

# Frontend URLs
CLIENT_URL=http://localhost:5173
ADMIN_URL=http://localhost:5174

# Others
PORT=5000
NODE_ENV=development
LOG_LEVEL=debug
```

### 3. Seed Database

The project includes seed data for testing:

```bash
cd server && npm run seed
```

This creates:
- 1 Super Admin user
- 1 Staff user
- 1 Customer user
- 10 sample vehicles (cars and buses)

### 4. Start Development Servers

Open 3 separate terminal windows:

**Terminal 1 - Backend API (port 5000):**
```bash
cd server && npm run dev
```

**Terminal 2 - Client App (port 5173):**
```bash
cd client && npm run dev
```

**Terminal 3 - Admin Panel (port 5174):**
```bash
cd admin && npm run dev
```

### 5. Access the Application

| Service | URL | Credentials |
|---------|-----|-------------|
| **Client** | http://localhost:5173 | Use any registered account |
| **Admin** | http://localhost:5174 | superadmin@annasagartravels.com / Admin@12345 |
| **API** | http://localhost:5000/api/v1 | Use /auth/login to get JWT |
| **Swagger** | http://localhost:5000/api-docs | View API documentation |

## Troubleshooting

### Port Already in Use

If a port is already in use, you can specify a different port:

```bash
# Client on different port
cd client && npm run dev -- --port 3000

# Admin on different port  
cd admin && npm run dev -- --port 3001
```

### MongoDB/Redis Connection Issues

Ensure MongoDB and Redis are running:

```bash
# Check MongoDB
mongo --eval "db.version()"

# Check Redis
redis-cli ping
```

### Dependency Installation Fails

Always use `--legacy-peer-deps` for client and server:

```bash
npm install --legacy-peer-deps --force
```

### Clear npm Cache

If you still face issues, clear npm cache:

```bash
npm cache clean --force
```

## Database Reset

To reset the database and reseed:

```bash
cd server

# CAUTION: This will delete all data
npx mongoose-cleanup --uri mongodb://localhost:27017/annasagar_travels

# Then reseed
npm run seed
```

## Production Build

Build all frontend assets for production:

```bash
# Build client
cd client && npm run build

# Build admin
cd admin && npm run build

# Result: dist directories created
```

## Docker Deployment

```bash
docker-compose up -d
```

All services will be available at `http://localhost`

## Need Help?

- Check `.env.example` for all available configuration options
- Review API docs at `/api-docs` endpoint
- Check server logs in `server/logs/` directory
- Review Github issues for common problems
