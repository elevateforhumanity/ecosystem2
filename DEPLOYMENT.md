# Deployment Guide

## Overview
This document outlines the deployment process for the Elevate for Humanity platform.

## Environments

### Development
- **URL**: http://localhost:8012
- **Command**: `npm run dev`
- **Purpose**: Local development and testing

### Staging
- **URL**: https://staging.elevateforhumanity.org (configure as needed)
- **Branch**: `develop`
- **Purpose**: Pre-production testing and QA

### Production
- **URL**: https://elevateforhumanity.org
- **Branch**: `main`
- **Purpose**: Live production environment

## Prerequisites

1. Node.js 20.11.1 or higher
2. npm 10.0.0 or higher
3. Access to deployment environment

## Build Process

### Local Build
```bash
npm run build
```

This will:
1. Run Vite build process
2. Generate optimized production bundle in `dist/`
3. Create pages manifest in `public/catalog/pages.json`

### Build Output
- `dist/` - Production-ready static files
- `dist/assets/` - Optimized JS, CSS, and images
- `dist/index.html` - Entry point

## Deployment Steps

### Manual Deployment

#### 1. Build the Application
```bash
npm run build
```

#### 2. Test the Build Locally
```bash
npm run preview
```
Visit http://localhost:8080 to verify the build.

#### 3. Deploy to Server
```bash
# Example using rsync
rsync -avz --delete dist/ user@server:/var/www/html/

# Example using SCP
scp -r dist/* user@server:/var/www/html/
```

### Automated Deployment (CI/CD)

The project includes GitHub Actions workflows:

#### On Push to `develop`:
- Runs tests
- Builds application
- Deploys to staging environment

#### On Push to `main`:
- Runs tests
- Builds application
- Deploys to production environment

## Environment Variables

Create `.env` files for each environment:

### `.env.development`
```
VITE_API_URL=http://localhost:3001
VITE_ENV=development
```

### `.env.staging`
```
VITE_API_URL=https://api-staging.elevateforhumanity.org
VITE_ENV=staging
```

### `.env.production`
```
VITE_API_URL=https://api.elevateforhumanity.org
VITE_ENV=production
```

## Server Configuration

### Nginx Configuration
```nginx
server {
    listen 80;
    server_name elevateforhumanity.org;
    root /var/www/html;
    index index.html;

    # Enable gzip compression
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;

    # Cache static assets
    location /assets/ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # SPA fallback
    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

### Apache Configuration
```apache
<VirtualHost *:80>
    ServerName elevateforhumanity.org
    DocumentRoot /var/www/html

    <Directory /var/www/html>
        Options -Indexes +FollowSymLinks
        AllowOverride All
        Require all granted

        # SPA fallback
        RewriteEngine On
        RewriteBase /
        RewriteRule ^index\.html$ - [L]
        RewriteCond %{REQUEST_FILENAME} !-f
        RewriteCond %{REQUEST_FILENAME} !-d
        RewriteRule . /index.html [L]
    </Directory>

    # Enable compression
    <IfModule mod_deflate.c>
        AddOutputFilterByType DEFLATE text/html text/plain text/xml text/css application/javascript application/json
    </IfModule>

    # Cache static assets
    <IfModule mod_expires.c>
        ExpiresActive On
        ExpiresByType image/jpg "access plus 1 year"
        ExpiresByType image/jpeg "access plus 1 year"
        ExpiresByType image/gif "access plus 1 year"
        ExpiresByType image/png "access plus 1 year"
        ExpiresByType text/css "access plus 1 month"
        ExpiresByType application/javascript "access plus 1 month"
    </IfModule>
</VirtualHost>
```

## Post-Deployment Checklist

- [ ] Verify all routes are accessible
- [ ] Test protected routes (admin, instructor)
- [ ] Check navigation links
- [ ] Verify forms submit correctly
- [ ] Test on mobile devices
- [ ] Check browser console for errors
- [ ] Verify SSL certificate (production)
- [ ] Test page load performance
- [ ] Verify analytics tracking
- [ ] Check SEO meta tags

## Rollback Procedure

If issues are detected after deployment:

1. **Immediate Rollback**:
   ```bash
   # Restore previous version
   rsync -avz --delete backup/dist/ user@server:/var/www/html/
   ```

2. **Git Rollback**:
   ```bash
   git revert HEAD
   git push origin main
   ```

3. **Verify Rollback**:
   - Check application is functioning
   - Monitor error logs
   - Verify user reports

## Monitoring

### Health Checks
- Application uptime
- Response times
- Error rates
- Resource usage

### Logs
- Application logs: `/var/log/nginx/access.log`
- Error logs: `/var/log/nginx/error.log`
- Application errors: Browser console

## Support

For deployment issues:
- Email: devops@elevateforhumanity.org
- Slack: #deployments
- On-call: Check PagerDuty

## Version History

- v2.0.0 - Added 32 new pages, routing configuration, protected routes
- v1.0.0 - Initial release
