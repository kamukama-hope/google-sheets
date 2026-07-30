# Release Checklist & Version Management

This document outlines the process for releasing new versions of the Google Sheets Sorting Helper.

## Version Strategy

We follow semantic versioning: MAJOR.MINOR.PATCH

- **MAJOR** (1.0.0 → 2.0.0): Breaking changes, major features
- **MINOR** (1.0.0 → 1.1.0): New features, backward compatible
- **PATCH** (1.0.0 → 1.0.1): Bug fixes, small improvements

## Pre-Release Checklist

### 1. Code Preparation
- [ ] All features implemented and tested
- [ ] All bugs fixed for this release
- [ ] Code reviewed by at least one reviewer
- [ ] No console errors or warnings
- [ ] Performance benchmarks acceptable
- [ ] Accessibility requirements met

### 2. Testing
- [ ] Manual testing on Chrome browser
- [ ] Manual testing on Edge browser
- [ ] Manual testing on Firefox
- [ ] Test with sample datasets (100, 1K, 10K rows)
- [ ] Keyboard shortcuts verified
- [ ] Settings page fully functional
- [ ] Error handling tested
- [ ] Run full test suite: `npm test`
- [ ] Performance tests: `npm run perf-test`

### 3. Documentation
- [ ] README.md updated with new features
- [ ] USER_GUIDE.md updated with new capabilities
- [ ] TROUBLESHOOTING.md includes new issues
- [ ] API docs updated if needed
- [ ] Changelog entry created
- [ ] Examples updated (if applicable)

### 4. Version Numbers
- [ ] Chrome Extension version bumped in `chrome-extension/manifest.json`
- [ ] Workspace Add-on version in `workspace-addon/appsscript.json`
- [ ] Root `package.json` version updated
- [ ] Version referenced in documentation
- [ ] Changelog dated and versioned

### 5. Build & Package
- [ ] Lint check passes: `npm run lint`
- [ ] Format check passes: `npm run format`
- [ ] Build succeeds: `npm run build`
- [ ] No build warnings
- [ ] Extension ZIP created
- [ ] Add-on package ready

### 6. Final Verification
- [ ] Git status clean (no uncommitted changes)
- [ ] All tests passing
- [ ] No security vulnerabilities
- [ ] Performance acceptable
- [ ] Disk space sufficient for release

## Release Process

### Step 1: Update Version Numbers

```bash
# Update package.json
npm version minor  # or major/patch

# Update Chrome manifest
# chrome-extension/manifest.json
"version": "1.1.0",

# Update Apps Script manifest
# workspace-addon/appsscript.json
"version": "1.1.0"
```

### Step 2: Update Changelog

Create entry in `CHANGELOG.md`:

```markdown
## [1.1.0] - 2024-01-15

### Added
- New Smart Sort AI recommendations
- Custom sort order templates
- Dark mode support

### Fixed
- Sorting with merged cells bug
- Performance issue with 10K+ rows

### Changed
- Improved UI responsiveness
- Updated documentation

### Removed
- Legacy sorting algorithm
```

### Step 3: Commit Release

```bash
git add -A
git commit -m "chore: release v1.1.0"
git tag -a v1.1.0 -m "Release version 1.1.0"
git push origin main
git push origin v1.1.0
```

### Step 4: Build Packages

```bash
# Build Chrome Extension
cd chrome-extension
npm run build
zip -r ../sheets-sorting-helper-1.1.0.zip .

# Verify packaging
ls -lh sheets-sorting-helper-1.1.0.zip
```

### Step 5: Deploy Chrome Extension

1. **Go to Chrome Web Store Developer Dashboard**
   - Visit: https://chrome.google.com/webstore/devconsole

2. **Upload new package**
   - Click "Package" tab
   - Click "Upload new package"
   - Select the ZIP file
   - Wait for it to process

3. **Update store listing** (if needed)
   - Update description if new features
   - Upload new screenshots if UI changed
   - Update version notes

4. **Submit for review**
   - Fill in release notes
   - Describe changes for this version
   - Submit
   - Check status daily

5. **Monitor rollout**
   - Extension typically published in 1-3 hours
   - Check store after publication
   - Monitor user feedback

### Step 6: Deploy Google Workspace Add-on

```bash
cd workspace-addon

# Authenticate
clasp login

# Push code
clasp push

# Deploy
clasp deploy --description "v1.1.0 - Add Smart Sort feature"

# Verify deployment
clasp deployments
```

### Step 7: Create GitHub Release

1. **Go to GitHub Releases**
   - https://github.com/kiro-sheets-helper/releases

2. **Create new release**
   - Click "Draft a new release"
   - Select tag: v1.1.0
   - Title: Google Sheets Sorting Helper v1.1.0

3. **Add release notes**
   ```markdown
   # Version 1.1.0 Release

   ## What's New
   - AI-powered Smart Sort recommendations
   - Custom sort order templates
   - Dark mode support

   ## Bug Fixes
   - Fixed sorting with merged cells
   - Improved performance with large datasets

   ## Installation
   - [Chrome Web Store](link)
   - [Workspace Marketplace](link)

   ## Downloads
   - [Source Code](zip)
   ```

4. **Upload assets**
   - Attach ZIP file of source
   - Add any release artifacts

5. **Publish release**
   - Check "This is a pre-release" if beta
   - Click "Publish release"

### Step 8: Announce Release

1. **Update project website**
   - Add release to news/blog
   - Update feature list

2. **Notify community**
   - Post in GitHub Discussions
   - Update Discord/Slack if applicable
   - Email to mailing list

3. **Social media** (if applicable)
   - Tweet about release
   - Post on community forums

## Post-Release

### 1. Monitor Feedback
- [ ] Check GitHub Issues daily
- [ ] Monitor store reviews/ratings
- [ ] Watch error reports
- [ ] Track performance metrics

### 2. Hotfix Protocol (if bugs found)
If critical bug found:

```bash
# 1. Create hotfix branch
git checkout -b hotfix/critical-bug

# 2. Fix bug
# 3. Test thoroughly
# 4. Commit with message: fix: description

# 5. Update version to PATCH
npm version patch

# 6. Follow release steps again
# 7. Merge back to main
```

### 3. Documentation Updates
- [ ] Update CHANGELOG.md with any notes
- [ ] Fix documentation based on feedback
- [ ] Add examples based on user questions

### 4. Metrics Review
- [ ] Review crash reports
- [ ] Analyze usage patterns
- [ ] Check performance metrics
- [ ] Gather user feedback

## Maintenance Releases

Schedule for quarterly maintenance:
- Security updates
- Dependency updates
- Performance optimizations
- Minor bug fixes

## Breaking Changes Policy

For major version changes:

1. **Deprecation notice** (in minor version first)
   - Document what's changing
   - Provide migration guide

2. **Grace period**
   - Wait at least 2 months
   - Allow users to migrate

3. **Release major version**
   - Include detailed migration guide
   - Update all documentation
   - Provide examples

## Rollback Plan

If released version has critical issues:

```bash
# Chrome Web Store
1. Go to Developer Dashboard
2. Previous versions
3. Select stable previous version
4. Click Revert

# Google Workspace Add-on
clasp deployments
clasp deploy --version <deployment-id>

# GitHub
1. Delete or unpublish release
2. Remove tag: git push origin :v1.1.0
3. Announce rollback
```

## Release Statistics

Track for each release:
- Release date
- Time from planning to release
- Number of commits
- Number of bug fixes
- Number of features
- User downloads
- Crash reports
- Average rating

## Tools & Resources

- [Semantic Versioning](https://semver.org/)
- [Conventional Commits](https://www.conventionalcommits.org/)
- [Keep a Changelog](https://keepachangelog.com/)
- [Release Management Guide](https://en.wikipedia.org/wiki/Release_management)

## Contact

For release-related questions:
- 📧 Email: release@example.com
- 💬 Discussions: https://github.com/kiro-sheets-helper/discussions
- 🐛 Issues: https://github.com/kiro-sheets-helper/issues