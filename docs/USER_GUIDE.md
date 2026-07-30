# Google Sheets Sorting Helper - User Guide

Welcome to the Google Sheets Sorting Helper! This comprehensive guide will help you master advanced sorting features and maximize productivity.

## Table of Contents
1. [Getting Started](#getting-started)
2. [Basic Sorting](#basic-sorting)
3. [Advanced Features](#advanced-features)
4. [Tips & Tricks](#tips--tricks)
5. [FAQ](#faq)
6. [Keyboard Shortcuts](#keyboard-shortcuts)

## Getting Started

### Installation

#### Chrome Extension
1. Open [Chrome Web Store](https://chrome.google.com/webstore)
2. Search for "Google Sheets Sorting Helper"
3. Click "Add to Chrome"
4. Click "Add extension" to confirm
5. Extension icon appears in toolbar

#### Google Workspace Add-on
1. Open any Google Sheet
2. Go to **Extensions** → **Add-ons** → **Get add-ons**
3. Search for "Google Sheets Sorting Helper"
4. Click the add-on
5. Click **Install**
6. Grant necessary permissions

### Initial Setup

1. Open extension options/settings
2. Configure preferences:
   - Enable/disable preview
   - Set default sort order
   - Adjust theme
3. Customize keyboard shortcuts if desired
4. Enable smart sort if you want AI recommendations

## Basic Sorting

### Quick Sort (Chrome Extension)

The quickest way to sort a single column:

1. **Select your data range** (including headers)
2. **Click extension icon** in toolbar
3. **Select column** to sort from dropdown
4. **Choose sort order**:
   - Ascending (A→Z, 1→9)
   - Descending (Z→A, 9→1)
5. **Click Sort**

**Keyboard shortcut**: `Ctrl+Shift+S`

### Basic Sort (Google Workspace Add-on)

1. **Select data range** in your sheet
2. **Open extension menu** → Click add-on name
3. **Choose column** from dropdown
4. **Select sort order**
5. **Click Sort** button
6. Review changes
7. Use **Undo** (Ctrl+Z) if needed

### Understanding Sort Results

After sorting, your data is rearranged based on your selection. Examples:

**Text Sort (A-Z)**:
```
Before: Zebra, Apple, Mango
After:  Apple, Mango, Zebra
```

**Number Sort (Low to High)**:
```
Before: 50, 100, 25
After:  25, 50, 100
```

**Date Sort (Chronological)**:
```
Before: 2024-03, 2024-01, 2024-02
After:  2024-01, 2024-02, 2024-03
```

## Advanced Features

### Multi-Column Sorting

Sort by multiple columns with priority levels:

1. **Open extension**
2. **Click "Advanced Sort"** button (or press `Ctrl+Shift+A`)
3. **Add sort criteria**:
   - Column 1: Primary sort
   - Column 2: Secondary sort (optional)
   - Column 3: Tertiary sort (optional)
4. **Set order for each**:
   - Ascending or Descending
5. **Preview** to see results (optional)
6. **Click Apply**

**Example**: Sort employee data by Department (A-Z), then by Salary (Highest to Lowest)
- Result: Employees grouped by department, sorted by salary within each group

### Sort Preview

Before applying a sort, see exactly how your data will change:

1. **Set up your sort criteria**
2. **Click "Preview"** button
3. **Review sample** of sorted data
4. Options:
   - **Apply**: Confirm and sort
   - **Cancel**: Keep original order
   - **Modify**: Change sort criteria

**Benefits**:
- Catch mistakes before applying
- Verify column selection
- Ensure data integrity
- Peace of mind

### Smart Sort (AI-Powered Recommendations)

Let the extension suggest optimal sorting:

1. **Select your data**
2. **Click Smart Sort** (or press `Ctrl+Shift+I`)
3. **Review recommendations**:
   - Extension analyzes data structure
   - Suggests logical sort order
   - Shows confidence score
4. **Accept or modify** suggestions
5. **Preview** if desired
6. **Apply**

**How Smart Sort works**:
- Analyzes data types and patterns
- Detects potential sort columns
- Prioritizes meaningful sorts
- Considers data completeness

**Example**: With employee data, Smart Sort might suggest:
- Primary: Department (logical grouping)
- Secondary: Salary (descending - highest first)
- Rationale: Groups by function, highest earners first

### Custom Sort Orders

Sort by non-alphabetical/non-numeric order:

**Common use cases**:
- Months (Jan, Feb, Mar) instead of alphabetical
- Priorities (High, Medium, Low)
- Sizes (XS, S, M, L, XL)
- Statuses (Planned, In Progress, Complete)

**Creating a custom order**:

1. **Open extension settings** (Options/Preferences)
2. **Go to Sorting tab**
3. **Click "Add Custom Order"**
4. **Name your order** (e.g., "Month Order")
5. **Define the order**:
   - Add each value in desired sequence
   - Remove values you don't need
6. **Save**
7. **Use in sort dialog** - select custom order from dropdown

**Using custom orders**:
1. Open sort dialog (Advanced Sort)
2. For your column, instead of Ascending/Descending
3. Select your custom order from dropdown
4. Apply sort

### Save Sort Templates

Save frequently-used sort configurations:

1. **Set up your sort criteria**
2. **Click "Save as Template"** button
3. **Name your template** (e.g., "Employee by Department")
4. **Add description** (optional)
5. **Click Save**

**Using saved templates**:
1. Open sort dialog
2. Click "Load Template"
3. Select your template
4. Click Load
5. Preview and apply

**Managing templates**:
- Options page → Templates tab
- View all templates
- Edit, delete, or export
- Import templates from others

### Sort History

Access previously applied sorts:

1. **Open extension popup**
2. **Click History** tab
3. **See recent sorts**:
   - Column sorted
   - Date applied
   - Data range
4. **Reapply** previous sort with one click

**Note**: History cleared after 30 days or manually

## Tips & Tricks

### Working with Headers

Headers are the first row identifying each column. Best practices:

**Enable auto-detection**:
1. Open settings
2. Check "Auto-detect header rows"
3. Headers won't be sorted, staying at top

**Manual header handling**:
1. Select data **excluding headers**
2. Headers remain at top
3. Sort applies only to data rows

**Multiple header rows**:
1. Freeze header rows first
2. Select only data below
3. Sort will skip frozen rows

### Handling Special Cases

**Merged cells**:
- ⚠️ Sorting with merged cells can cause issues
- Solution: Unmerge cells before sorting
- Or: Select around merged cells carefully

**Empty cells**:
- By default: Empty cells go to end
- Change in settings: "Place empty cells at end"
- Affects sort logic

**Mixed data types**:
- Column with both numbers and text
- Extension auto-detects and sorts appropriately
- Numbers typically sort before text
- Adjust in advanced settings if needed

**Duplicates**:
- Extension preserves original order for duplicates
- Stable sort: Equal values keep their sequence
- Disable "Stable sort" if original order doesn't matter

### Performance Tips

For large datasets (1000+ rows):

1. **Close unnecessary browser tabs** - frees memory
2. **Sort in segments** - break into smaller ranges
3. **Disable animations** - Settings → Display → Toggle off
4. **Use Chrome over other browsers** - slightly faster

### Data Backup

Always protect your data:

1. **Enable backup** - Settings → Data Management
   - Creates copy before sorting
   - Accessible via Edit → Version history
2. **Use Undo** - Ctrl+Z reverts last sort
3. **Save frequently** - Ctrl+S
4. **Test with sample data first**

## FAQ

### Q: How do I sort and keep associated rows together?
**A**: Use multi-column sort with your primary column first. Associated rows move together because they're part of the same rows.

### Q: Can I sort alphabetically within numeric sort?
**A**: Not directly in one sort, but you can:
1. Sort by numeric column first
2. Then sort by text column (secondary)
3. Preview to verify results

### Q: What if my sort didn't work?
**A**: Try these steps:
1. Undo (Ctrl+Z) to restore original
2. Check that headers are properly detected
3. Verify no merged cells in range
4. Ensure data range is selected
5. Try again

### Q: Can I sort multiple sheets at once?
**A**: No, sort one sheet at a time. But you can:
1. Set up sort on Sheet 1
2. Save as template
3. Apply same sort to Sheet 2 using template

### Q: How many columns can I sort by?
**A**: Officially up to 3 columns in one sort
- Primary, Secondary, Tertiary
- More columns: Do multiple sorts in sequence

### Q: What happens to formulas after sorting?
**A**: Formulas move with their rows
- Cell references update automatically
- Be careful with absolute references ($)
- Formulas recalculate after sort

### Q: Can I sort protected sheets?
**A**: Depends on protection settings:
- If sheet is protected but range isn't: Can sort
- If range is protected: Cannot sort
- Ask sheet owner for edit access

### Q: Is my data sent to external servers?
**A**: 
- Chrome Extension: No (all local)
- Workspace Add-on: Uses Google's servers only
- Your data never leaves Google's infrastructure
- Privacy is protected

### Q: How do I contact support?
**A**: 
- GitHub Issues: [Report bugs](https://github.com/kiro-sheets-helper/issues)
- Email: support@example.com
- Documentation: [Visit wiki](https://github.com/kiro-sheets-helper/wiki)

## Keyboard Shortcuts

| Action | Shortcut | 
|--------|----------|
| Quick Sort | Ctrl+Shift+S |
| Advanced Sort | Ctrl+Shift+A |
| Smart Sort | Ctrl+Shift+I |
| Open Popup | Ctrl+Shift+E |
| Undo Sort | Ctrl+Z |
| Save Sheet | Ctrl+S |

**Note**: Keyboard shortcuts work on Google Sheets pages only

### Customizing Shortcuts

1. **Chrome Extension**:
   - Open Options page
   - Shortcuts tab
   - Edit keyboard shortcuts
   - Save changes

2. **Google Workspace Add-on**:
   - Shortcuts can't be customized
   - Use default shortcuts only

## Troubleshooting Common Issues

### Extension not working
1. Refresh page (F5)
2. Ensure extension is enabled
3. Try on different sheet
4. Reinstall if problems persist

### Sort seems incorrect
1. Check data format (might be treating numbers as text)
2. Verify headers are excluded
3. Look for hidden rows or columns
4. Try manual sort to compare

### Performance issues
1. Close other browser tabs
2. Reduce dataset size
3. Disable animations
4. Switch to Chrome browser

### Permission errors
1. Re-authorize extension
2. Check Gmail account permissions
3. Ensure Google Sheets API access
4. Clear browser cache

## Best Practices

1. **Always preview** before applying sorts
2. **Protect important data** - create backups
3. **Test with sample data** first
4. **Keep data clean** - consistent formatting
5. **Document your sorts** - use templates
6. **Save templates** for repeated operations
7. **Monitor performance** - split large datasets
8. **Use descriptions** - for template clarity

## Getting Help

Need more information?
- 📖 [Full Documentation](https://github.com/kiro-sheets-helper/wiki)
- 🐛 [Report Issues](https://github.com/kiro-sheets-helper/issues)
- 💬 [Community Forum](https://github.com/kiro-sheets-helper/discussions)
- 📧 [Email Support](mailto:support@example.com)

---

**Version**: 1.0.0  
**Last Updated**: 2024