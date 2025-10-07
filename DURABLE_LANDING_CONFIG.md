# Durable Landing Page Configuration

## Overview

Your **Durable.co** site will serve as the main landing page, with the full LMS platform hosted separately.

---

## Architecture

```
┌─────────────────────────────────────────┐
│  Durable.co Landing Page                │
│  https://elevateforhumanity.org         │
│  - Marketing content                     │
│  - Program information                   │
│  - Call-to-action buttons                │
│  - Links to LMS platform                 │
└─────────────────────────────────────────┘
                    │
                    ├─→ "Get Started" button
                    ├─→ "Login to LMS" button
                    └─→ "View Courses" button
                    │
                    ▼
┌─────────────────────────────────────────┐
│  Full LMS Platform                       │
│  https://lms.elevateforhumanity.org     │
│  OR                                      │
│  https://app.elevateforhumanity.org     │
│  - Complete backend                      │
│  - Course delivery                       │
│  - JRI Brain integration                 │
│  - Student dashboard                     │
│  - Admin panel                           │
└─────────────────────────────────────────┘
```

---

## Durable.co Setup

### 1. Domain Configuration

**Primary Domain:** `elevateforhumanity.org`
- Points to Durable.co
- Serves marketing/landing page
- SSL automatically handled by Durable

**LMS Subdomain:** `lms.elevateforhumanity.org` OR `app.elevateforhumanity.org`
- Points to your server/Cloudflare Pages
- Serves full LMS platform
- SSL via Cloudflare

### 2. DNS Records

Add these to your domain registrar (or Cloudflare):

```
# Main landing page (Durable)
@           A       [Durable IP - provided by Durable]
www         CNAME   [Durable domain - provided by Durable]

# LMS platform (Your server)
lms         A       [Your server IP]
# OR if using Cloudflare Pages:
lms         CNAME   [your-project].pages.dev

# API (if separate)
api         A       [Your server IP]
```

### 3. Durable Page Structure

**Homepage Sections:**
1. **Hero Section**
   - Headline: "Transform Lives Through Education"
   - Subheadline: "Workforce development programs that work"
   - CTA: "Get Started" → links to `https://lms.elevateforhumanity.org/register`

2. **Programs Section**
   - Job Ready Indy
   - WIOA Training
   - Career Pathways
   - Each with "Learn More" → links to LMS

3. **Success Stories**
   - Student testimonials
   - Impact metrics
   - CTA: "Join Us" → links to LMS

4. **Sister Sites**
   - Rise Forward Foundation
   - Elevate Healthcare
   - Workforce Development
   - Community Hub
   - Mentorship Network

5. **Footer**
   - Login link → `https://lms.elevateforhumanity.org/login`
   - Contact information
   - Social media links

---

## LMS Platform Configuration

### Environment Variables

```bash
# Domain Configuration
DOMAIN=elevateforhumanity.org
LANDING_PAGE_URL=https://elevateforhumanity.org
LMS_URL=https://lms.elevateforhumanity.org
API_URL=https://lms.elevateforhumanity.org/api

# OR if using app subdomain:
LMS_URL=https://app.elevateforhumanity.org
API_URL=https://app.elevateforhumanity.org/api

# CORS - Allow Durable landing page
ALLOWED_ORIGINS=https://elevateforhumanity.org,https://www.elevateforhumanity.org,https://lms.elevateforhumanity.org

# JRI Brain Configuration
SCORM_VERSION=2004
JRI_CONTENT_CONTROLLER_DOMAIN=cloud.scorm.com
JRI_EMPLOYINDY_EMAIL=jri@employindy.org

# Durable Integration
DURABLE_WEBHOOK_SECRET=your-webhook-secret-here
```

---

## Linking Durable to LMS

### Option 1: Direct Links (Recommended)

In your Durable page, add buttons/links:

```html
<!-- Get Started Button -->
<a href="https://lms.elevateforhumanity.org/register" 
   class="cta-button">
  Get Started
</a>

<!-- Login Button -->
<a href="https://lms.elevateforhumanity.org/login" 
   class="login-button">
  Login to LMS
</a>

<!-- Browse Courses -->
<a href="https://lms.elevateforhumanity.org/courses" 
   class="browse-button">
  View Courses
</a>

<!-- Job Ready Indy -->
<a href="https://lms.elevateforhumanity.org/programs/jri" 
   class="program-button">
  Job Ready Indy Program
</a>
```

### Option 2: Embedded Widget (Advanced)

Add an embedded course catalog widget to Durable:

```html
<!-- Add to Durable page -->
<div id="elevate-courses"></div>
<script src="https://lms.elevateforhumanity.org/embed/courses.js"></script>
<script>
  ElevateCourses.init({
    container: '#elevate-courses',
    limit: 6,
    showEnroll: true
  });
</script>
```

---

## Cloudflare Configuration

### 1. SSL/TLS Settings

- **SSL/TLS encryption mode:** Full (strict)
- **Always Use HTTPS:** On
- **Automatic HTTPS Rewrites:** On
- **Minimum TLS Version:** 1.2

### 2. Page Rules

```
# Redirect www to non-www (if desired)
www.elevateforhumanity.org/*
  → Forwarding URL (301)
  → https://elevateforhumanity.org/$1

# Cache LMS assets
lms.elevateforhumanity.org/assets/*
  → Cache Level: Cache Everything
  → Edge Cache TTL: 1 month

# Don't cache API
lms.elevateforhumanity.org/api/*
  → Cache Level: Bypass
```

### 3. Security Headers

Add these via Cloudflare Workers or Transform Rules:

```javascript
// For LMS subdomain only
if (request.url.includes('lms.elevateforhumanity.org')) {
  response.headers.set('X-Frame-Options', 'SAMEORIGIN');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
  
  // CSP for SCORM content
  response.headers.set('Content-Security-Policy', 
    "default-src 'self'; " +
    "frame-src 'self' https://cloud.scorm.com; " +
    "connect-src 'self' https://cloud.scorm.com; " +
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cloud.scorm.com; " +
    "style-src 'self' 'unsafe-inline';"
  );
}
```

---

## Gitpod Configuration (No Bloat)

### .gitpod.yml (Optimized)

```yaml
tasks:
  - name: Install Dependencies
    init: npm install
    command: npm run dev

ports:
  - port: 8012
    onOpen: notify
    visibility: public
    description: Frontend Dev Server
  - port: 3001
    onOpen: ignore
    visibility: private
    description: Backend API
  - port: 5432
    onOpen: ignore
    visibility: private
    description: PostgreSQL
  - port: 6379
    onOpen: ignore
    visibility: private
    description: Redis

vscode:
  extensions:
    - dbaeumer.vscode-eslint
    - esbenp.prettier-vscode
    - prisma.prisma

github:
  prebuilds:
    master: true
    branches: true
    pullRequests: true
```

### DevContainer (Minimal)

```json
{
  "name": "Elevate Platform",
  "dockerComposeFile": "../docker-compose.yml",
  "service": "app",
  "workspaceFolder": "/workspace",
  "features": {
    "ghcr.io/devcontainers/features/node:1": {
      "version": "20"
    }
  },
  "forwardPorts": [3001, 8012, 5432, 6379],
  "postCreateCommand": "npm install",
  "remoteUser": "node"
}
```

**No bloat - only essentials:**
- Node 20
- Port forwarding
- Auto npm install
- That's it!

---

## JRI Brain Integration

### 1. Request SCORM Packages from EmployIndy

**Email Template:**

```
To: jri@employindy.org
Subject: JRI SCORM Dispatch Packages - Elevate for Humanity

Hello JRI Team,

We're ready to integrate Job Ready Indy into our LMS platform.

Organization: Elevate for Humanity
LMS Platform: Custom (Node.js/React)
SCORM Standard: SCORM 2004 3rd Edition
Primary Domain: https://lms.elevateforhumanity.org

Please provision dispatch packages for all 8 courses:
1. Introduction to JRI
2. Mindsets
3. Self-Management
4. Learning Strategies
5. Social Skills
6. Workplace Skills
7. Launch A Career
8. Facilitation Training (STAFF-ONLY)

Content Controller domain to whitelist: lms.elevateforhumanity.org

Thank you,
[Your Name]
Elevate for Humanity
[Your Email]
```

### 2. Register SCORM Packages

Once you receive the packages:

```javascript
// backend/src/routes/jri.routes.js
const jriBrain = require('../../services/jri-brain');

// Register each course
jriBrain.registerScormPackage('JRI_INTRO', 
  'https://cloud.scorm.com/EngineWebServices/api/v2/...',
  {
    version: '2004',
    registrationId: 'reg-intro-123',
    launchUrl: 'https://cloud.scorm.com/ScormEngineInterface/...'
  }
);

// Repeat for all 8 courses
```

### 3. Create JRI Routes

```javascript
// GET /api/jri/catalog
router.get('/catalog', authenticate, async (req, res) => {
  const catalog = jriBrain.getCatalog(req.user.role);
  res.json({ courses: catalog });
});

// POST /api/jri/enroll
router.post('/enroll', authenticate, async (req, res) => {
  const { courseId } = req.body;
  const enrollment = jriBrain.enrollUser(req.user.id, courseId);
  res.json({ enrollment });
});

// POST /api/jri/launch
router.post('/launch', authenticate, async (req, res) => {
  const { courseId, enrollmentId } = req.body;
  const launchData = await jriBrain.launchScormContent(
    req.user.id, 
    courseId, 
    enrollmentId
  );
  res.json(launchData);
});

// SCORM API endpoint
router.all('/scorm/:sessionId', async (req, res) => {
  const { sessionId } = req.params;
  const { method, element, value } = req.body;
  
  const result = await jriBrain.handleScormAPI(
    sessionId, 
    method, 
    element, 
    value
  );
  
  res.json(result);
});
```

---

## Testing Checklist

### Durable Landing Page
- [ ] Domain points to Durable
- [ ] SSL certificate active
- [ ] All links point to correct LMS URLs
- [ ] Mobile responsive
- [ ] Fast load times

### LMS Platform
- [ ] Subdomain (lms/app) points to server
- [ ] SSL certificate active
- [ ] CORS allows Durable domain
- [ ] Login/register working
- [ ] Course catalog displays

### JRI Brain
- [ ] SCORM packages registered
- [ ] Content Controller domain whitelisted
- [ ] CSP headers configured
- [ ] Launch page loads SCORM content
- [ ] Completion tracking works
- [ ] Scores post to gradebook

### Cross-Domain
- [ ] Can navigate from Durable → LMS
- [ ] Session persists across domains
- [ ] No mixed content warnings
- [ ] No CORS errors in console

---

## Deployment Steps

### 1. Deploy Durable Landing Page
```bash
# Already done via Durable.co interface
# Just configure custom domain
```

### 2. Deploy LMS Platform
```bash
cd /workspaces/elevate-complete

# Build
npm run build

# Deploy to Cloudflare Pages
npx wrangler pages publish dist --project-name=elevate-lms

# OR deploy to your server
docker-compose up -d
```

### 3. Configure DNS
```bash
# Add DNS records as shown above
# Wait for propagation (5-30 minutes)
```

### 4. Test Everything
```bash
# Test landing page
curl -I https://elevateforhumanity.org

# Test LMS
curl -I https://lms.elevateforhumanity.org

# Test API
curl https://lms.elevateforhumanity.org/api/health
```

---

## Maintenance

### Updating Durable Content
- Edit via Durable.co dashboard
- Changes publish instantly
- No deployment needed

### Updating LMS Platform
```bash
git pull
npm install
npm run build
# Redeploy
```

### Updating JRI Content
- EmployIndy pushes updates to Content Controller
- No action needed on your end
- Content updates automatically

---

## Support Contacts

**Durable.co Support:**
- Email: support@durable.co
- Dashboard: https://durable.co/dashboard

**EmployIndy JRI Support:**
- Email: jri@employindy.org
- Phone: [Contact EmployIndy for number]

**Cloudflare Support:**
- Dashboard: https://dash.cloudflare.com
- Docs: https://developers.cloudflare.com

---

## Cost Breakdown

| Service | Monthly Cost | Purpose |
|---------|--------------|---------|
| Durable.co | $12-20 | Landing page hosting |
| Cloudflare Pages | $0-20 | LMS hosting (free tier available) |
| Cloudflare DNS | $0 | Domain management |
| Database (Supabase) | $0-25 | PostgreSQL (free tier available) |
| Redis (Upstash) | $0-10 | Caching (free tier available) |
| **TOTAL** | **$12-75/mo** | Complete platform |

---

## Summary

✅ **Durable** = Landing page (marketing)
✅ **LMS Platform** = Full application (courses, JRI, admin)
✅ **JRI Brain** = SCORM content integration
✅ **Cloudflare** = DNS, SSL, CDN
✅ **No Gitpod bloat** = Minimal, optimized config

**Result:** Professional, scalable platform with clear separation of concerns.
