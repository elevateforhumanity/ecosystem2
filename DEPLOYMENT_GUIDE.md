# Deployment Guide

## Prerequisites

- Node.js 20+
- PostgreSQL 15+
- Redis 7+
- Docker & Docker Compose (optional)

## Environment Setup

### Backend (.env)
```bash
cd backend
cp .env.example .env
# Edit .env with your configuration
```

### Frontend (.env)
```bash
cp .env.example .env
# Edit .env with your configuration
```

## Local Development

### Using Docker Compose (Recommended)
```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

### Manual Setup

#### 1. Start PostgreSQL and Redis
```bash
# PostgreSQL
docker run -d \
  --name elevate-postgres \
  -e POSTGRES_USER=elevate \
  -e POSTGRES_PASSWORD=elevate_password \
  -e POSTGRES_DB=elevate_db \
  -p 5432:5432 \
  postgres:15-alpine

# Redis
docker run -d \
  --name elevate-redis \
  -p 6379:6379 \
  redis:7-alpine
```

#### 2. Setup Backend
```bash
cd backend

# Install dependencies
npm install

# Generate Prisma Client
npx prisma generate

# Run migrations
npx prisma migrate dev

# Seed database (optional)
npm run seed

# Start development server
npm run dev
```

#### 3. Setup Frontend
```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

## Production Deployment

### Option 1: Docker Compose
```bash
# Build and start
docker-compose -f docker-compose.yml up -d --build

# Run migrations
docker-compose exec backend npx prisma migrate deploy
```

### Option 2: Manual Deployment

#### Backend
```bash
cd backend

# Install production dependencies
npm ci --only=production

# Generate Prisma Client
npx prisma generate

# Build
npm run build

# Run migrations
npx prisma migrate deploy

# Start server
npm start
```

#### Frontend
```bash
# Build
npm run build

# Serve with nginx or similar
# Files are in dist/
```

## Deployment Platforms

### Vercel (Frontend)
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

### Railway (Backend + Database)
1. Create new project on Railway
2. Add PostgreSQL and Redis services
3. Connect GitHub repository
4. Set environment variables
5. Deploy

### AWS (Full Stack)
1. **RDS**: PostgreSQL database
2. **ElastiCache**: Redis
3. **ECS/Fargate**: Backend containers
4. **S3 + CloudFront**: Frontend static files
5. **Route 53**: DNS management

### DigitalOcean (Full Stack)
1. **Managed PostgreSQL**: Database
2. **Managed Redis**: Cache
3. **App Platform**: Backend deployment
4. **Spaces + CDN**: Frontend static files

## Database Migrations

### Development
```bash
cd backend
npx prisma migrate dev --name migration_name
```

### Production
```bash
cd backend
npx prisma migrate deploy
```

### Reset Database (Development Only)
```bash
cd backend
npx prisma migrate reset
```

## Monitoring & Logging

### Application Logs
```bash
# Docker
docker-compose logs -f backend

# PM2 (if using)
pm2 logs elevate-backend
```

### Database Monitoring
```bash
# Prisma Studio
cd backend
npx prisma studio
```

## Backup & Restore

### Database Backup
```bash
# PostgreSQL
pg_dump -U elevate -h localhost elevate_db > backup.sql

# Restore
psql -U elevate -h localhost elevate_db < backup.sql
```

### File Uploads Backup
```bash
# Backup uploads directory
tar -czf uploads-backup.tar.gz backend/uploads/

# Restore
tar -xzf uploads-backup.tar.gz
```

## SSL/TLS Configuration

### Using Let's Encrypt
```bash
# Install certbot
sudo apt-get install certbot

# Get certificate
sudo certbot certonly --standalone -d yourdomain.com

# Configure nginx
# See nginx.conf for SSL configuration
```

## Performance Optimization

### Frontend
- Enable gzip compression
- Use CDN for static assets
- Implement service worker caching
- Optimize images

### Backend
- Enable Redis caching
- Use connection pooling
- Implement rate limiting
- Enable compression middleware

## Security Checklist

- [ ] Change all default passwords
- [ ] Set strong JWT secrets
- [ ] Enable HTTPS
- [ ] Configure CORS properly
- [ ] Set up firewall rules
- [ ] Enable rate limiting
- [ ] Regular security updates
- [ ] Backup encryption
- [ ] Environment variable security

## Troubleshooting

### Backend won't start
```bash
# Check logs
docker-compose logs backend

# Verify database connection
cd backend
npx prisma db pull
```

### Database connection issues
```bash
# Test connection
psql -U elevate -h localhost -d elevate_db

# Check DATABASE_URL in .env
```

### Frontend build fails
```bash
# Clear cache
rm -rf node_modules dist
npm install
npm run build
```

## Support

For deployment support:
- Email: support@elevateforhumanity.org
- Documentation: https://docs.elevateforhumanity.org
- GitHub Issues: https://github.com/elevateforhumanity/ecosystem2/issues

---

**Last Updated:** January 2025
