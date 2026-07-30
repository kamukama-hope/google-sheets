# Troubleshooting Guide & FAQ

This guide helps resolve common issues and answers frequently asked questions about the Google Sheets Sorting Helper.

## Table of Contents
1. [Installation Issues](#installation-issues)
2. [Functionality Issues](#functionality-issues)
3. [Performance Issues](#performance-issues)
4. [Data & Security Issues](#data--security-issues)
5. [Advanced Troubleshooting](#advanced-troubleshooting)
6. [FAQ](#faq)

## Installation Issues

### Issue: Extension not appearing in Chrome toolbar

**Symptoms**:
- Can't find extension icon after installation
- Extension seems to be missing

**Solutions**:

1. **Check if extension is enabled**
   ```
   1. Go to chrome://extensions/
   2. Look for "Google Sheets Sorting Helper"
   3. Verify toggle is ON (blue)
   ```

2. **Show extension icon**
   ```
   1. Click puzzle piece icon (top right)
   2. Find "Google Sheets Sorting Helper"
   3. Click pin to show in toolbar
   ```

3. **Reinstall extension**
   ```
   1. Go to chrome://extensions/
   2. Click "Remove" on the extension
   3. Go to Chrome Web Store
   4. Search for "Google Sheets Sorting Helper"
   5. Click "Add to Chrome"
   ```

### Issue: "Permission denied" when installing

**Symptoms**:
- Error message during installation
- Can't complete installation process

**Solutions**:

1. **Check Google account**
   - Ensure you're signed into a Google account
   - Switch accounts if needed

2. **Clear browser cache**
   ```
   Ctrl+Shift+Delete (or Cmd+Shift+Delete on Mac)
   Select "All time"
   Check "Cookies and other site data"
   Click "Clear data"
   ```

3. **Try incognito mode**
   - Open Chrome in incognito mode (Ctrl+Shift+N)
   - Try installing again
   - If works, may be extension conflict

### Issue: Add-on not appearing in Google Sheets

**Symptoms**:
- Extensions → Add-ons shows nothing
- Add-on not found when searching

**Solutions**:

1. **Verify installation**
   - Go to Extensions → Manage add-ons
   - Look for "Google Sheets Sorting Helper"
   - If listed but inactive, click to enable

2. **Refresh the sheet**
   - Close and reopen Google Sheets tab
   - Try creating a new sheet
   - Give add-on 30 seconds to load

3. **Check admin permissions** (for Workspace users)
   - Workspace admins may restrict add-on access
   - Contact your workspace administrator
   - Request to allowlist the add-on

## Functionality Issues

### Issue: "Sorting not working" / No changes occur

**Symptoms**:
- Click sort but data doesn't change
- No error message, but nothing happens

**Troubleshooting steps**:

1. **Check data selection**
   ```
   ✓ Correct: Select entire data range A1:E20
   ✗ Wrong: Don't select one cell
   ✗ Wrong: Don't select only column header
   ```

2. **Verify headers are detected**
   ```
   Open Settings → Sorting
   Check "Auto-detect header rows"
   Headers should be recognized
   ```

3. **Look for merged cells**
   - Google Sheets may prevent sort with merged cells
   - Unmerge cells first (Format → Merge cells → Unmerge)
   - Then try sorting again

4. **Check for filter**
   - If sheet has active filter, may interfere
   - Data → Create a filter → Remove all filters
   - Try sorting again

5. **Verify column exists**
   - Ensure selected column has data
   - Column shouldn't be completely empty
   - Try different column

6. **Check for protected cells**
   ```
   Data → Protect cells or sheets
   If protected, request edit access from owner
   ```

**If still not working**:
- Try manual sort (Google's built-in)
- Clear browser cache
- Reinstall extension
- Contact support

### Issue: Sort applies to wrong columns

**Symptoms**:
- Selected column A but column B was sorted
- Data mixed up after sort

**Troubleshooting**:

1. **Verify column selection**
   - Check column header carefully
   - Ensure you selected correct column name
   - Try again with correct column

2. **Check for hidden columns**
   ```
   Select all columns
   Right-click → Show columns
   Any hidden columns might affect sorting
   ```

3. **Verify sort criteria**
   - Close and reopen sort dialog
   - Double-check column selection
   - Preview before applying

### Issue: Preview doesn't match actual result

**Symptoms**:
- Preview shows one way, result shows different way
- Data order changed unexpectedly

**Solutions**:

1. **Check data between preview and apply**
   - Don't edit data between preview and apply
   - Apply immediately after preview
   - Avoid refreshing page

2. **Verify no concurrent changes**
   - If collaborating: Check if others editing
   - Wait for other users to finish
   - Then retry sort

3. **Check sort criteria stability**
   - If data changed: Re-do sort
   - Stable sort preserves equal values' order
   - May look different with new data

### Issue: Keyboard shortcuts not working

**Symptoms**:
- Ctrl+Shift+S doesn't open sort
- Shortcuts appear disabled

**Solutions**:

1. **Check if shortcuts are enabled**
   ```
   For Chrome Extension:
   1. Open Options (right-click extension → Options)
   2. Go to Shortcuts tab
   3. Verify "Enable keyboard shortcuts" is checked
   ```

2. **Verify on correct page**
   - Shortcuts only work on Google Sheets
   - Open https://sheets.google.com
   - Try shortcut again

3. **Check for conflicting shortcuts**
   - Other extensions may use same shortcuts
   - Go to chrome://extensions/shortcuts
   - Reassign conflicting shortcuts

4. **Try different shortcut**
   - If Ctrl+Shift+S taken by system
   - Customize shortcut in Options
   - Assign different key combination

## Performance Issues

### Issue: Sorting is very slow

**Symptoms**:
- Takes 10+ seconds to sort
- Browser feels unresponsive

**Troubleshooting**:

1. **Check dataset size**
   - Over 10,000 rows may be slow
   - Close other Chrome tabs to free RAM
   - Disable animations (Settings → Display)

2. **Reduce dataset**
   - Sort smaller ranges instead
   - Break into multiple sheets
   - Archive old data to separate sheet

3. **Close other applications**
   - Close other browsers
   - Close heavy applications
   - Restart computer if needed

4. **Clear browser cache**
   ```
   Ctrl+Shift+Delete
   Select "All time"
   Click "Clear data"
   Restart Chrome
   ```

5. **Try different browser**
   - Chrome typically fastest
   - Try Edge or Firefox
   - Compare performance

### Issue: "Out of memory" or crash

**Symptoms**:
- Browser tab crashes during sort
- "Aw, snap!" error appears
- Computer becomes unresponsive

**Solutions**:

1. **Reduce dataset size**
   - Split into smaller ranges
   - Archive old data first
   - Sort smaller portions separately

2. **Close other applications**
   - Free up system RAM
   - Close browser tabs
   - Restart computer

3. **Disable heavy features**
   - Settings → Display → Disable animations
   - Disable analytics tracking if not needed
   - Settings → Sorting → Disable Smart Sort

4. **Use different computer**
   - If on old laptop, try newer computer
   - Performance varies by hardware
   - Consider memory upgrade

## Data & Security Issues

### Issue: Data appears corrupted after sort

**Symptoms**:
- Data values mixed up or missing
- Rows don't align properly

**Recovery steps**:

1. **Undo immediately**
   ```
   Ctrl+Z
   Or Edit → Undo
   ```

2. **Use version history**
   ```
   File → Version history → See version history
   Select version before sort
   Restore to that version
   ```

3. **Check for merged cells**
   - Merged cells can cause misalignment
   - Unmerge and retry

4. **Report issue if persists**
   - Provide:
     - Dataset sample
     - Sort criteria used
     - Screenshots
   - Contact support@example.com

### Issue: Permission/Authorization errors

**Symptoms**:
- "Not authorized" messages
- OAuth flow fails
- Can't access spreadsheet

**Solutions**:

1. **Re-authorize extension**
   ```
   Chrome Extension:
   1. Right-click extension → Options
   2. Click "Disconnect account"
   3. Click "Connect account"
   4. Grant permissions when prompted
   ```

2. **Check Google account permissions**
   ```
   1. Go to myaccount.google.com/permissions
   2. Find "Google Sheets Sorting Helper"
   3. Click to view/modify permissions
   4. Grant Sheet access if needed
   ```

3. **Clear cookies and cache**
   ```
   Ctrl+Shift+Delete
   Clear all cookies and cache
   Sign out and back in
   ```

4. **Try different account**
   - May be account-specific issue
   - Use different Google account
   - See if permission error recurs

### Issue: Privacy concerns / Data privacy

**Symptoms**:
- Worried about data being sent elsewhere
- Concerned about privacy practices

**Reassurance**:

✅ **Chrome Extension**:
- All processing happens locally in your browser
- No data sent to external servers
- Only sheets.google.com receives your data
- Analytics are anonymous (can be disabled)

✅ **Google Workspace Add-on**:
- Uses Google's secure infrastructure
- Data stays within Google Sheets
- Never sent to third parties
- Enterprise-grade security

**To disable analytics**:
1. Chrome Extension: Options → General → Uncheck "Enable analytics"
2. Workspace Add-on: Cannot be disabled (controlled by Google)

## Advanced Troubleshooting

### Enable debug mode (Chrome Extension)

1. **Open Options page**
   - Right-click extension → Options
   - Scroll to "About" tab

2. **Click "Developer Tools"**
   - Opens console with debug info

3. **Check console for errors**
   - Press F12 in console
   - Look for red error messages
   - Take screenshots for support team

### View extension logs

```
1. Go to chrome://extensions/
2. Find "Google Sheets Sorting Helper"
3. Click "Details"
4. Scroll down to "Inspect views"
5. Click "background.html" or "service_worker"
6. Console tab shows logs
```

### Check service worker status

```
1. Go to chrome://extensions/
2. Enable "Developer mode"
3. Look for service worker status
4. "inactive" = normal
5. Errors shown if problem exists
```

### Reset extension

**Warning**: This clears all settings

```
1. Go to chrome://extensions/
2. Click "Remove" on extension
3. Go to Chrome Web Store
4. Reinstall fresh
5. Reconfigure settings
```

### Report a bug

**When reporting**:
1. Screenshot of error
2. Steps to reproduce
3. Browser version (chrome://version/)
4. Extension version (chrome://extensions/)
5. Google Sheets URL (sanitized)
6. Expected vs actual behavior

**Report to**:
- GitHub: https://github.com/kiro-sheets-helper/issues
- Email: support@example.com
- Include above information

## FAQ

### Q: Is the extension free?
**A**: Yes, completely free. No hidden costs or premium features.

### Q: Does it work offline?
**A**: No, requires internet connection and Google Sheets access.

### Q: Can I sort shared sheets?
**A**: Yes, if you have edit access. Read-only sheets cannot be sorted.

### Q: Does sorting affect formulas?
**A**: Formulas move with their rows. References update automatically (unless absolute $).

### Q: What's the maximum dataset size?
**A**: Technically unlimited, but very large datasets (100K+ rows) may be slow.

### Q: Can I sort multiple sheets at once?
**A**: No, one sheet at a time. Use templates to apply same sort to multiple sheets.

### Q: Is there an undo/redo?
**A**: Yes, Ctrl+Z to undo. Use version history to restore previous states.

### Q: Can I sort by multiple criteria at once?
**A**: Yes, up to 3 levels in Advanced Sort (Primary, Secondary, Tertiary).

### Q: What happens to my sort history?
**A**: Cleared after 30 days or manually. Stored locally, not sent anywhere.

### Q: Does it work on mobile?
**A**: Not yet. Desktop browsers only (Chrome, Firefox, Safari, Edge).

### Q: Can I export my templates?
**A**: Yes, Options → Templates → Export Templates. Share .json file with others.

### Q: How do I uninstall?
**A**: Chrome: chrome://extensions/ → Remove. Workspace Add-on: Extensions → Manage add-ons → Remove.

### Q: Is there a version for Excel?
**A**: Not currently. Google Sheets only. Future versions may support Excel.

### Q: Can I customize the UI?
**A**: Limited options in Settings. More customization planned for future versions.

### Q: Who maintains this?
**A**: Community-driven open-source project. Active maintainers and contributors.

### Q: How often are updates released?
**A**: Monthly updates with bug fixes. Major features quarterly.

### Q: Where's the source code?
**A**: GitHub: https://github.com/kiro-sheets-helper (Open source MIT License)

### Q: Can I contribute?
**A**: Yes! See CONTRIBUTING.md in repository. Pull requests welcome.

---

**Can't find answer here?**

- 📖 [Full Documentation](https://github.com/kiro-sheets-helper/wiki)
- 💬 [Community Discussions](https://github.com/kiro-sheets-helper/discussions)
- 🐛 [GitHub Issues](https://github.com/kiro-sheets-helper/issues)
- 📧 [Email Support](mailto:support@example.com)

**Last Updated**: 2024  
**Version**: 1.0.0