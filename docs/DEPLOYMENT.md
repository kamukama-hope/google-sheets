# Deployment & Installation Guide

This guide provides step-by-step instructions for deploying the Google Sheets Sorting Helper as both a Chrome Extension and Google Workspace Add-on.

## Table of Contents
1. [Chrome Extension Deployment](#chrome-extension-deployment)
2. [Google Workspace Add-on Deployment](#google-workspace-add-on-deployment)
3. [Post-Deployment Verification](#post-deployment-verification)
4. [Troubleshooting](#troubleshooting)

## Chrome Extension Deployment

### Development Installation (Unpacked)

#### Prerequisites
- Chrome browser (version 90+)
- Project files downloaded/cloned
- No special setup required

#### Installation Steps

1. **Navigate to Extensions Page**
   ```
   1. Open Chrome
   2. Type chrome://extensions/ in address bar
   3. Press Enter
   ```

2. **Enable Developer Mode**
   - Toggle "Developer mode" in top-right corner
   - You should see new buttons appear

3. **Load Unpacked Extension**
   - Click "Load unpacked" button
   - Navigate to `chrome-extension` folder in the project
   - Select the folder and click "Select Folder"
   - Extension should now appear in the list

4. **Verify Installation**
   - Check extension appears with correct name
   - Icon should display in toolbar
   - Click icon to test popup

### Chrome Web Store Submission

#### Prerequisites
- Google account
- Developer account with $5 registration fee
- Extension meets Chrome Web Store policies

#### Submission Steps

1. **Prepare Files**
   ```bash
   cd chrome-extension
   zip -r sheets-sorting-helper-1.0.0.zip .
   ```

2. **Create Developer Account**
   - Go to [Chrome Web Store Developer Console](https://chrome.google.com/webstore/devconsole)
   - Sign in with Google account
   - Pay $5 registration fee if first time

3. **Upload Extension**
   - Click "Create new item"
   - Upload the ZIP file
   - Fill in required information:
     - Name: Google Sheets Sorting Helper
     - Summary: Advanced sorting for Google Sheets
     - Detailed description
     - Category: Productivity
     - Language: English
     - Content rating: Select appropriate rating

4. **Add Store Listing Details**
   - Upload promotional images (128x128, 440x280, 1280x800)
   - Add screenshots
   - Set pricing (Free)
   - Select supported regions

5. **Submit for Review**
   - Review all information
   - Submit for Chrome Web Store review
   - Wait for approval (typically 1-3 days)

6. **Monitor Store Listing**
   - View analytics and ratings
   - Respond to user reviews
   - Update when new versions are released

### Version Updates

1. **Increment Version Number**
   - Edit `chrome-extension/manifest.json`
   - Update `version` field (e.g., "1.0.1")

2. **Create Update Package**
   ```bash
   cd chrome-extension
   zip -r sheets-sorting-helper-1.0.1.zip .
   ```

3. **Upload to Chrome Web Store**
   - Go to Developer Dashboard
   - Click "Package" on left sidebar
   - Click "Upload new package"
   - Select updated ZIP file
   - Submit for review

## Google Workspace Add-on Deployment

### Prerequisites
- Google account with Workspace
- Google Apps Script project created
- `clasp` CLI installed locally

### Installation Steps

1. **Install Google Apps Script CLI**
   ```bash
   npm install -g @google/clasp
   ```

2. **Authenticate with Google**
   ```bash
   clasp login
   ```
   - Opens browser for OAuth consent
   - Grant required permissions

3. **Create Apps Script Project**
   ```bash
   cd workspace-addon
   clasp create --type webapp --title "Sheets Sorting Helper"
   ```
   - Creates `.clasp.json` file
   - Links to your Apps Script project

4. **Deploy to Google Apps Script**
   ```bash
   clasp push
   ```
   - Uploads all files to Apps Script
   - Verify no errors in output

5. **Create New Deployment**
   ```bash
   clasp deploy --description "Initial Release"
   ```
   - Creates deployment version
   - Note the deployment ID for reference

6. **Verify Installation**
   - Open any Google Sheet
   - Go to Extensions → Apps Script
   - Add-on should appear with name "Sheets Sorting Helper"
   - Click to open and test functionality

### Google Workspace Marketplace Submission

#### Prerequisites
- Published version of add-on
- Google account
- Approval from domain admin (if using Workspace)

#### Submission Steps

1. **Access Apps Script Editor**
   ```bash
   clasp open
   ```
   - Or navigate to script.google.com
   - Select your project

2. **Enable API Execution**
   - In Apps Script: Project Settings
   - Note the Script ID
   - Enable Sheets API

3. **Create Configuration for Marketplace**
   - In Apps Script: Publish → Deploy as API executable
   - Set version description
   - Click Deploy

4. **Register in Google Workspace Marketplace**
   - Go to [Workspace Marketplace](https://workspace.google.com/marketplace)
   - Click "Create new app" (if not visible, contact Google)
   - Fill in app details:
     - Name: Google Sheets Sorting Helper
     - Description: Advanced sorting capabilities
     - Logo: Upload PNG (256x256)
     - Category: Productivity
     - Support email
     - Privacy policy URL

5. **Add API Scopes**
   - Declare OAuth scopes used:
     - `https://www.googleapis.com/auth/spreadsheets`
     - `https://www.googleapis.com/auth/script.container.ui`

6. **Submit for Review**
   - Review all information
   - Submit for Workspace Marketplace review
   - Google reviews typically within 5 business days

## Post-Deployment Verification

### Chrome Extension Verification

1. **Test Basic Functionality**
   ```
   1. Open Google Sheets
   2. Click extension icon
   3. Verify popup displays correctly
   4. Test right-click context menu
   5. Try keyboard shortcuts (Ctrl+Shift+S, etc.)
   ```

2. **Verify Permissions**
   - Right-click extension → Manage extension
   - Check permissions are as expected
   - Grant any additional permissions if needed

3. **Test on Multiple Sheets**
   - Create new Google Sheet
   - Add sample data from SAMPLE_DATA.csv
   - Perform test sorts

4. **Check Error Handling**
   - Try sorting empty ranges
   - Test with merged cells
   - Verify error messages are helpful

### Google Workspace Add-on Verification

1. **Test Installation**
   ```
   1. Open Google Sheets
   2. Extensions → Apps Script
   3. Click add-on name
   4. Verify sidebar opens
   5. Test all UI elements
   ```

2. **Verify Data Operations**
   - Create test sheet
   - Import SAMPLE_DATA.csv
   - Test basic and advanced sorting
   - Verify data integrity

3. **Check Permissions**
   - Authorize necessary permissions when prompted
   - Verify OAuth flow works correctly

4. **Monitor Logs**
   - View execution logs in Apps Script
   - Check for any errors or warnings

## Configuration

### Chrome Extension Configuration

**OAuth Setup (if using Sheets API from extension)**:
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create new project
3. Enable Google Sheets API
4. Create OAuth 2.0 credentials
5. Add extension ID to authorized URLs
6. Update `chrome-extension/manifest.json` with client ID

### Apps Script Configuration

**Environment Variables** (in `workspace-addon/appsscript.json`):
- Check timezone settings
- Verify API dependencies
- Review OAuth scopes

## Performance Considerations

### Chrome Extension
- Keep content scripts small
- Use service workers for background tasks
- Cache API responses when possible
- Monitor memory usage

### Google Workspace Add-on
- Minimize API calls
- Cache frequently accessed data
- Use batch operations for multiple updates
- Consider quota limits

## Rollback Procedures

### Chrome Extension
```bash
# To revert to previous version
1. Go to Developer Dashboard
2. Previous versions tab
3. Click "Revert" on desired version
4. Confirm changes
```

### Google Workspace Add-on
```bash
# View deployment history
clasp deployments

# Redeploy previous version
clasp deploy --version <deployment-id>
```

## Monitoring & Analytics

### Chrome Extension Analytics
- Monitor installation count in Dashboard
- Track active users and retention
- Review user ratings and feedback
- Monitor crash reports

### Google Workspace Add-on Analytics
- Use Apps Script analytics
- Monitor execution time and errors
- Track user adoption in organization
- Set up alerts for errors

## Security Considerations

### Before Deployment

1. **Code Review**
   - Security audit of all code
   - Check for vulnerabilities
   - Remove debug/test code
   - Verify no hardcoded credentials

2. **Permission Review**
   - Only request necessary permissions
   - Document why each permission is needed
   - Use principle of least privilege

3. **Data Handling**
   - Never store user data unnecessarily
   - Implement proper encryption
   - Handle sensitive data carefully
   - Implement data retention policies

### Ongoing

- Monitor for security updates
- Keep dependencies up to date
- Review access logs
- Respond quickly to security issues

## Support & Maintenance

### After Deployment

1. **Monitor Issues**
   - Set up error tracking
   - Review user feedback regularly
   - Track performance metrics

2. **Plan Updates**
   - Schedule maintenance windows
   - Plan feature releases
   - Manage version lifecycle

3. **User Support**
   - Respond to user inquiries
   - Provide documentation
   - Create FAQs based on common issues
   - Build user community

## Troubleshooting

### Extension Not Appearing
**Problem**: Extension doesn't show in Chrome after installation  
**Solutions**:
- Verify extension is enabled in chrome://extensions/
- Check manifest.json for syntax errors
- Clear Chrome cache (Ctrl+Shift+Delete)
- Try reinstalling extension

### OAuth Errors
**Problem**: Getting OAuth errors or permission issues  
**Solutions**:
- Verify OAuth client ID in manifest
- Check authorized URLs in Google Cloud Console
- Ensure Sheets API is enabled
- Try revoking and re-granting permissions

### Sorting Not Working
**Problem**: Sorts don't apply or cause errors  
**Solutions**:
- Verify data range is selected
- Check for merged cells or special formatting
- Clear browser cache
- Check browser console for errors (F12)

### Performance Issues
**Problem**: Slow performance with large datasets  
**Solutions**:
- Close unnecessary browser tabs
- Disable other extensions temporarily
- Split large datasets into smaller ranges
- Try different browser

## Support Contact
- GitHub Issues: [Project Repository](https://github.com/kiro-sheets-helper)
- Email: support@example.com
- Documentation: [Project Wiki](https://github.com/kiro-sheets-helper/wiki)