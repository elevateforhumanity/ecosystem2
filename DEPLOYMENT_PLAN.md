# Complete Deployment Plan - Elevate for Humanity Platform

## Overview
Building out all 88 pages + integrating external services for enterprise-grade functionality.

---

## Phase 1: External Service Integration

### 1. Video Infrastructure (Daily.co)
**Cost:** $100-300/month based on usage
**What it provides:**
- HD video conferencing for `/meet` and `/video-meeting`
- Screen sharing
- Recording capabilities
- Up to 100 participants per room

**Integration Steps:**
1. Sign up at daily.co
2. Get API key
3. Add to environment variables: `VITE_DAILY_API_KEY`
4. Update VideoMeeting.jsx to use Daily.co SDK
5. Add Daily.co React SDK: `npm install @daily-co/daily-react`

**Files to update:**
- `src/pages/VideoMeeting.jsx` - Replace placeholder with Daily.co integration
- `src/config/daily.js` - Daily.co configuration
- `.env.example` - Add VITE_DAILY_API_KEY

---

### 2. AI Processing (OpenAI API)
**Cost:** $50-200/month based on usage
**What it provides:**
- AI Tutor functionality
- NotebookLM AI features
- Elevate Brain knowledge assistant
- Content generation

**Integration Steps:**
1. Sign up at platform.openai.com
2. Get API key
3. Add to environment variables: `VITE_OPENAI_API_KEY`
4. Create backend API route to proxy OpenAI calls (security)
5. Add OpenAI SDK: `npm install openai`

**Files to update:**
- `src/pages/AITutor.jsx` - Connect to OpenAI API
- `src/pages/NotebookLM.jsx` - Add AI note-taking features
- `src/pages/ElevateBrain.jsx` - Connect AI assistant
- `src/services/openai.js` - OpenAI service wrapper
- `.env.example` - Add VITE_OPENAI_API_KEY

---

### 3. File Storage (Cloudflare R2)
**Cost:** $5-20/month
**What it provides:**
- Unlimited file uploads for `/drive` and `/file-manager`
- S3-compatible API
- Global CDN delivery
- Cheaper than AWS S3

**Integration Steps:**
1. Sign up at cloudflare.com
2. Create R2 bucket
3. Get access credentials
4. Add to environment variables: `VITE_R2_*`
5. Add AWS SDK (R2 is S3-compatible): `npm install @aws-sdk/client-s3`

**Files to update:**
- `src/pages/FileManager.jsx` - Connect to R2 storage
- `src/services/storage.js` - R2 storage service
- `.env.example` - Add R2 credentials

---

## Phase 2: Build Out 37 Minimal Pages

### Priority 1: User-Facing Pages (Build First)

1. **Account.jsx** - User account management
2. **Profile.jsx** - User profile editing
3. **Settings.jsx** - User preferences
4. **Login.jsx** - Authentication page
5. **Partners.jsx** - Partner organizations
6. **Support.jsx** - Help & support center
7. **StudentHandbook.jsx** - Student resources
8. **Certificates.jsx** - Certificate downloads
9. **Course.jsx** - Course player/viewer
10. **InstructorEdit.jsx** - Edit course interface
11. **InstructorNew.jsx** - Create new course

### Priority 2: Marketing/Legal Pages

12. **PrivacyPolicy.jsx** - Privacy policy
13. **TermsOfService.jsx** - Terms of service
14. **RefundPolicy.jsx** - Refund policy
15. **ThankYou.jsx** - Thank you page
16. **NotFound.jsx** - 404 page

### Priority 3: Admin/Internal Tools

17. **AdminDashboard.jsx** - Admin overview
18. **UserManagement.jsx** - Manage users
19. **Notifications.jsx** - Notification center
20. **AccessibilitySettings.jsx** - Accessibility controls
21. **Branding.jsx** - Brand management

### Priority 4: Integration/Utility Pages

22. **Forms.jsx** - Form builder
23. **Groups.jsx** - Group management
24. **Sites.jsx** - Multi-site management
25. **Vids.jsx** - Video library
26. **Integrations.jsx** - Third-party integrations
27. **MobileApp.jsx** - Mobile app info
28. **Ecommerce.jsx** - E-commerce features

### Priority 5: Verification/SEO Pages

29. **GoogleSiteVerification.jsx** - Google verification
30. **BingSiteVerification.jsx** - Bing verification
31. **GoogleAnalyticsSetup.jsx** - Analytics setup

### Priority 6: Placeholder/Future Pages

32. **Hub.jsx** - Central hub
33. **Pay.jsx** - Payment processing
34. **DonatePage.jsx** - Donation page (duplicate of Donate)
35. **SomePage.jsx** - Generic page
36. **CloneLanding.jsx** - Landing page clone
37. **Assignment.jsx** - Assignment viewer

---

## Phase 3: Railway Deployment

### Prerequisites
```bash
npm install -g @railway/cli
```

### Environment Variables Needed
```env
# Database
DATABASE_URL=postgresql://...

# Supabase
VITE_SUPABASE_URL=https://...
VITE_SUPABASE_ANON_KEY=...

# Daily.co (Video)
VITE_DAILY_API_KEY=...

# OpenAI (AI)
VITE_OPENAI_API_KEY=...

# Cloudflare R2 (Storage)
VITE_R2_ACCOUNT_ID=...
VITE_R2_ACCESS_KEY_ID=...
VITE_R2_SECRET_ACCESS_KEY=...
VITE_R2_BUCKET_NAME=...

# App Config
VITE_APP_URL=https://app.elevateforhumanity.org
NODE_ENV=production
```

### Deployment Steps
```bash
# 1. Login to Railway
railway login

# 2. Initialize project
railway init

# 3. Add PostgreSQL database
railway add --database postgresql

# 4. Set environment variables
railway variables set VITE_SUPABASE_URL=...
railway variables set VITE_SUPABASE_ANON_KEY=...
# ... (set all variables)

# 5. Deploy
railway up

# 6. Get deployment URL
railway domain
```

---

## Phase 4: Framer Integration (Option A)

### 1. Manifest is Ready
- Already built: `/public/catalog/pages.json`
- Auto-updates on every build
- Categorizes all 88 pages

### 2. Framer Setup
1. Create Framer account
2. New project with your brand colors:
   - Primary Blue: #012A4A
   - Primary Red: #C1121F
   - Accent Orange: #F25C05
   - White: #FFFFFF
   - Dark Text: #1F2937

3. Add Remote Data Source:
   - URL: `https://app.elevateforhumanity.org/catalog/pages.json`
   - Path: `pages[*]`
   - Map fields: title, path, category, image, excerpt

4. Build Components:
   - **Mega Menu** - Reads categories, displays organized navigation
   - **Programs Grid** - Filters category="programs"
   - **Productivity Suite Grid** - Filters category="productivity"
   - **Portals Grid** - Filters category="*-portal"
   - **All Pages Directory** - Lists everything

5. Create Pages:
   - Homepage with hero + feature grids
   - Programs page (filtered grid)
   - Productivity page (filtered grid)
   - Portals page (filtered grid)
   - About, Contact (static content)

---

## Phase 5: DNS Configuration

### Cloudflare DNS Records
```
Type    Name     Target                              Proxy
CNAME   www      [framer-target].framer.app          Yes
CNAME   app      [railway-target].railway.app        Yes
CNAME   portal   [durable-target].durable.co         Yes
```

---

## Cost Summary

### Monthly Costs
- **Railway**: $50-100 (app + database)
- **Cloudflare R2**: $5-20 (file storage)
- **Daily.co**: $100-300 (video meetings, usage-based)
- **OpenAI**: $50-200 (AI features, usage-based)
- **Framer**: $15 (site plan)
- **Cloudflare**: Free (DNS + CDN)
- **Domain**: $12/year (~$1/month)

**Total: $221-636/month**

### One-Time Costs
- Development time (already invested)
- Initial setup (included above)

---

## Timeline

### Week 1: External Services
- Day 1-2: Set up Daily.co, OpenAI, Cloudflare R2
- Day 3-4: Integrate video, AI, storage into existing pages
- Day 5: Test all integrations

### Week 2: Build Pages (Priority 1-2)
- Day 1-2: User-facing pages (Account, Profile, Settings, Login)
- Day 3-4: Marketing pages (Partners, Support, Handbook)
- Day 5: Course/Instructor pages

### Week 3: Build Pages (Priority 3-5)
- Day 1-2: Admin tools
- Day 3-4: Integration/utility pages
- Day 5: Verification/SEO pages

### Week 4: Deploy & Polish
- Day 1-2: Railway deployment
- Day 3-4: Framer site build
- Day 5: DNS configuration, go live

---

## Success Metrics

### Technical
- ✅ All 88 pages load without errors
- ✅ Video meetings work (Daily.co)
- ✅ AI features respond (OpenAI)
- ✅ File uploads work (R2)
- ✅ Manifest auto-updates
- ✅ Framer site syncs automatically

### Business
- ✅ Students can enroll in programs
- ✅ Instructors can create courses
- ✅ Admin can manage users
- ✅ Video meetings support classes
- ✅ AI tutoring assists students
- ✅ Files are stored securely

---

## Next Steps

1. **Approve this plan** - Confirm you want all 88 pages + external services
2. **Set up accounts** - Daily.co, OpenAI, Cloudflare R2
3. **Start building** - I'll build pages in priority order
4. **Deploy** - Railway + Framer + DNS
5. **Go live** - Launch complete platform

**Ready to start? Say "yes" and I'll begin with Priority 1 pages.**
