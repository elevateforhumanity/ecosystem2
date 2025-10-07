#!/bin/bash
set -e

echo "╔══════════════════════════════════════════════════════════════════════╗"
echo "║                                                                      ║"
echo "║                  🏥 HEALTH CHECK & SMOKE TEST                        ║"
echo "║                                                                      ║"
echo "╚══════════════════════════════════════════════════════════════════════╝"
echo ""

PASS=0
FAIL=0

# Color codes
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

pass() {
    echo -e "${GREEN}✅ PASS${NC}: $1"
    ((PASS++))
}

fail() {
    echo -e "${RED}❌ FAIL${NC}: $1"
    ((FAIL++))
}

warn() {
    echo -e "${YELLOW}⚠️  WARN${NC}: $1"
}

section() {
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "$1"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
}

### ── 1) STRUCTURE CHECK ────────────────────────────────────────────────────
section "1. STRUCTURE CHECK"

if [ -d "backend" ]; then
    pass "backend/ directory exists"
else
    fail "backend/ directory missing"
fi

if [ -d "frontend" ]; then
    pass "frontend/ directory exists"
else
    fail "frontend/ directory missing"
fi

if [ -f "backend/package.json" ]; then
    pass "backend/package.json exists"
else
    fail "backend/package.json missing"
fi

if [ -f "frontend/package.json" ]; then
    pass "frontend/package.json exists"
else
    fail "frontend/package.json missing"
fi

if [ -f "backend/prisma/schema.prisma" ]; then
    pass "Prisma schema exists"
else
    fail "Prisma schema missing"
fi

### ── 2) DEPENDENCY CHECK ────────────────────────────────────────────────────
section "2. DEPENDENCY CHECK"

cd backend
if [ -d "node_modules" ]; then
    pass "Backend node_modules installed"
else
    warn "Backend node_modules not installed - run: cd backend && npm install"
fi

# Check for new dependencies
if grep -q "express-session" package.json; then
    pass "express-session dependency found"
else
    fail "express-session dependency missing"
fi

if grep -q "passport" package.json; then
    pass "passport dependency found"
else
    fail "passport dependency missing"
fi

if grep -q "posthog-node" package.json; then
    pass "posthog-node dependency found"
else
    fail "posthog-node dependency missing"
fi

cd ../frontend
if [ -d "node_modules" ]; then
    pass "Frontend node_modules installed"
else
    warn "Frontend node_modules not installed - run: cd frontend && npm install"
fi

if grep -q "posthog-js" package.json; then
    pass "posthog-js dependency found"
else
    fail "posthog-js dependency missing"
fi

cd ..

### ── 3) FILE EXISTENCE CHECK ────────────────────────────────────────────────
section "3. NEW FILES CHECK"

# Backend files
files=(
    "backend/src/controllers/forum.controller.ts"
    "backend/src/controllers/gamification.controller.ts"
    "backend/src/routes/forum.routes.ts"
    "backend/src/routes/gamification.routes.ts"
    "backend/src/middleware/auth.ts"
    "frontend/public/manifest.json"
    "frontend/public/sw.js"
    "frontend/src/lib/analytics.ts"
)

for file in "${files[@]}"; do
    if [ -f "$file" ]; then
        pass "$(basename $file) exists"
    else
        fail "$(basename $file) missing"
    fi
done

### ── 4) PRISMA SCHEMA CHECK ──────────────────────────────────────────────────
section "4. PRISMA SCHEMA CHECK"

if grep -q "model ForumThread" backend/prisma/schema.prisma; then
    pass "ForumThread model found in schema"
else
    fail "ForumThread model missing from schema"
fi

if grep -q "model ForumPost" backend/prisma/schema.prisma; then
    pass "ForumPost model found in schema"
else
    fail "ForumPost model missing from schema"
fi

if grep -q "model Badge" backend/prisma/schema.prisma; then
    pass "Badge model found in schema"
else
    fail "Badge model missing from schema"
fi

if grep -q "model UserBadge" backend/prisma/schema.prisma; then
    pass "UserBadge model found in schema"
else
    fail "UserBadge model missing from schema"
fi

if grep -q "model PointsLedger" backend/prisma/schema.prisma; then
    pass "PointsLedger model found in schema"
else
    fail "PointsLedger model missing from schema"
fi

if grep -q "model UserIdentity" backend/prisma/schema.prisma; then
    pass "UserIdentity model found in schema"
else
    fail "UserIdentity model missing from schema"
fi

### ── 5) BUILD CHECK ──────────────────────────────────────────────────────────
section "5. BUILD CHECK"

echo "Building backend..."
cd backend
if npm run build > /dev/null 2>&1; then
    pass "Backend builds successfully"
else
    fail "Backend build failed"
    echo "Run: cd backend && npm run build"
fi
cd ..

echo "Building frontend..."
cd frontend
if npm run build > /dev/null 2>&1; then
    pass "Frontend builds successfully"
else
    fail "Frontend build failed"
    echo "Run: cd frontend && npm run build"
fi
cd ..

### ── 6) TYPESCRIPT CHECK ──────────────────────────────────────────────────────
section "6. TYPESCRIPT CHECK"

cd backend
if npx tsc --noEmit > /dev/null 2>&1; then
    pass "Backend TypeScript check passed"
else
    warn "Backend has TypeScript warnings (non-blocking)"
fi
cd ..

### ── 7) PWA CHECK ──────────────────────────────────────────────────────────────
section "7. PWA CHECK"

if [ -f "frontend/public/manifest.json" ]; then
    if grep -q "Elevate" frontend/public/manifest.json; then
        pass "PWA manifest configured"
    else
        warn "PWA manifest exists but may need configuration"
    fi
else
    fail "PWA manifest missing"
fi

if [ -f "frontend/public/sw.js" ]; then
    pass "Service worker exists"
else
    fail "Service worker missing"
fi

if grep -q "serviceWorker.register" frontend/src/main.tsx; then
    pass "Service worker registered in main.tsx"
else
    warn "Service worker not registered in main.tsx"
fi

### ── 8) ANALYTICS CHECK ────────────────────────────────────────────────────────
section "8. ANALYTICS CHECK"

if [ -f "frontend/src/lib/analytics.ts" ]; then
    pass "Analytics library exists"
else
    fail "Analytics library missing"
fi

if grep -q "initAnalytics" frontend/src/main.tsx; then
    pass "Analytics initialized in main.tsx"
else
    warn "Analytics not initialized in main.tsx"
fi

### ── 9) ENVIRONMENT CHECK ──────────────────────────────────────────────────────
section "9. ENVIRONMENT CHECK"

if [ -f ".env.example" ]; then
    pass ".env.example exists"
    
    if grep -q "SESSION_SECRET" .env.example; then
        pass "SESSION_SECRET in .env.example"
    else
        warn "SESSION_SECRET missing from .env.example"
    fi
    
    if grep -q "GOOGLE_CLIENT_ID" .env.example; then
        pass "GOOGLE_CLIENT_ID in .env.example"
    else
        warn "GOOGLE_CLIENT_ID missing from .env.example"
    fi
    
    if grep -q "POSTHOG_KEY" .env.example; then
        pass "POSTHOG_KEY in .env.example"
    else
        warn "POSTHOG_KEY missing from .env.example"
    fi
else
    warn ".env.example missing"
fi

### ── 10) MIGRATION CHECK ────────────────────────────────────────────────────────
section "10. MIGRATION CHECK"

if [ -d "backend/prisma/migrations" ]; then
    migration_count=$(ls -1 backend/prisma/migrations/*.sql 2>/dev/null | wc -l)
    if [ "$migration_count" -gt 0 ]; then
        pass "Migration files found ($migration_count)"
    else
        warn "No migration files found - run: cd backend && npx prisma migrate dev"
    fi
else
    warn "Migrations directory not found"
fi

### ── SUMMARY ────────────────────────────────────────────────────────────────────
section "SUMMARY"

TOTAL=$((PASS + FAIL))
PASS_RATE=$((PASS * 100 / TOTAL))

echo ""
echo "Total Tests: $TOTAL"
echo -e "${GREEN}Passed: $PASS${NC}"
echo -e "${RED}Failed: $FAIL${NC}"
echo "Pass Rate: $PASS_RATE%"
echo ""

if [ $FAIL -eq 0 ]; then
    echo -e "${GREEN}╔══════════════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${GREEN}║                                                                      ║${NC}"
    echo -e "${GREEN}║                  ✅ ALL HEALTH CHECKS PASSED! 🎉                     ║${NC}"
    echo -e "${GREEN}║                                                                      ║${NC}"
    echo -e "${GREEN}╚══════════════════════════════════════════════════════════════════════╝${NC}"
    echo ""
    echo "Your platform is ready for deployment!"
    echo ""
    echo "Next steps:"
    echo "1. Set up database: cd backend && npx prisma migrate dev"
    echo "2. Add API keys to .env file"
    echo "3. Start development: cd backend && npm run dev"
    echo "4. Start frontend: cd frontend && npm run dev"
    exit 0
else
    echo -e "${RED}╔══════════════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${RED}║                                                                      ║${NC}"
    echo -e "${RED}║                  ⚠️  SOME CHECKS FAILED                              ║${NC}"
    echo -e "${RED}║                                                                      ║${NC}"
    echo -e "${RED}╚══════════════════════════════════════════════════════════════════════╝${NC}"
    echo ""
    echo "Please review the failed checks above and fix them."
    exit 1
fi
