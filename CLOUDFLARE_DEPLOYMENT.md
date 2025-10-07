# Cloudflare Pages Deployment Guide

## Quick Deploy to Cloudflare Pages

### Option 1: Automatic via GitHub (Recommended)

The repository is already configured for automatic deployment via GitHub Actions.

**Prerequisites:**
1. Cloudflare account with Pages enabled
2. GitHub repository secrets configured:
   - `CLOUDFLARE_API_TOKEN`
   - `CLOUDFLARE_ACCOUNT_ID`

**Deployment happens automatically on:**
- Push to `main` branch
- Push to `develop` branch

### Option 2: Manual Deploy via Cloudflare Dashboard

1. **Go to Cloudflare Dashboard**
   - Navigate to: https://dash.cloudflare.com/
   - Select your account
   - Go to "Workers & Pages" → "Pages"

2. **Create New Project**
   - Click "Create application"
   - Select "Connect to Git"
   - Choose repository: `elevateforhumanity/ecosystem2`
   - Branch: `main`

3. **Build Configuration**
   ```
   Build command: npm run build
   Build output directory: dist
   Root directory: /
   ```

4. **Environment Variables**
   Add these in Cloudflare Pages settings:
   ```
   VITE_SUPABASE_URL=https://cuxzzpsyufcewtmicszk.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN1eHp6cHN5dWZjZXd0bWljc3prIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgxNjEwNDcsImV4cCI6MjA3MzczNzA0N30.DyFtzoKha_tuhKiSIPoQlKonIpaoSYrlhzntCUvLUnA
   NODE_ENV=production
   ```

5. **Custom Domain Setup**
   - After deployment, go to "Custom domains"
   - Add subdomain: `app.elevateforhumanity.org` or `lms.elevateforhumanity.org`
   - Cloudflare will automatically configure DNS

### Option 3: Direct Upload via Wrangler CLI

```bash
# Install Wrangler
npm install -g wrangler

# Login to Cloudflare
npx wrangler login

# Deploy
npx wrangler pages deploy dist --project-name=elevate-lms
```

## Recommended Subdomain

Deploy to: **`app.elevateforhumanity.org`**

This gives you:
- Main site: `elevateforhumanity.org` (Durable.co marketing)
- Full app: `app.elevateforhumanity.org` (Cloudflare Pages)
- LMS: `app.elevateforhumanity.org/lms`

## Embed in Durable Pages

Once deployed to Cloudflare, you can embed in Durable pages:

### Option 1: Direct Link
```html
<a href="https://app.elevateforhumanity.org/lms" target="_blank">
  Access LMS
</a>
```

### Option 2: Iframe Embed
```html
<iframe 
  src="https://app.elevateforhumanity.org/lms" 
  width="100%" 
  height="800px" 
  frameborder="0"
  style="border: none; border-radius: 8px;"
></iframe>
```

### Option 3: Button with Redirect
```html
<button onclick="window.open('https://app.elevateforhumanity.org/lms', '_blank')" 
        style="padding: 12px 24px; background: #2563eb; color: white; border: none; border-radius: 8px; cursor: pointer;">
  Launch LMS
</button>
```

## URLs After Deployment

- **Homepage**: https://app.elevateforhumanity.org/
- **LMS Landing**: https://app.elevateforhumanity.org/lms
- **LMS Dashboard**: https://app.elevateforhumanity.org/lms/dashboard
- **Courses**: https://app.elevateforhumanity.org/lms/courses
- **Progress**: https://app.elevateforhumanity.org/lms/progress

## Verification

After deployment, test:
```bash
curl -I https://app.elevateforhumanity.org/
curl -I https://app.elevateforhumanity.org/lms
```

## Supabase Connection

The app is pre-configured to connect to:
- **URL**: https://cuxzzpsyufcewtmicszk.supabase.co
- **Database**: Already deployed with schema
- **Tables**: profiles, programs, courses, enrollments, etc.

No additional configuration needed - it will work automatically once deployed to Cloudflare Pages.
