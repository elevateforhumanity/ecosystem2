# JRI File Requirements - What You'll Receive from EmployIndy

## 📦 What EmployIndy Will Send You

When you request the JRI dispatch packages from EmployIndy, you'll receive **8 ZIP files** (one per course):

---

## File Format

### SCORM Package Structure

Each course comes as a **ZIP file** containing:

```
JRI_Introduction_SCORM2004_v2024.01.15.zip
├── imsmanifest.xml          ← SCORM manifest (required)
├── adlcp_rootv1p2.xsd       ← SCORM schema files
├── ims_xml.xsd
├── imscp_rootv1p1p2.xsd
├── imsmd_rootv1p2p1.xsd
├── index.html               ← Launch file
├── scormdriver/             ← SCORM API wrapper
│   ├── api.js
│   └── scorm.js
├── content/                 ← Actual course content
│   ├── index.html
│   ├── lesson1.html
│   ├── lesson2.html
│   ├── assets/
│   │   ├── images/
│   │   ├── videos/
│   │   └── css/
│   └── data/
│       └── course_data.json
└── metadata/                ← Course metadata
    └── course_info.json
```

---

## 8 Files You'll Receive

| # | Course Name | File Name (Example) | Size (Est.) |
|---|-------------|---------------------|-------------|
| 1 | Introduction to JRI | `JRI_Introduction_SCORM2004_v2024.zip` | 50-100 MB |
| 2 | Mindsets | `JRI_Mindsets_SCORM2004_v2024.zip` | 100-150 MB |
| 3 | Self-Management | `JRI_SelfManagement_SCORM2004_v2024.zip` | 100-150 MB |
| 4 | Learning Strategies | `JRI_LearningStrategies_SCORM2004_v2024.zip` | 100-150 MB |
| 5 | Social Skills | `JRI_SocialSkills_SCORM2004_v2024.zip` | 100-150 MB |
| 6 | Workplace Skills | `JRI_WorkplaceSkills_SCORM2004_v2024.zip` | 150-200 MB |
| 7 | Launch A Career | `JRI_LaunchCareer_SCORM2004_v2024.zip` | 150-200 MB |
| 8 | Facilitation Training | `JRI_Facilitation_SCORM2004_v2024.zip` | 200-300 MB |

**Total Size:** ~1-1.5 GB for all 8 courses

---

## SCORM Version Options

EmployIndy can provide packages in two formats:

### Option 1: SCORM 2004 3rd Edition (RECOMMENDED) ✅

**File:** `JRI_[CourseName]_SCORM2004_v[date].zip`

**Advantages:**
- ✅ Better completion tracking
- ✅ More reliable pass/fail status
- ✅ Better error handling
- ✅ Supports modern LMS features
- ✅ More detailed reporting

**Use this if:** Your LMS supports SCORM 2004 (most modern LMS do)

### Option 2: SCORM 1.2 (Legacy)

**File:** `JRI_[CourseName]_SCORM12_v[date].zip`

**Advantages:**
- ✅ Universal compatibility (older LMS)
- ✅ Simpler structure

**Disadvantages:**
- ❌ Less detailed tracking
- ❌ Limited reporting
- ❌ Older standard

**Use this if:** Your LMS only supports SCORM 1.2

---

## Alternative: Content Controller Links (No Files)

Instead of ZIP files, EmployIndy might provide **Content Controller dispatch links**:

### What You'll Receive:

**Email with 8 links like this:**

```
Course: Introduction to JRI
Registration ID: reg-jri-intro-12345
Launch URL: https://cloud.scorm.com/ScormEngineInterface/defaultui/player/modern.html?configuration=...
API Endpoint: https://cloud.scorm.com/api/v2/registrations/reg-jri-intro-12345
```

### Advantages of Content Controller:
- ✅ **No file hosting needed** - EmployIndy hosts the content
- ✅ **Automatic updates** - They push updates, you get them instantly
- ✅ **Better performance** - Content served from CDN
- ✅ **No storage costs** - You don't store 1.5 GB of files
- ✅ **Easier maintenance** - No re-uploading when content changes

### How It Works:
1. EmployIndy hosts content on their Content Controller (Rustici SCORM Cloud)
2. They give you launch URLs
3. Your LMS embeds these URLs in an iframe
4. SCORM API calls go through your backend to Content Controller
5. Completion/scores sync back to your LMS

**This is the RECOMMENDED approach** ✅

---

## What You Need to Store

### If Using ZIP Files (Self-Hosted):

```
/your-lms/
├── scorm-packages/
│   ├── JRI_Introduction_SCORM2004_v2024.01.15.zip
│   ├── JRI_Mindsets_SCORM2004_v2024.01.15.zip
│   ├── JRI_SelfManagement_SCORM2004_v2024.01.15.zip
│   ├── JRI_LearningStrategies_SCORM2004_v2024.01.15.zip
│   ├── JRI_SocialSkills_SCORM2004_v2024.01.15.zip
│   ├── JRI_WorkplaceSkills_SCORM2004_v2024.01.15.zip
│   ├── JRI_LaunchCareer_SCORM2004_v2024.01.15.zip
│   └── JRI_Facilitation_SCORM2004_v2024.01.15.zip
└── scorm-content/              ← Extracted content
    ├── jri-intro/
    │   ├── imsmanifest.xml
    │   ├── index.html
    │   └── content/
    ├── jri-mindsets/
    └── ...
```

**Storage needed:** 1.5 GB (zipped) + 2-3 GB (extracted) = **~4-5 GB total**

### If Using Content Controller (Recommended):

```
/your-lms/
└── config/
    └── jri-courses.json        ← Just configuration
```

**File content:**
```json
{
  "courses": [
    {
      "id": "JRI_INTRO",
      "title": "Introduction to JRI",
      "registrationId": "reg-jri-intro-12345",
      "launchUrl": "https://cloud.scorm.com/ScormEngineInterface/...",
      "apiEndpoint": "https://cloud.scorm.com/api/v2/registrations/..."
    },
    {
      "id": "JRI_MINDSETS",
      "title": "Mindsets",
      "registrationId": "reg-jri-mindsets-67890",
      "launchUrl": "https://cloud.scorm.com/ScormEngineInterface/...",
      "apiEndpoint": "https://cloud.scorm.com/api/v2/registrations/..."
    }
    // ... 6 more courses
  ]
}
```

**Storage needed:** ~5 KB (just a config file) ✅

---

## How to Request from EmployIndy

### Email Template:

```
To: jri@employindy.org
CC: [your team]
Subject: JRI SCORM Package Request - Elevate for Humanity

Hello JRI Team,

We're ready to integrate Job Ready Indy into our LMS platform.

ORGANIZATION DETAILS:
- Organization: Elevate for Humanity
- LMS Platform: Custom (Node.js/React/Prisma)
- LMS URL: https://lms.elevateforhumanity.org

TECHNICAL REQUIREMENTS:
- SCORM Standard: SCORM 2004 3rd Edition (preferred)
- Delivery Method: Content Controller dispatch links (preferred)
  OR
  Delivery Method: ZIP file downloads (if dispatch not available)

COURSES NEEDED:
1. Introduction to JRI
2. Mindsets
3. Self-Management
4. Learning Strategies
5. Social Skills
6. Workplace Skills
7. Launch A Career
8. Facilitation Training (STAFF-ONLY)

WHITELIST DOMAINS:
- https://lms.elevateforhumanity.org
- https://elevateforhumanity.org

Please provide:
- Launch URLs for each course (if using Content Controller)
- Registration IDs
- API credentials
- Any required CSP/CORS domains to whitelist

OR

- Download links for SCORM ZIP packages
- Installation instructions
- Version numbers

Thank you,
[Your Name]
[Your Title]
Elevate for Humanity
[Your Email]
[Your Phone]
```

---

## What Happens After You Request

### Timeline:

| Day | What Happens |
|-----|--------------|
| **Day 0** | You send request email |
| **Day 1-2** | EmployIndy confirms receipt |
| **Day 3-5** | EmployIndy provisions packages |
| **Day 5-7** | You receive email with links/files |
| **Day 7-10** | You integrate into LMS |
| **Day 10-14** | Testing & QA |
| **Day 14+** | Go live |

### What You'll Receive:

**Option A: Content Controller (Preferred)**
- Email with 8 launch URLs
- Registration IDs
- API credentials
- Domain whitelist confirmation
- Technical contact for support

**Option B: ZIP Files**
- Email with download links (or Dropbox/Google Drive)
- 8 ZIP files (1-1.5 GB total)
- Installation guide
- Version numbers
- Technical contact for support

---

## File Handling in Your LMS

### If Using Content Controller (Recommended):

**1. Save configuration:**
```javascript
// backend/src/config/jri-courses.js
module.exports = {
  courses: [
    {
      id: 'JRI_INTRO',
      title: 'Introduction to JRI',
      registrationId: 'reg-jri-intro-12345',
      launchUrl: 'https://cloud.scorm.com/ScormEngineInterface/defaultui/player/modern.html?configuration=...',
      apiEndpoint: 'https://cloud.scorm.com/api/v2/registrations/reg-jri-intro-12345',
      contentControllerDomain: 'cloud.scorm.com'
    }
    // ... 7 more
  ]
};
```

**2. Register in JRI Brain:**
```javascript
const jriBrain = require('./services/jri-brain');
const jriCourses = require('./config/jri-courses');

jriCourses.courses.forEach(course => {
  jriBrain.registerScormPackage(course.id, course.launchUrl, {
    version: '2004',
    registrationId: course.registrationId,
    launchUrl: course.launchUrl
  });
});
```

**3. Create launch page:**
```html
<!-- frontend/src/pages/JRILaunch.jsx -->
<iframe 
  src={launchUrl}
  width="100%"
  height="800px"
  frameborder="0"
  allow="fullscreen"
  sandbox="allow-scripts allow-same-origin allow-forms"
></iframe>
```

**Storage:** ~5 KB config file ✅

---

### If Using ZIP Files (Self-Hosted):

**1. Download and extract:**
```bash
mkdir -p /var/www/scorm-content
cd /var/www/scorm-content

# Extract each ZIP
unzip JRI_Introduction_SCORM2004_v2024.zip -d jri-intro
unzip JRI_Mindsets_SCORM2004_v2024.zip -d jri-mindsets
# ... repeat for all 8
```

**2. Configure web server:**
```nginx
# nginx.conf
location /scorm/ {
    alias /var/www/scorm-content/;
    add_header Access-Control-Allow-Origin *;
    add_header X-Frame-Options SAMEORIGIN;
}
```

**3. Register in JRI Brain:**
```javascript
jriBrain.registerScormPackage('JRI_INTRO', 
  'https://lms.elevateforhumanity.org/scorm/jri-intro/index.html',
  { version: '2004' }
);
```

**Storage:** 4-5 GB ❌ (not recommended)

---

## File Security

### If Self-Hosting:

**Protect SCORM files:**
```javascript
// backend/src/middleware/scorm-auth.js
const authenticateScorm = async (req, res, next) => {
  const token = req.query.token;
  
  if (!token) {
    return res.status(403).json({ error: 'Access denied' });
  }
  
  // Verify token
  const session = await verifyScormToken(token);
  if (!session) {
    return res.status(403).json({ error: 'Invalid token' });
  }
  
  next();
};

// Apply to SCORM routes
app.use('/scorm/*', authenticateScorm);
```

### If Using Content Controller:

**No security needed** - EmployIndy handles it ✅

---

## Backup Strategy

### Content Controller (Recommended):
- ✅ **No backups needed** - EmployIndy maintains backups
- ✅ **Disaster recovery** - Content Controller has redundancy
- ✅ **Version control** - EmployIndy manages versions

### Self-Hosted:
- ❌ **You must backup** - 4-5 GB to backup regularly
- ❌ **You manage versions** - Keep old ZIPs when updating
- ❌ **You handle recovery** - Restore from backups if server fails

---

## Recommended Approach

### ✅ Use Content Controller Dispatch Links

**Why:**
1. **No file storage** - Save 4-5 GB
2. **No file hosting** - EmployIndy hosts
3. **Automatic updates** - They push, you get
4. **Better performance** - CDN delivery
5. **Less maintenance** - No re-uploading
6. **Built-in security** - They handle it
7. **Better reliability** - Enterprise infrastructure

**Request this in your email to EmployIndy:**
```
Delivery Method: Content Controller dispatch links (preferred)
```

---

## Summary

### What You'll Get:

**Option 1: Content Controller (RECOMMENDED)** ✅
- 📧 Email with 8 launch URLs
- 🔑 Registration IDs and API credentials
- 📝 5 KB config file to store
- 💾 0 GB storage needed
- ⚡ Instant updates from EmployIndy

**Option 2: ZIP Files**
- 📦 8 ZIP files (1-1.5 GB)
- 📂 Extract to 2-3 GB
- 💾 4-5 GB total storage needed
- 🔄 Manual updates when content changes
- 🛠️ You host and maintain

### What You Need to Do:

1. **Send request email** to jri@employindy.org
2. **Specify:** SCORM 2004 + Content Controller dispatch
3. **Wait:** 5-7 days for provisioning
4. **Receive:** Launch URLs and credentials
5. **Configure:** Add to jri-brain.js
6. **Test:** Launch one course
7. **Deploy:** Enable all 8 courses

### Storage Requirements:

- **Content Controller:** ~5 KB ✅
- **Self-Hosted:** ~4-5 GB ❌

### Recommendation:

**Use Content Controller dispatch links** - it's easier, faster, and better in every way.

---

## Questions?

**About file format:** Ask EmployIndy (jri@employindy.org)
**About integration:** Check `services/jri-brain.js`
**About SCORM:** Read `DURABLE_LANDING_CONFIG.md`
