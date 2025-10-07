# WIOA Compliance Integration Guide

## Overview
This guide explains how to integrate the WIOA compliance backend systems into the main LMS server.

## Backend Systems Created

### 1. Models (TypeScript)
- `backend/src/models/eligibility.model.ts`
- `backend/src/models/attendance.model.ts`
- `backend/src/models/employment.model.ts`
- `backend/src/models/iep.model.ts`
- `backend/src/models/case-management.model.ts`
- `backend/src/models/financial.model.ts`
- `backend/src/models/support-services.model.ts`
- `backend/src/models/employer.model.ts`

### 2. Controllers (TypeScript)
- `backend/src/controllers/eligibility.controller.ts`
- `backend/src/controllers/attendance.controller.ts`
- `backend/src/controllers/employment.controller.ts`
- `backend/src/controllers/iep.controller.ts`
- `backend/src/controllers/case-management.controller.ts`
- `backend/src/controllers/financial.controller.ts`
- `backend/src/controllers/support-services.controller.ts`
- `backend/src/controllers/employer.controller.ts`
- `backend/src/controllers/reporting.controller.ts`
- `backend/src/controllers/validation.controller.ts`
- `backend/src/controllers/audit.controller.ts`

### 3. Routes (TypeScript)
- `backend/src/routes/eligibility.routes.ts`
- `backend/src/routes/attendance.routes.ts`
- `backend/src/routes/employment.routes.ts`
- `backend/src/routes/iep.routes.ts`
- `backend/src/routes/case-management.routes.ts`
- `backend/src/routes/financial.routes.ts`
- `backend/src/routes/support-services.routes.ts`
- `backend/src/routes/employer.routes.ts`
- `backend/src/routes/reporting.routes.ts`
- `backend/src/routes/validation.routes.ts`
- `backend/src/routes/audit.routes.ts`

### 4. Services (TypeScript)
- `backend/src/services/reporting.service.ts` - PIRL, ETA-9130, ETA-9169 reports
- `backend/src/services/validation.service.ts` - Data validation

### 5. Middleware (TypeScript)
- `backend/src/middleware/audit.ts` - Audit logging

## Integration Steps

### Step 1: Install Dependencies

```bash
cd /workspaces/Elevate-sitemap/apps/lms
npm install --save-dev typescript @types/node @types/express @types/pg @types/bcrypt @types/jsonwebtoken
npm install pg dotenv
```

### Step 2: Fix TypeScript Errors

The TypeScript files have some compilation errors that need to be fixed:

1. **Missing type declarations**: Install missing @types packages
2. **Implicit any types**: Add explicit type annotations
3. **Missing return statements**: Ensure all code paths return values

### Step 3: Compile TypeScript

```bash
cd backend
npm run build
# or
../node_modules/.bin/tsc
```

This will compile TypeScript files from `backend/src/` to `backend/dist/`

### Step 4: Uncomment Routes in server.js

In `server.js`, uncomment the following sections:

```javascript
// Line ~6: Uncomment audit middleware import
const { auditLog } = require('./backend/dist/middleware/audit');

// Line ~43: Uncomment audit logging
app.use(auditLog());

// Line ~333: Uncomment all WIOA routes
const eligibilityRoutes = require('./backend/dist/routes/eligibility.routes');
// ... (uncomment all route imports and app.use statements)
```

### Step 5: Set Up Database

The WIOA compliance system requires PostgreSQL. Update your `.env`:

```env
DATABASE_URL=postgresql://user:password@localhost:5432/lms_db
JWT_SECRET=your-secret-key-here
```

Run migrations:

```bash
psql -U postgres -d lms_db -f migrations/001_compliance_tables.sql
psql -U postgres -d lms_db -f migrations/002_wioa_compliance_tables.sql
```

### Step 6: Test the Integration

Start the server:

```bash
npm start
```

Test endpoints:

```bash
# Health check
curl http://localhost:3001/health

# Get available reports (requires authentication)
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  http://localhost:3001/api/reporting/available

# Get available validators
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  http://localhost:3001/api/validation/validators
```

## API Endpoints

### Eligibility
- `GET /api/eligibility/:userId?` - Get eligibility records
- `POST /api/eligibility` - Create eligibility record
- `PUT /api/eligibility/:id` - Update eligibility record
- `POST /api/eligibility/:id/approve` - Approve/deny eligibility

### Attendance
- `GET /api/attendance` - Get attendance records
- `POST /api/attendance` - Record attendance
- `PUT /api/attendance/:id` - Update attendance
- `GET /api/attendance/summary` - Get attendance summary

### Employment Outcomes
- `GET /api/employment` - Get employment outcomes
- `POST /api/employment` - Create employment outcome
- `PUT /api/employment/:id` - Update employment outcome
- `POST /api/employment/:id/retention` - Add retention check

### Individual Employment Plans (IEP)
- `GET /api/iep` - Get IEPs
- `POST /api/iep` - Create IEP
- `PUT /api/iep/:id` - Update IEP
- `POST /api/iep/:id/sign` - Sign IEP
- `POST /api/iep/:id/review` - Review IEP

### Case Management
- `GET /api/case-management` - Get cases
- `POST /api/case-management` - Create case
- `PUT /api/case-management/:id` - Update case
- `POST /api/case-management/:id/notes` - Add case note
- `POST /api/case-management/:id/close` - Close case

### Financial Tracking
- `GET /api/financial/records` - Get financial records
- `POST /api/financial/records` - Create financial record
- `POST /api/financial/records/:id/transactions` - Add transaction
- `GET /api/financial/summary` - Get financial summary

### Support Services
- `GET /api/support-services/services` - Get support services
- `POST /api/support-services/services` - Create support service
- `POST /api/support-services/services/:id/approve` - Approve service
- `GET /api/support-services/providers` - Get service providers

### Employer Management
- `GET /api/employer/employers` - Get employers
- `POST /api/employer/employers` - Create employer
- `GET /api/employer/jobs` - Get job postings
- `POST /api/employer/applications` - Create application
- `GET /api/employer/placements` - Get placements

### Reporting
- `GET /api/reporting/available` - Get available reports
- `GET /api/reporting/pirl` - Generate PIRL report
- `GET /api/reporting/pirl/export` - Export PIRL to CSV
- `GET /api/reporting/eta-9130` - Generate ETA-9130 report
- `GET /api/reporting/eta-9169` - Generate ETA-9169 report

### Data Validation
- `GET /api/validation/validators` - Get available validators
- `GET /api/validation/rules/:type` - Get validation rules
- `POST /api/validation/validate/:type` - Validate single record
- `POST /api/validation/validate-batch/:type` - Validate multiple records

### Audit Logs
- `GET /api/audit/logs` - Get audit logs
- `GET /api/audit/logs/:id` - Get specific audit log
- `GET /api/audit/summary` - Get audit summary
- `GET /api/audit/user/:userId` - Get user activity
- `GET /api/audit/export` - Export audit logs

## Authentication & Authorization

All WIOA compliance endpoints require authentication. Most require specific roles:

- **Admin**: Full access to all endpoints
- **Case Manager**: Access to participant management, case management, support services
- **Financial Manager**: Access to financial tracking and budgets
- **Participant**: Limited access to their own records

## Database Tables

The system creates the following tables:

1. `eligibility` - Participant eligibility records
2. `attendance` - Attendance tracking
3. `employment_outcomes` - Employment outcomes and retention
4. `individual_employment_plans` - IEPs
5. `skill_gains` - Measurable skill gains
6. `case_management` - Case management records
7. `financial_records` - Financial tracking
8. `budget_allocations` - Budget allocations
9. `participant_costs` - Participant costs
10. `support_services` - Support services
11. `service_requests` - Service requests
12. `service_providers` - Service providers
13. `employers` - Employer partnerships
14. `job_postings` - Job postings
15. `applications` - Job applications
16. `placements` - Job placements
17. `employer_engagements` - Employer engagement tracking
18. `audit_logs` - Audit trail

## Next Steps

1. Fix TypeScript compilation errors
2. Compile TypeScript to JavaScript
3. Uncomment routes in server.js
4. Set up PostgreSQL database
5. Run database migrations
6. Test all endpoints
7. Create frontend pages for WIOA compliance
8. Deploy to production

## Support

For issues or questions, refer to:
- `WIOA_COMPLIANCE_REQUIREMENTS.md` - Full compliance requirements
- `WIOA_IMPLEMENTATION_SUMMARY.md` - Implementation details
- `ARCHITECTURE_REVIEW.md` - System architecture
