# Testing Guide

## Overview
This document describes the testing strategy and procedures for the Elevate for Humanity platform.

## Test Stack
- **Test Runner**: Vitest
- **Testing Library**: @testing-library/react
- **DOM Testing**: @testing-library/jest-dom
- **Environment**: jsdom / happy-dom

## Running Tests

### Run All Tests
```bash
npm test
```

### Run Tests in Watch Mode
```bash
npm run test:watch
```

### Run Specific Test File
```bash
npx vitest run src/test/routes.test.jsx
```

### Run Tests with Coverage
```bash
npx vitest run --coverage
```

## Test Structure

### Test Files Location
```
src/
├── test/
│   ├── setup.ts              # Test setup and configuration
│   ├── routes.test.jsx       # Route rendering tests
│   ├── components.test.jsx   # Component tests
│   └── protected-routes.test.jsx  # Protected route tests
├── pages/
│   └── __tests__/            # Page-specific tests
└── components/
    └── __tests__/            # Component-specific tests
```

## Test Categories

### 1. Route Tests (`src/test/routes.test.jsx`)
Tests that all routes render correctly:
- Priority 1 routes (Account, Profile, Settings, Login, etc.)
- Priority 2 routes (Legal pages, Thank You, 404)
- Verification routes (Password reset, Email verification)
- 404 handling for unknown routes

**Example**:
```javascript
it('renders Account page', () => {
  renderWithRouter(<Account />);
  expect(screen.getByText(/My Account/i)).toBeInTheDocument();
});
```

### 2. Component Tests (`src/test/components.test.jsx`)
Tests for shared components:
- AppLayout navigation and footer
- ProtectedRoute authentication logic
- Component rendering and props

**Example**:
```javascript
it('renders navigation links', () => {
  renderWithProviders(<AppLayout><div>Content</div></AppLayout>);
  expect(screen.getByText('Home')).toBeInTheDocument();
  expect(screen.getByText('Courses')).toBeInTheDocument();
});
```

### 3. Protected Route Tests (`src/test/protected-routes.test.jsx`)
Tests for role-based access control:
- Authentication checks
- Admin role access
- Instructor role access
- Route protection validation

**Example**:
```javascript
it('allows admin access to admin routes', () => {
  renderProtectedRoute(
    <TestComponent text="Admin Dashboard" />,
    { requiredRole: 'admin' }
  );
  expect(screen.getByText('Admin Dashboard')).toBeInTheDocument();
});
```

## Writing Tests

### Test Template
```javascript
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import YourComponent from '../path/to/YourComponent';

const renderWithProviders = (component) => {
  return render(
    <HelmetProvider>
      <MemoryRouter>
        {component}
      </MemoryRouter>
    </HelmetProvider>
  );
};

describe('YourComponent', () => {
  it('renders correctly', () => {
    renderWithProviders(<YourComponent />);
    expect(screen.getByText('Expected Text')).toBeInTheDocument();
  });
});
```

### Best Practices

1. **Use Semantic Queries**
   ```javascript
   // Good
   screen.getByRole('button', { name: /submit/i })
   screen.getByLabelText('Email')
   
   // Avoid
   screen.getByTestId('submit-button')
   ```

2. **Test User Behavior**
   ```javascript
   import { fireEvent } from '@testing-library/react';
   
   const button = screen.getByRole('button');
   fireEvent.click(button);
   expect(screen.getByText('Success')).toBeInTheDocument();
   ```

3. **Use Descriptive Test Names**
   ```javascript
   // Good
   it('displays error message when form is submitted with empty email', () => {})
   
   // Avoid
   it('test form', () => {})
   ```

4. **Keep Tests Isolated**
   - Each test should be independent
   - Use `afterEach` cleanup
   - Don't rely on test execution order

## Smoke Tests

Smoke tests verify critical functionality in deployed environments.

### Run Smoke Tests
```bash
# Against local preview
./scripts/smoke-test.sh http://localhost:8080

# Against staging
./scripts/smoke-test.sh https://staging.elevateforhumanity.org

# Against production
./scripts/smoke-test.sh https://elevateforhumanity.org
```

### What Smoke Tests Check
- All critical routes are accessible
- New pages load correctly
- Legal pages are available
- Verification flows work
- 404 handling functions

## Continuous Integration

Tests run automatically on:
- Every push to `main` or `develop`
- Every pull request
- Before deployment

### CI Pipeline
1. Install dependencies
2. Run unit tests
3. Run build
4. Upload artifacts
5. Deploy (if tests pass)

## Coverage Goals

Target coverage thresholds:
- **Lines**: 70%
- **Branches**: 60%
- **Functions**: 65%
- **Statements**: 70%

View coverage report:
```bash
npx vitest run --coverage
open coverage/index.html
```

## Debugging Tests

### Run Single Test
```bash
npx vitest run -t "renders Account page"
```

### Debug in VS Code
Add to `.vscode/launch.json`:
```json
{
  "type": "node",
  "request": "launch",
  "name": "Debug Vitest Tests",
  "runtimeExecutable": "npm",
  "runtimeArgs": ["run", "test"],
  "console": "integratedTerminal",
  "internalConsoleOptions": "neverOpen"
}
```

### Verbose Output
```bash
npx vitest run --reporter=verbose
```

## Common Issues

### Issue: "Cannot find module"
**Solution**: Check import paths and ensure dependencies are installed
```bash
npm install
```

### Issue: "Multiple elements found"
**Solution**: Use more specific queries
```javascript
// Instead of
screen.getByText(/Settings/i)

// Use
screen.getByRole('heading', { name: /Settings/i })
```

### Issue: "Test timeout"
**Solution**: Increase timeout or check for async operations
```javascript
it('async test', async () => {
  // ...
}, 10000); // 10 second timeout
```

## Manual Testing Checklist

Before deployment, manually verify:

### Functionality
- [ ] User can log in
- [ ] Navigation works across all pages
- [ ] Forms submit correctly
- [ ] Protected routes redirect properly
- [ ] Search functionality works
- [ ] Filters apply correctly

### UI/UX
- [ ] Responsive design on mobile
- [ ] Responsive design on tablet
- [ ] All images load
- [ ] No console errors
- [ ] Proper loading states
- [ ] Error messages display correctly

### Performance
- [ ] Page load time < 3 seconds
- [ ] No memory leaks
- [ ] Smooth animations
- [ ] Efficient re-renders

### Accessibility
- [ ] Keyboard navigation works
- [ ] Screen reader compatible
- [ ] Proper ARIA labels
- [ ] Color contrast meets WCAG standards
- [ ] Focus indicators visible

### Browser Compatibility
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)
- [ ] Mobile browsers

## Resources

- [Vitest Documentation](https://vitest.dev/)
- [Testing Library](https://testing-library.com/)
- [React Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)
