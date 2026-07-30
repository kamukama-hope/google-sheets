# Development Setup Guide

This guide will help you set up the Google Sheets Sorting Helper development environment.

## Prerequisites

### Required Software
- **Node.js 18+** and **npm** - [Download here](https://nodejs.org/)
- **Google Account** with Google Apps Script access
- **Chrome Browser** for extension testing

### Optional Tools
- **VS Code** with Google Apps Script extension
- **Git** for version control

## Initial Setup

### 1. Clone and Install Dependencies

```bash
# Clone the repository (or download the project files)
cd google-sheets-sorting-helper

# Install dependencies (may take a few minutes)
npm install

# If npm install fails, try:
npm install --legacy-peer-deps
```

### 2. Google Apps Script Setup

```bash
# Install clasp globally (Google Apps Script CLI)
npm install -g @google/clasp

# Login to your Google account
clasp login

# This will open a browser window for authentication
# Grant the requested permissions
```

### 3. Create Google Apps Script Project

```bash
# Navigate to the workspace-addon directory
cd workspace-addon

# Create a new Apps Script project
clasp create --type webapp --title "Sheets Sorting Helper"

# This creates .clasp.json with your project settings
```

### 4. Deploy the Workspace Add-on

```bash
# Push your code to Google Apps Script
clasp push

# Deploy the add-on
clasp deploy --description "Initial deployment"

# Open the project in the online editor (optional)
clasp open
```

## Chrome Extension Setup

### 1. Build the Extension

```bash
# From the project root
cd chrome-extension

# Install extension dependencies
npm install

# Build the extension
npm run build
```

### 2. Load Extension in Chrome

1. Open Chrome and navigate to `chrome://extensions/`
2. Enable "Developer mode" (toggle in top right)
3. Click "Load unpacked"
4. Select the `chrome-extension` folder
5. The extension should now appear in your extensions list

### 3. Configure OAuth (Optional)

For full Chrome extension functionality, you'll need to set up OAuth:

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable the Google Sheets API
4. Create OAuth 2.0 credentials
5. Add your extension ID to authorized origins
6. Update `chrome-extension/manifest.json` with your client ID

## Development Workflow

### Workspace Add-on Development

```bash
# Make changes to workspace-addon/Code.js or other files
cd workspace-addon

# Push changes to Apps Script
clasp push

# Test in Google Sheets by:
# 1. Opening any Google Sheet
# 2. Go to Extensions → Apps Script
# 3. Your add-on should appear
```

### Chrome Extension Development

```bash
# Make changes to chrome-extension files
cd chrome-extension

# Rebuild the extension
npm run build

# In Chrome:
# 1. Go to chrome://extensions/
# 2. Click the reload icon for your extension
# 3. Test on a Google Sheets page
```

### Testing Changes

1. **Workspace Add-on**: Open any Google Sheet, the add-on should appear in the sidebar or Extensions menu
2. **Chrome Extension**: Visit `docs.google.com/spreadsheets`, the floating action button should appear

## Project Structure Explanation

```
├── workspace-addon/           # Google Workspace Add-on
│   ├── Code.js               # Main add-on logic
│   ├── appsscript.json       # Add-on configuration
│   └── .clasp.json           # Apps Script project settings (auto-generated)
├── chrome-extension/         # Chrome Extension
│   ├── manifest.json         # Extension manifest
│   ├── background/           # Service worker
│   ├── content/             # Content scripts (injected into Sheets)
│   ├── popup/               # Extension popup UI
│   └── shared/              # Shared utilities (copied from ../shared)
├── shared/                   # Common code used by both
│   └── sorting-algorithms.js # Core sorting logic
└── docs/                    # Documentation
```

## Common Issues and Solutions

### Apps Script Issues

**"clasp: command not found"**
```bash
npm install -g @google/clasp
```

**"User has not enabled the Apps Script API"**
1. Go to https://script.google.com/home/usersettings
2. Enable the Apps Script API

**"Push failed" or permission errors**
```bash
clasp login --creds credentials.json  # Use service account if needed
```

### Chrome Extension Issues

**"Extensions developer mode required"**
1. Go to chrome://extensions/
2. Toggle "Developer mode" in the top right

**"Extension failed to load"**
1. Check the console for errors
2. Verify manifest.json syntax
3. Ensure all referenced files exist

**OAuth errors**
1. Check client ID in manifest.json
2. Verify OAuth scopes
3. Ensure extension ID is added to OAuth settings

### General Development Issues

**Node.js/npm issues**
```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

**File permission issues (Windows)**
1. Run command prompt as Administrator
2. Or use PowerShell with execution policy: `Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser`

## Next Steps

Once setup is complete:

1. **Test the Basic Functionality**: Open a Google Sheet and try the add-on
2. **Explore the Code**: Start with `workspace-addon/Code.js` and `shared/sorting-algorithms.js`
3. **Make Your First Change**: Modify a UI element or add a console.log statement
4. **Read the Documentation**: Check out the other files in the `docs/` folder

## Getting Help

- Check the main [README.md](../README.md) for general information
- Look at the [API Reference](API.md) for technical details
- Create an issue if you encounter problems during setup