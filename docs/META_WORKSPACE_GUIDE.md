# Elevate for Humanity - Meta Workspace Guide

## 🎯 Overview

This meta-workspace unifies all Elevate for Humanity repositories into a single development environment. It automatically clones, links, and manages multiple repos as if they were a monorepo.

## 📁 Repository Structure

```
elevate-ecosystem-meta/
├── apps/
│   ├── lms/              # Learning Management System
│   ├── marketing/        # Public-facing website
│   └── admin/            # Admin dashboard
├── packages/
│   └── shared/           # Shared components, utils, types
├── tools/
│   └── sitemap/          # SEO sitemap generator
├── scripts/
│   ├── analyze-structure.js       # Analyze repo structures
│   ├── find-duplicates.js         # Find duplicate files
│   ├── organize-repos.js          # Create deduplication plan
│   └── execute-deduplication.js   # Execute deduplication
├── .gitpod.yml           # Gitpod workspace configuration
├── pnpm-workspace.yaml   # pnpm workspace configuration
├── turbo.json            # Turborepo configuration
└── package.json          # Meta workspace package.json
```

## 🚀 Getting Started

### 1. Open in Gitpod

Click the Gitpod button or open:
```
https://gitpod.io/#https://github.com/elevateforhumanity/Elevate-sitemap
```

The workspace will automatically:
- Clone all 5 repositories
- Install dependencies
- Analyze the structure
- Set up pnpm workspace linking

### 2. Analyze Your Repositories

```bash
# Analyze structure of all repos
pnpm analyze

# Find duplicate files
pnpm dedupe

# Review the reports
cat STRUCTURE_ANALYSIS.json
cat DUPLICATES_REPORT.json
```

### 3. Organize and Deduplicate

```bash
# Create deduplication plan
pnpm organize

# Review the plan
cat DEDUPLICATION_PLAN.json

# Execute deduplication (after review!)
node scripts/execute-deduplication.js
```

### 4. Start Development

```bash
# Start all applications in parallel
pnpm dev

# Build all applications
pnpm build

# Lint all code
pnpm lint
```

## 📊 Repository Purposes

### apps/lms - Learning Management System
**Purpose:** Core LMS platform for students and instructors

**Should contain:**
- Course management
- Student dashboard
- Progress tracking
- Supabase integration
- Authentication

**Port:** 3000

### apps/marketing - Marketing Website
**Purpose:** Public-facing website and landing pages

**Should contain:**
- Homepage
- Program pages
- Blog
- Contact forms
- SEO optimization

**Port:** 5173

### apps/admin - Admin Dashboard
**Purpose:** Administrative tools and analytics

**Should contain:**
- User management
- Analytics dashboard
- Content management
- Reporting tools

**Port:** 3001

### packages/shared - Shared Packages
**Purpose:** Shared code used across all apps

**Should contain:**
- UI components (buttons, forms, modals)
- Utility functions
- React hooks
- TypeScript types
- API clients
- Configuration

**Usage:**
```typescript
import { Button, useAuth } from '@elevate/shared';
import { formatDate } from '@elevate/shared/utils';
```

### tools/sitemap - Sitemap Generator
**Purpose:** SEO sitemap automation

**Should contain:**
- Sitemap generation scripts
- GitHub Actions workflows
- Validation tools

## 🔧 Deduplication Strategy

### What Gets Moved to Shared Package

1. **Components** → `packages/shared/src/components/`
   - Buttons, inputs, modals, cards
   - Layout components
   - Navigation components

2. **Utils** → `packages/shared/src/utils/`
   - Date formatting
   - String manipulation
   - Validation functions

3. **Hooks** → `packages/shared/src/hooks/`
   - useAuth, useUser
   - useLocalStorage
   - Custom React hooks

4. **Types** → `packages/shared/src/types/`
   - TypeScript interfaces
   - Type definitions
   - API response types

5. **Lib** → `packages/shared/src/lib/`
   - API clients
   - Supabase client
   - Third-party integrations

6. **Config** → `packages/shared/src/config/`
   - Constants
   - Environment configs
   - Feature flags

### What Stays in Individual Repos

- **App-specific pages/routes**
- **App-specific business logic**
- **App-specific API endpoints**
- **App-specific styles (unless truly shared)**
- **Build configurations (vite.config, next.config)**

## 📝 Workflow

### Daily Development

```bash
# 1. Open Gitpod workspace
# 2. Pull latest changes
cd apps/lms && git pull && cd ../..
cd apps/marketing && git pull && cd ../..
cd apps/admin && git pull && cd ../..

# 3. Start all apps
pnpm dev

# 4. Make changes in any repo
# 5. Test locally
# 6. Commit to individual repos
cd apps/lms
git add .
git commit -m "feat: add new feature"
git push
```

### Adding Shared Code

```bash
# 1. Create component in shared package
cd packages/shared/src/components
# Create your component

# 2. Export from index
# Add to components/index.ts

# 3. Use in apps
# Import from '@elevate/shared'

# 4. Test in consuming apps
pnpm dev
```

### Handling Duplicates

```bash
# 1. Find duplicates
pnpm dedupe

# 2. Review report
cat DUPLICATES_REPORT.json

# 3. Create plan
pnpm organize

# 4. Review plan carefully
cat DEDUPLICATION_PLAN.json

# 5. Execute (with backup!)
node scripts/execute-deduplication.js

# 6. Update imports in apps
# Change: import { Button } from '../components/Button'
# To: import { Button } from '@elevate/shared'

# 7. Test everything
pnpm dev
pnpm build
```

## 🔍 Analysis Reports

### STRUCTURE_ANALYSIS.json
- Package.json details
- Dependencies
- Framework detection
- Directory structure
- TypeScript/Tailwind/Supabase usage

### DUPLICATES_REPORT.json
- Exact duplicates (same content)
- Name duplicates (same name, different content)
- File locations
- Deduplication recommendations

### DEDUPLICATION_PLAN.json
- Files to move to shared package
- Files to delete
- Target locations
- Step-by-step instructions

## ⚠️ Important Notes

### Before Deduplication

1. **Backup everything** - commit all changes
2. **Review the plan** - don't blindly execute
3. **Test after changes** - ensure nothing breaks
4. **Update imports** - change to use @elevate/shared

### Incomplete Features

- **DO NOT DELETE** unfinished code
- **COMPLETE** partial implementations
- **CONSOLIDATE** best versions from multiple repos
- **DOCUMENT** work-in-progress features

### Git Workflow

Each repo maintains its own git history:
- Commit to individual repos, not the meta workspace
- Push changes to their respective remotes
- The meta workspace is just for development

## 🛠️ Troubleshooting

### Repos Not Cloning

```bash
# Check .gitpod.yml for correct URLs
# Manually clone if needed
git clone https://github.com/elevateforhumanity/new-ecosystem apps/lms
```

### Dependencies Not Installing

```bash
# Clear cache and reinstall
rm -rf node_modules
rm pnpm-lock.yaml
pnpm install
```

### Port Conflicts

```bash
# Check .gitpod.yml ports section
# Update port numbers if needed
# Restart workspace
```

### Import Errors After Deduplication

```bash
# Ensure shared package has index files
cd packages/shared/src
ls -la */index.ts

# Rebuild
pnpm build
```

## 📚 Additional Resources

- [Turborepo Docs](https://turbo.build/repo/docs)
- [pnpm Workspaces](https://pnpm.io/workspaces)
- [Gitpod Configuration](https://www.gitpod.io/docs/configure)

## 🤝 Contributing

1. Make changes in the appropriate repository
2. Test in the meta workspace
3. Commit to the individual repo
4. Push to GitHub
5. Create PR in the individual repo

---

**Questions?** Open an issue in the respective repository or contact the team.
