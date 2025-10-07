# WIOA Compliance Testing Guide

## Overview
This guide provides comprehensive testing procedures for all WIOA compliance features.

## Prerequisites

### 1. Environment Setup
```bash
# Set environment variables
export DATABASE_URL="postgresql://user:password@localhost:5432/lms_test"
export JWT_SECRET="test-secret-key-change-in-production"
export NODE_ENV="test"
```

### 2. Database Setup
```bash
# Create test database
createdb lms_test

# Run migrations
psql -U postgres -d lms_test -f migrations/001_compliance_tables.sql
psql -U postgres -d lms_test -f migrations/002_wioa_compliance_tables.sql
```

### 3. Compile TypeScript
```bash
cd backend
npm install
npm run build
```

### 4. Start Server
```bash
npm start
```

---

## Test Plan

### Phase 1: Authentication & Authorization ✅

#### Test 1.1: User Registration
```bash
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "SecurePass123!",
    "name": "Test User",
    "role": "participant"
  }'
```

**Expected Result:**
- Status: 201
- Response contains user ID and JWT token

#### Test 1.2: User Login
```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "SecurePass123!"
  }'
```

**Expected Result:**
- Status: 200
- Response contains JWT token
- Token is valid for 24 hours

#### Test 1.3: Protected Route Access
```bash
# Save token from login
TOKEN="<jwt_token_here>"

curl -X GET http://localhost:3001/api/eligibility \
  -H "Authorization: Bearer $TOKEN"
```

**Expected Result:**
- Status: 200 (with valid token)
- Status: 401 (without token)

#### Test 1.4: Role-Based Access Control
```bash
# Try to access admin-only endpoint as participant
curl -X GET http://localhost:3001/api/audit/logs \
  -H "Authorization: Bearer $TOKEN"
```

**Expected Result:**
- Status: 403 (Forbidden)
- Error message about insufficient permissions

---

### Phase 2: Eligibility Management ✅

#### Test 2.1: Create Eligibility Record
```bash
curl -X POST http://localhost:3001/api/eligibility \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user_123",
    "eligibilityCategory": "adult",
    "employmentStatus": "unemployed",
    "educationLevel": "high_school",
    "income": 25000,
    "householdSize": 3,
    "documentationUrl": "https://example.com/docs/proof.pdf"
  }'
```

**Expected Result:**
- Status: 201
- Response contains eligibility ID
- Record is in "pending" approval status

#### Test 2.2: Get Eligibility Records
```bash
curl -X GET "http://localhost:3001/api/eligibility?userId=user_123" \
  -H "Authorization: Bearer $TOKEN"
```

**Expected Result:**
- Status: 200
- Returns array of eligibility records
- Includes all required fields

#### Test 2.3: Approve Eligibility (Admin)
```bash
# Login as admin first
ADMIN_TOKEN="<admin_jwt_token>"

curl -X POST http://localhost:3001/api/eligibility/elig_123/approve \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "approved": true,
    "notes": "All documentation verified"
  }'
```

**Expected Result:**
- Status: 200
- Eligibility status updated to "approved"
- Approval timestamp recorded

---

### Phase 3: Attendance Tracking ✅

#### Test 3.1: Record Attendance
```bash
curl -X POST http://localhost:3001/api/attendance \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user_123",
    "courseId": "course_456",
    "date": "2024-01-15",
    "status": "present",
    "hoursAttended": 4,
    "notes": "Participated actively in class"
  }'
```

**Expected Result:**
- Status: 201
- Attendance record created
- Hours tracked correctly

#### Test 3.2: Get Attendance Summary
```bash
curl -X GET "http://localhost:3001/api/attendance/summary?userId=user_123&courseId=course_456&startDate=2024-01-01&endDate=2024-01-31" \
  -H "Authorization: Bearer $TOKEN"
```

**Expected Result:**
- Status: 200
- Summary includes:
  - Total days
  - Present/absent/excused counts
  - Attendance rate percentage
  - Total hours

---

### Phase 4: Employment Outcomes ✅

#### Test 4.1: Create Employment Outcome
```bash
curl -X POST http://localhost:3001/api/employment \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user_123",
    "employerId": "emp_789",
    "jobTitle": "Web Developer",
    "startDate": "2024-02-01",
    "wage": 25.00,
    "wageType": "hourly",
    "hoursPerWeek": 40,
    "benefits": ["health", "dental", "401k"]
  }'
```

**Expected Result:**
- Status: 201
- Employment outcome created
- Wage and hours tracked

#### Test 4.2: Add Retention Check (2nd Quarter)
```bash
curl -X POST http://localhost:3001/api/employment/emp_123/retention \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "quarter": 2,
    "employed": true,
    "wage": 26.00,
    "hoursPerWeek": 40,
    "contactMethod": "phone",
    "notes": "Still employed, received raise"
  }'
```

**Expected Result:**
- Status: 200
- Retention check recorded
- 2nd quarter retention tracked for WIOA reporting

---

### Phase 5: Individual Employment Plans (IEP) ✅

#### Test 5.1: Create IEP
```bash
curl -X POST http://localhost:3001/api/iep \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user_123",
    "caseManagerId": "cm_456",
    "careerGoal": "Become a certified web developer",
    "targetOccupation": "Web Developer",
    "targetIndustry": "Technology",
    "targetWage": 60000,
    "currentSkills": ["HTML", "CSS", "Basic JavaScript"],
    "skillGaps": ["React", "Node.js", "Database management"],
    "barriers": ["Lack of professional experience"],
    "strengths": ["Quick learner", "Strong problem-solving"],
    "trainingPrograms": [
      {
        "courseId": "course_123",
        "startDate": "2024-02-01",
        "expectedEndDate": "2024-05-01",
        "status": "planned"
      }
    ],
    "milestones": [
      {
        "description": "Complete React fundamentals",
        "targetDate": "2024-03-01",
        "status": "pending"
      }
    ]
  }'
```

**Expected Result:**
- Status: 201
- IEP created in "draft" status
- All components properly stored

#### Test 5.2: Sign IEP
```bash
curl -X POST http://localhost:3001/api/iep/iep_123/sign \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "signature": "John Doe",
    "role": "participant"
  }'
```

**Expected Result:**
- Status: 200
- IEP status changes to "active"
- Signature and timestamp recorded

---

### Phase 6: Case Management ✅

#### Test 6.1: Create Case
```bash
curl -X POST http://localhost:3001/api/case-management \
  -H "Authorization: Bearer $CASE_MANAGER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user_123",
    "caseManagerId": "cm_456",
    "priority": "medium",
    "contactFrequency": "monthly",
    "intakeNotes": "Initial assessment completed",
    "barriers": ["Transportation", "Childcare"],
    "accommodations": ["Flexible schedule"]
  }'
```

**Expected Result:**
- Status: 201
- Case created with "active" status
- Intake notes recorded

#### Test 6.2: Add Case Note
```bash
curl -X POST http://localhost:3001/api/case-management/case_123/notes \
  -H "Authorization: Bearer $CASE_MANAGER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "contact",
    "content": "Phone call with participant to discuss progress",
    "confidential": false
  }'
```

**Expected Result:**
- Status: 200
- Note added to case
- Last contact date updated

---

### Phase 7: Financial Tracking ✅

#### Test 7.1: Create Financial Record
```bash
curl -X POST http://localhost:3001/api/financial/records \
  -H "Authorization: Bearer $FINANCIAL_MANAGER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user_123",
    "programId": "prog_789",
    "fundingSource": "WIOA Adult",
    "grantNumber": "GRANT-2024-001",
    "fiscalYear": 2024,
    "allocatedAmount": 5000,
    "budgetCategory": "training"
  }'
```

**Expected Result:**
- Status: 201
- Financial record created
- Allocated amount tracked

#### Test 7.2: Add Transaction
```bash
curl -X POST http://localhost:3001/api/financial/records/fin_123/transactions \
  -H "Authorization: Bearer $FINANCIAL_MANAGER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "expenditure",
    "amount": 1500,
    "category": "tuition",
    "description": "Web Development Course Tuition",
    "vendor": "Tech Training Institute",
    "invoiceNumber": "INV-2024-001"
  }'
```

**Expected Result:**
- Status: 200
- Transaction recorded
- Spent and remaining amounts updated

#### Test 7.3: Get Financial Summary
```bash
curl -X GET "http://localhost:3001/api/financial/summary?programId=prog_789&fiscalYear=2024" \
  -H "Authorization: Bearer $FINANCIAL_MANAGER_TOKEN"
```

**Expected Result:**
- Status: 200
- Summary shows:
  - Total allocated
  - Total spent
  - Total remaining
  - Breakdown by category

---

### Phase 8: Support Services ✅

#### Test 8.1: Create Support Service
```bash
curl -X POST http://localhost:3001/api/support-services/services \
  -H "Authorization: Bearer $CASE_MANAGER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user_123",
    "caseManagerId": "cm_456",
    "serviceType": "childcare",
    "serviceProvider": "ABC Daycare Center",
    "providerContact": "555-0123",
    "description": "Full-time childcare for 2 children",
    "needAssessment": "Participant requires childcare to attend training",
    "startDate": "2024-02-01",
    "endDate": "2024-05-01",
    "cost": 800,
    "fundingSource": "WIOA Support Services"
  }'
```

**Expected Result:**
- Status: 201
- Service created in "pending" approval status

#### Test 8.2: Approve Support Service
```bash
curl -X POST http://localhost:3001/api/support-services/services/svc_123/approve \
  -H "Authorization: Bearer $CASE_MANAGER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "approved": true
  }'
```

**Expected Result:**
- Status: 200
- Service approved
- Approval timestamp recorded

---

### Phase 9: Employer Management ✅

#### Test 9.1: Create Employer
```bash
curl -X POST http://localhost:3001/api/employer/employers \
  -H "Authorization: Bearer $CASE_MANAGER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "companyName": "Tech Solutions Inc",
    "industry": "Technology",
    "contactPerson": "Jane Smith",
    "contactTitle": "HR Manager",
    "email": "jane@techsolutions.com",
    "phone": "555-0100",
    "address": "123 Tech Street",
    "city": "San Francisco",
    "state": "CA",
    "zipCode": "94105",
    "companySize": "medium",
    "employeeCount": 150,
    "partnershipType": "both"
  }'
```

**Expected Result:**
- Status: 201
- Employer created
- Partnership established

#### Test 9.2: Create Job Posting
```bash
curl -X POST http://localhost:3001/api/employer/jobs \
  -H "Authorization: Bearer $CASE_MANAGER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "employerId": "emp_123",
    "title": "Junior Web Developer",
    "description": "Entry-level position for recent graduates",
    "requirements": ["HTML/CSS", "JavaScript", "Git"],
    "jobType": "full_time",
    "salaryMin": 50000,
    "salaryMax": 65000,
    "salaryType": "annual",
    "location": "San Francisco, CA",
    "openings": 2
  }'
```

**Expected Result:**
- Status: 201
- Job posting created with "open" status

#### Test 9.3: Create Placement
```bash
curl -X POST http://localhost:3001/api/employer/placements \
  -H "Authorization: Bearer $CASE_MANAGER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user_123",
    "employerId": "emp_123",
    "jobPostingId": "job_456",
    "jobTitle": "Junior Web Developer",
    "startDate": "2024-03-01",
    "employmentType": "full_time",
    "wage": 55000,
    "wageType": "annual",
    "hoursPerWeek": 40,
    "benefits": ["health", "dental", "401k"]
  }'
```

**Expected Result:**
- Status: 201
- Placement created
- Links participant to employer

---

### Phase 10: Reporting ✅

#### Test 10.1: Generate PIRL Report
```bash
curl -X GET "http://localhost:3001/api/reporting/pirl?startDate=2024-01-01&endDate=2024-03-31" \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

**Expected Result:**
- Status: 200
- Returns array of participant records
- Includes all required PIRL fields

#### Test 10.2: Export PIRL to CSV
```bash
curl -X GET "http://localhost:3001/api/reporting/pirl/export?startDate=2024-01-01&endDate=2024-03-31" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -o pirl_report.csv
```

**Expected Result:**
- Status: 200
- CSV file downloaded
- Contains all participant data

#### Test 10.3: Generate ETA-9130 Report
```bash
curl -X GET "http://localhost:3001/api/reporting/eta-9130?quarter=1&year=2024" \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

**Expected Result:**
- Status: 200
- Returns quarterly financial report
- Includes participant counts, demographics, outcomes, expenditures

---

### Phase 11: Data Validation ✅

#### Test 11.1: Validate Eligibility Record
```bash
curl -X POST http://localhost:3001/api/validation/validate/eligibility \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user_123",
    "eligibilityCategory": "adult",
    "enrollmentDate": "2024-01-15"
  }'
```

**Expected Result:**
- Status: 200
- Returns validation result
- Lists any errors or warnings

#### Test 11.2: Batch Validation
```bash
curl -X POST http://localhost:3001/api/validation/validate-batch/attendance \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "records": [
      {
        "userId": "user_123",
        "courseId": "course_456",
        "date": "2024-01-15",
        "hoursAttended": 4
      },
      {
        "userId": "user_124",
        "courseId": "course_456",
        "date": "2024-01-15",
        "hoursAttended": 3.5
      }
    ]
  }'
```

**Expected Result:**
- Status: 200
- Returns validation results for all records
- Includes summary statistics

---

### Phase 12: Audit Logging ✅

#### Test 12.1: Verify Audit Logs Created
```bash
curl -X GET "http://localhost:3001/api/audit/logs?userId=user_123&limit=10" \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

**Expected Result:**
- Status: 200
- Returns audit logs for user actions
- Includes timestamps, actions, resources

#### Test 12.2: Get Audit Summary
```bash
curl -X GET "http://localhost:3001/api/audit/summary?startDate=2024-01-01&endDate=2024-01-31" \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

**Expected Result:**
- Status: 200
- Returns summary statistics
- Shows activity by action, resource, user

#### Test 12.3: Export Audit Logs
```bash
curl -X GET "http://localhost:3001/api/audit/export?startDate=2024-01-01&endDate=2024-01-31&format=csv" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -o audit_logs.csv
```

**Expected Result:**
- Status: 200
- CSV file downloaded
- Contains all audit log entries

---

## Integration Tests

### Test Scenario 1: Complete Participant Journey

1. **Register participant**
2. **Create eligibility record**
3. **Approve eligibility** (admin)
4. **Create IEP**
5. **Sign IEP** (participant and case manager)
6. **Record attendance** (multiple sessions)
7. **Track financial expenditures**
8. **Provide support services**
9. **Create job placement**
10. **Add retention checks** (2nd and 4th quarter)
11. **Generate PIRL report**
12. **Verify audit trail**

### Test Scenario 2: Case Management Workflow

1. **Create case**
2. **Add intake notes**
3. **Identify barriers**
4. **Request support services**
5. **Approve support services**
6. **Track case activities**
7. **Add case notes** (regular intervals)
8. **Update case status**
9. **Close case** (successful completion)
10. **Generate case summary report**

### Test Scenario 3: Financial Tracking Workflow

1. **Create budget allocation**
2. **Create financial records** (multiple participants)
3. **Add transactions** (various categories)
4. **Create participant cost requests**
5. **Approve participant costs**
6. **Process reimbursements**
7. **Generate financial summary**
8. **Generate ETA-9130 report**
9. **Verify budget compliance**

---

## Performance Tests

### Load Testing
```bash
# Use Apache Bench or similar tool
ab -n 1000 -c 10 -H "Authorization: Bearer $TOKEN" \
  http://localhost:3001/api/attendance
```

**Expected Result:**
- 95% of requests complete in < 500ms
- No errors under normal load
- Server remains stable

### Stress Testing
```bash
# Gradually increase concurrent users
# Monitor server resources
# Identify breaking point
```

---

## Security Tests

### Test S1: SQL Injection Prevention
```bash
curl -X GET "http://localhost:3001/api/eligibility?userId='; DROP TABLE users; --" \
  -H "Authorization: Bearer $TOKEN"
```

**Expected Result:**
- No SQL injection occurs
- Proper error handling
- Query is safely escaped

### Test S2: XSS Prevention
```bash
curl -X POST http://localhost:3001/api/case-management/case_123/notes \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "contact",
    "content": "<script>alert(\"XSS\")</script>",
    "confidential": false
  }'
```

**Expected Result:**
- Script tags are sanitized
- No XSS vulnerability
- Content is safely stored

### Test S3: Rate Limiting
```bash
# Make 10 rapid requests
for i in {1..10}; do
  curl -X POST http://localhost:3001/api/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email":"test@example.com","password":"wrong"}'
done
```

**Expected Result:**
- After 5 failed attempts, rate limit kicks in
- Status: 429 (Too Many Requests)
- Retry-After header present

---

## Test Results Documentation

### Test Execution Log Template

```markdown
## Test Execution: [Date]

### Environment
- Server: http://localhost:3001
- Database: lms_test
- Node Version: [version]
- TypeScript Version: [version]

### Test Results

| Phase | Test | Status | Notes |
|-------|------|--------|-------|
| 1 | Authentication | ✅ PASS | All auth tests passed |
| 2 | Eligibility | ✅ PASS | CRUD operations working |
| 3 | Attendance | ✅ PASS | Summary calculations correct |
| ... | ... | ... | ... |

### Issues Found
1. [Issue description]
   - Severity: High/Medium/Low
   - Steps to reproduce
   - Expected vs Actual behavior

### Performance Metrics
- Average response time: [ms]
- Peak memory usage: [MB]
- Database query time: [ms]

### Recommendations
- [Recommendation 1]
- [Recommendation 2]
```

---

## Automated Testing

### Unit Tests
```bash
cd backend
npm test
```

### Integration Tests
```bash
npm run test:integration
```

### E2E Tests
```bash
npm run test:e2e
```

---

## Continuous Integration

### GitHub Actions Workflow
```yaml
name: WIOA Compliance Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    
    services:
      postgres:
        image: postgres:14
        env:
          POSTGRES_PASSWORD: postgres
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
    
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: npm install
      
      - name: Run migrations
        run: |
          psql -h localhost -U postgres -c "CREATE DATABASE lms_test"
          psql -h localhost -U postgres -d lms_test -f migrations/001_compliance_tables.sql
          psql -h localhost -U postgres -d lms_test -f migrations/002_wioa_compliance_tables.sql
      
      - name: Compile TypeScript
        run: cd backend && npm run build
      
      - name: Run tests
        run: npm test
        env:
          DATABASE_URL: postgresql://postgres:postgres@localhost:5432/lms_test
          JWT_SECRET: test-secret
```

---

## Sign-Off Checklist

- [ ] All Phase 1-12 tests pass
- [ ] Integration scenarios complete successfully
- [ ] Performance tests meet requirements
- [ ] Security tests show no vulnerabilities
- [ ] Audit logs capture all required actions
- [ ] Reports generate correctly
- [ ] Data validation works as expected
- [ ] Documentation is complete
- [ ] Code is deployed to staging
- [ ] Stakeholders have reviewed

---

## Support

For testing support:
- Technical Lead: [name]
- QA Team: [email]
- Documentation: WIOA_API_DOCUMENTATION.md
