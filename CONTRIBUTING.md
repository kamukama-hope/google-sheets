# Contributing to Google Sheets Sorting Helper

Thank you for your interest in contributing! This document provides guidelines and instructions for contributing to the project.

## Code of Conduct

- Be respectful and inclusive
- Welcome all skill levels
- Focus on the code, not the person
- Help others learn and grow

## Getting Started

### Prerequisites
- Node.js 14+
- Git
- Chrome browser (for extension testing)
- Google account

### Fork & Clone

```bash
# 1. Fork on GitHub
# 2. Clone your fork
git clone https://github.com/YOUR-USERNAME/google-sheets-sorting-helper.git
cd google-sheets-sorting-helper

# 3. Add upstream remote
git remote add upstream https://github.com/kiro-sheets-helper/google-sheets-sorting-helper.git

# 4. Create feature branch
git checkout -b feature/your-feature-name
```

### Setup Development Environment

```bash
# Install dependencies
npm install

# Install pre-commit hooks
npm run prepare

# Verify setup
npm run lint
npm run test
```

## Development Workflow

### Creating a Feature

1. **Create branch from latest main**
   ```bash
   git fetch upstream
   git checkout -b feature/descriptive-name
   ```

2. **Make your changes**
   - Follow code style guidelines
   - Write clear, meaningful commits
   - Add tests for new features

3. **Test thoroughly**
   ```bash
   npm test
   npm run lint
   npm run format
   ```

4. **Push to your fork**
   ```bash
   git push origin feature/descriptive-name
   ```

5. **Create Pull Request**
   - Clear title and description
   - Link related issues
   - Include screenshots if UI change

### Commit Guidelines

**Format**: `[type](scope): subject`

Examples:
```
[feat](sorting): add stable sort algorithm
[fix](extension): prevent multiple simultaneous sorts
[docs](guide): update keyboard shortcuts section
[test](algorithms): improve sort edge case coverage
[refactor](ui): consolidate duplicate code
```

Types:
- `feat` - New feature
- `fix` - Bug fix
- `docs` - Documentation
- `style` - Code style only
- `refactor` - Code refactoring
- `test` - Test additions/updates
- `perf` - Performance improvements
- `chore` - Build, dependency updates

### Code Style

This project uses ESLint and Prettier:

```bash
# Format code
npm run format

# Check style
npm run lint

# Fix style issues
npm run lint -- --fix
```

**Style Guide**:
- 2 spaces for indentation
- Single quotes for strings
- Semicolons required
- No trailing commas (except in objects/arrays)
- Comments for complex logic
- Clear variable names

### Writing Tests

For new features, add tests:

```javascript
describe('newFeature', () => {
  test('should do something', () => {
    const result = newFeature(input);
    expect(result).toBe(expected);
  });

  test('should handle edge case', () => {
    const result = newFeature(edgeCase);
    expect(result).toBeDefined();
  });
});
```

Run tests:
```bash
npm test              # Run all tests
npm test -- --watch  # Watch mode
npm test -- --coverage # With coverage report
```

## Types of Contributions

### Bug Reports

**When reporting**:
1. Search existing issues first
2. Provide reproducible steps
3. Include browser/version info
4. Add screenshots if helpful
5. Describe expected vs actual behavior

**Issue template**:
```markdown
**Describe the bug**
Brief description of what went wrong

**To Reproduce**
1. Go to...
2. Click on...
3. See error

**Expected behavior**
What should happen instead

**Environment**
- Browser: Chrome 95
- OS: Windows 10
- Version: 1.0.0

**Screenshots**
[If applicable]
```

### Feature Requests

**When suggesting**:
1. Describe the feature clearly
2. Explain the use case
3. Show examples if possible
4. Consider alternatives

**Issue template**:
```markdown
**Is your feature request related to a problem?**
Yes, when users try to...

**Describe the solution you'd like**
Feature description

**Describe alternatives considered**
Other approaches

**Additional context**
Any other info
```

### Documentation

Improve docs by:
- Fixing typos/errors
- Clarifying instructions
- Adding examples
- Improving organization
- Translating to other languages

### Code Reviews

Help review pull requests:
- Check code quality
- Verify tests pass
- Suggest improvements
- Ask clarifying questions
- Be constructive and kind

## Pull Request Process

1. **Before submitting**
   ```bash
   git fetch upstream
   git rebase upstream/main
   npm run lint
   npm run test
   npm run build
   ```

2. **Create PR with**
   - Clear title
   - Description of changes
   - Link to related issues
   - Screenshots (if UI change)
   - Checklist of items

3. **PR Template**
   ```markdown
   **Description**
   What changes does this make?

   **Related Issues**
   Fixes #123

   **Type of Change**
   - [ ] Bug fix
   - [ ] New feature
   - [ ] Breaking change
   - [ ] Documentation

   **Testing**
   - [ ] Unit tests added
   - [ ] Manual testing done
   - [ ] No console errors

   **Checklist**
   - [ ] Code follows style guide
   - [ ] Tests pass locally
   - [ ] Documentation updated
   - [ ] Commits are clean
   ```

4. **After submission**
   - Respond to feedback promptly
   - Make requested changes
   - Keep PR focused on single feature
   - Don't force push after review started

## Extension Development

### Testing locally

```bash
# For Chrome Extension
1. Go to chrome://extensions/
2. Enable Developer mode
3. Click "Load unpacked"
4. Select chrome-extension folder
5. Test in Google Sheets
```

### Debugging

```bash
# View extension logs
1. chrome://extensions/
2. Find extension → Details
3. Click "Inspect views"
4. Select service worker or popup
5. View console
```

### Building for release

```bash
cd chrome-extension
npm run build
# Creates production bundle
```

## Workspace Add-on Development

### Testing locally

```bash
cd workspace-addon
clasp login
clasp push
clasp deploy
# Open Google Sheets
# Extensions → Add-ons → Your project
```

### Debugging

```bash
clasp logs
# View execution logs
```

## Areas for Contribution

### High Priority
- [ ] Bug fixes (check open issues)
- [ ] Performance improvements
- [ ] Documentation improvements
- [ ] Test coverage expansion

### Medium Priority
- [ ] New sorting algorithms
- [ ] UI/UX enhancements
- [ ] Accessibility improvements
- [ ] Internationalization (i18n)

### Nice to Have
- [ ] Example projects
- [ ] Video tutorials
- [ ] Community templates
- [ ] Translations

## Recognition

Contributors are recognized in:
- [CONTRIBUTORS.md](CONTRIBUTORS.md)
- Release notes for major contributions
- GitHub repository credits
- Project documentation

## Questions?

- 💬 **Discussions** - Ask in [GitHub Discussions](https://github.com/kiro-sheets-helper/discussions)
- 📧 **Email** - Send to maintainers@example.com
- 🐛 **Issues** - Check [open issues](https://github.com/kiro-sheets-helper/issues)

## Resources

- [Project Board](https://github.com/orgs/kiro-sheets-helper/projects)
- [Development Guide](docs/SETUP.md)
- [Architecture Overview](ARCHITECTURE.md)
- [API Documentation](docs/API-INTEGRATION.md)

## License

By contributing, you agree your code is licensed under MIT License.

---

Thank you for contributing to make Google Sheets Sorting Helper better! 🚀