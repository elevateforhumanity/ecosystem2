# Contributing to ElevateEDU

Thank you for your interest in contributing to ElevateEDU! This document provides guidelines for contributing to the project.

## Code of Conduct

We are committed to providing a welcoming and inclusive environment. Please:

- Be respectful and considerate
- Welcome newcomers
- Focus on constructive feedback
- Respect differing viewpoints
- Report unacceptable behavior to conduct@elevateedu.com

## How to Contribute

### Reporting Bugs

1. Check if bug already reported in [Issues](https://github.com/elevateforhumanity/ecosystem3/issues)
2. Create new issue with:
   - Clear title
   - Detailed description
   - Steps to reproduce
   - Expected vs actual behavior
   - Screenshots if applicable
   - Environment details (OS, browser, version)

### Suggesting Features

1. Check if feature already requested
2. Create new issue with:
   - Clear title
   - Use case description
   - Proposed solution
   - Alternative solutions considered
   - Additional context

### Pull Requests

1. Fork the repository
2. Create feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes
4. Write/update tests
5. Update documentation
6. Commit with clear messages
7. Push to your fork
8. Open Pull Request

## Development Setup

### Prerequisites

- Node.js 18+
- Docker & Docker Compose
- Git
- Code editor (VS Code recommended)

### Setup Steps

```bash
# Clone your fork
git clone https://github.com/YOUR_USERNAME/ecosystem3.git
cd ecosystem3

# Add upstream remote
git remote add upstream https://github.com/elevateforhumanity/ecosystem3.git

# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Start development server
npm run dev
```

### Running Tests

```bash
# Run all tests
npm test

# Run specific test
npm test -- path/to/test

# Run with coverage
npm run test:coverage

# Run linter
npm run lint

# Fix linting issues
npm run lint:fix
```

## Coding Standards

### JavaScript/React

- Use ES6+ features
- Use functional components with hooks
- Follow existing code style
- Use meaningful variable names
- Add comments for complex logic
- Keep functions small and focused

### Example

```javascript
// Good
const calculateGrade = (score, total) => {
  const percentage = (score / total) * 100;
  if (percentage >= 90) return 'A';
  if (percentage >= 80) return 'B';
  if (percentage >= 70) return 'C';
  if (percentage >= 60) return 'D';
  return 'F';
};

// Bad
const calc = (s, t) => {
  let p = (s / t) * 100;
  if (p >= 90) return 'A';
  // ... no comments, unclear names
};
```

### File Structure

```
src/
├── components/     # Reusable components
├── pages/         # Page components
├── services/      # Business logic
├── utils/         # Utility functions
├── hooks/         # Custom hooks
└── styles/        # Styles (if needed)
```

### Naming Conventions

- **Components**: PascalCase (e.g., `UserProfile.jsx`)
- **Functions**: camelCase (e.g., `calculateGrade`)
- **Constants**: UPPER_SNAKE_CASE (e.g., `MAX_FILE_SIZE`)
- **Files**: kebab-case for utilities (e.g., `date-utils.js`)

## Commit Messages

Follow conventional commits:

```
type(scope): subject

body

footer
```

### Types

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation
- `style`: Formatting
- `refactor`: Code restructuring
- `test`: Adding tests
- `chore`: Maintenance

### Examples

```
feat(lms): add assignment templates

Add ability to create and save assignment templates for reuse.
Includes template library and search functionality.

Closes #123
```

```
fix(email): resolve attachment upload issue

Fix bug where large attachments failed to upload.
Increased chunk size and added retry logic.

Fixes #456
```

## Testing Guidelines

### Unit Tests

- Test individual functions
- Mock external dependencies
- Cover edge cases
- Aim for 80%+ coverage

```javascript
describe('calculateGrade', () => {
  it('should return A for 90% or higher', () => {
    expect(calculateGrade(90, 100)).toBe('A');
    expect(calculateGrade(95, 100)).toBe('A');
  });

  it('should return F for below 60%', () => {
    expect(calculateGrade(50, 100)).toBe('F');
  });
});
```

### Integration Tests

- Test component interactions
- Test API endpoints
- Test user workflows

### E2E Tests

- Test critical user paths
- Test across browsers
- Test mobile responsiveness

## Documentation

### Code Documentation

- Document complex functions
- Explain "why" not "what"
- Keep comments up to date
- Use JSDoc for functions

```javascript
/**
 * Calculate student grade based on score and total points
 * @param {number} score - Points earned
 * @param {number} total - Total possible points
 * @returns {string} Letter grade (A-F)
 */
const calculateGrade = (score, total) => {
  // Implementation
};
```

### User Documentation

- Update relevant docs
- Include screenshots
- Provide examples
- Keep language simple

## Review Process

### What We Look For

- ✅ Code quality and style
- ✅ Test coverage
- ✅ Documentation updates
- ✅ No breaking changes
- ✅ Performance impact
- ✅ Security considerations

### Timeline

- Initial review: Within 2 business days
- Follow-up reviews: Within 1 business day
- Merge: After approval from 2 maintainers

## Release Process

### Versioning

We use Semantic Versioning (SemVer):

- **Major** (1.0.0): Breaking changes
- **Minor** (0.1.0): New features
- **Patch** (0.0.1): Bug fixes

### Release Schedule

- **Patch**: As needed
- **Minor**: Monthly
- **Major**: Quarterly

## Community

### Communication Channels

- **GitHub Issues**: Bug reports and features
- **GitHub Discussions**: General questions
- **Discord**: Real-time chat
- **Email**: dev@elevateedu.com

### Getting Help

- Read documentation first
- Search existing issues
- Ask in Discord
- Create GitHub issue
- Email for private matters

## Recognition

Contributors are recognized:

- Listed in CONTRIBUTORS.md
- Mentioned in release notes
- Featured on website (with permission)
- Invited to contributor events

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

## Questions?

Contact us:
- Email: dev@elevateedu.com
- Discord: [Join our server]
- Twitter: @elevateedu

---

**Thank you for contributing to ElevateEDU! Together we're transforming education! 🚀**
