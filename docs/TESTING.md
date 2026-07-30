# Testing Guide

This guide provides comprehensive instructions for testing the Google Sheets Sorting Helper application across both the Workspace Add-on and Chrome Extension.

## Table of Contents
1. [Manual Testing](#manual-testing)
2. [Sample Data](#sample-data)
3. [Test Cases](#test-cases)
4. [Chrome Extension Testing](#chrome-extension-testing)
5. [Workspace Add-on Testing](#workspace-add-on-testing)
6. [Performance Testing](#performance-testing)
7. [Troubleshooting](#troubleshooting)

## Manual Testing

### Prerequisites
- Active Google account
- Google Sheets access
- For Chrome Extension: Chrome browser with extension loaded
- For Workspace Add-on: Apps Script project deployed

### Basic Setup
1. Create a new Google Sheet
2. Copy sample data from the [Sample Data](#sample-data) section
3. Follow the specific testing instructions for your component

## Sample Data

### Test Dataset 1: Employee Data
This dataset contains mixed data types and is useful for testing type detection.

```
Name,Department,Salary,Hire Date,Active
Alice Johnson,Engineering,95000,2020-01-15,Yes
Bob Smith,Sales,75000,2019-06-22,Yes
Charlie Wilson,Marketing,65000,2021-03-08,No
Diana Martinez,Engineering,105000,2018-11-30,Yes
Eve Brown,Finance,70000,2021-07-14,No
Frank Davis,Sales,72000,2019-04-10,Yes
Grace Lee,Engineering,98000,2020-09-25,Yes
Henry Taylor,HR,68000,2020-02-28,Yes
```

### Test Dataset 2: Sales Data
This dataset is designed for testing multi-column sorting and large datasets.

```
Month,Region,Product,Sales,Profit,Units Sold
January,North,Laptop,45000,9000,30
January,South,Desktop,32000,6400,20
January,East,Tablet,28000,5600,40
February,North,Laptop,52000,10400,35
February,South,Phone,38000,7600,50
February,East,Laptop,41000,8200,28
March,North,Desktop,39000,7800,25
March,South,Laptop,48000,9600,32
March,East,Phone,35000,7000,45
```

### Test Dataset 3: Student Grades
This dataset contains academic information for testing date sorting and number sorting.

```
Student Name,Math Grade,English Grade,Science Grade,Exam Date,GPA
Alice Kim,95,92,97,2024-01-15,3.94
Bob Jones,88,85,90,2024-01-15,3.54
Charlie Brown,92,88,95,2024-01-16,3.77
Diana Prince,98,95,99,2024-01-16,3.97
Eve Wilson,85,90,87,2024-01-17,3.54
Frank Miller,90,92,88,2024-01-17,3.67
Grace Young,93,96,91,2024-01-18,3.73
```

### Test Dataset 4: Event Schedule
This dataset is optimized for date and time-based sorting.

```
Event Name,Date,Time,Location,Attendees,Completed
Annual Meeting,2024-03-15,09:00 AM,Conference Room A,45,Yes
Q1 Review,2024-03-10,02:00 PM,Virtual,30,Yes
Team Building,2024-03-20,03:00 PM,Downtown Hall,50,No
Board Meeting,2024-03-22,10:00 AM,Board Room,12,No
Training Session,2024-03-18,01:00 PM,Room 201,25,No
```

## Test Cases

### Basic Sorting Tests

#### Test 1.1: Single Column Ascending Sort
**Dataset**: Employee Data  
**Action**: Sort by Name (A-Z)  
**Expected Result**: Names appear in alphabetical order (Alice → Henry)  
**Status**: ✓ Pass / ✗ Fail

#### Test 1.2: Single Column Descending Sort
**Dataset**: Employee Data  
**Action**: Sort by Salary (Z-A / Highest to Lowest)  
**Expected Result**: Salaries appear in descending order (105000 → 65000)  
**Status**: ✓ Pass / ✗ Fail

#### Test 1.3: Numeric Column Sort
**Dataset**: Sales Data  
**Action**: Sort by Sales amount  
**Expected Result**: Sales figures are properly ordered numerically  
**Status**: ✓ Pass / ✗ Fail

#### Test 1.4: Date Column Sort
**Dataset**: Student Grades  
**Action**: Sort by Exam Date  
**Expected Result**: Dates are sorted chronologically  
**Status**: ✓ Pass / ✗ Fail

### Multi-Column Sorting Tests

#### Test 2.1: Two-Level Sort
**Dataset**: Sales Data  
**Action**: Sort by Region (primary), then by Sales (secondary, descending)  
**Expected Result**: Data groups by region, with sales descending within each group  
**Status**: ✓ Pass / ✗ Fail

#### Test 2.2: Three-Level Sort
**Dataset**: Sales Data  
**Action**: Sort by Month → Region → Product  
**Expected Result**: Properly nested grouping at all three levels  
**Status**: ✓ Pass / ✗ Fail

### Data Type Detection Tests

#### Test 3.1: Mixed Type Detection
**Dataset**: Employee Data  
**Action**: Open sort dialog  
**Expected Result**: Each column's data type is correctly identified (Text, Number, Date, Boolean)  
**Status**: ✓ Pass / ✗ Fail

#### Test 3.2: Header Detection
**Dataset**: Any with headers  
**Action**: Open sort dialog  
**Expected Result**: First row is identified as headers and not included in sort  
**Status**: ✓ Pass / ✗ Fail

### Preview Functionality Tests

#### Test 4.1: Sort Preview Display
**Dataset**: Employee Data  
**Action**: Sort by Department, click Preview  
**Expected Result**: Shows sample of sorted data without applying changes  
**Status**: ✓ Pass / ✗ Fail

#### Test 4.2: Cancel After Preview
**Dataset**: Employee Data  
**Action**: Preview sort, then click Cancel  
**Expected Result**: Original data order is preserved  
**Status**: ✓ Pass / ✗ Fail

### Custom Sort Order Tests

#### Test 5.1: Month Sort Order
**Dataset**: Sales Data  
**Action**: Sort by Month using custom order (Jan, Feb, Mar, etc.)  
**Expected Result**: Months appear in calendar order, not alphabetical  
**Status**: ✓ Pass / ✗ Fail

#### Test 5.2: Priority Sort Order
**Dataset**: Create data with priorities  
**Action**: Sort by Priority (High, Medium, Low)  
**Expected Result**: Custom priority order is respected  
**Status**: ✓ Pass / ✗ Fail

### Error Handling Tests

#### Test 6.1: Empty Selection
**Dataset**: Employee Data  
**Action**: Attempt to sort without selecting data  
**Expected Result**: Helpful error message, no crash  
**Status**: ✓ Pass / ✗ Fail

#### Test 6.2: Single Row
**Dataset**: Create sheet with only headers  
**Action**: Attempt to sort  
**Expected Result**: Either prevents sort or handles gracefully  
**Status**: ✓ Pass / ✗ Fail

#### Test 6.3: Merged Cells
**Dataset**: Create data with merged cells  
**Action**: Attempt to sort  
**Expected Result**: Clear warning or prevention of sort with merged cells  
**Status**: ✓ Pass / ✗ Fail

### Performance Tests

#### Test 7.1: Large Dataset Sort (1000 rows)
**Dataset**: Generate 1000 rows of data  
**Action**: Sort by multiple columns  
**Expected Result**: Completes within reasonable time (< 2 seconds)  
**Status**: ✓ Pass / ✗ Fail

#### Test 7.2: Large Dataset Sort (10000 rows)
**Dataset**: Generate 10000 rows of data  
**Action**: Sort by single column  
**Expected Result**: Completes successfully, no memory issues  
**Status**: ✓ Pass / ✗ Fail

## Chrome Extension Testing

### Installation Testing

1. **Load Unpacked Extension**
   ```bash
   1. Open chrome://extensions/
   2. Enable Developer mode
   3. Click "Load unpacked"
   4. Select chrome-extension folder
   5. Verify extension appears and is enabled
   ```

2. **Popup Testing**
   - Click extension icon
   - Verify popup displays correctly
   - Check all buttons are functional
   - Test connection status display

3. **Context Menu Testing**
   - Right-click on Google Sheets page
   - Verify context menu appears
   - Test "Sort Selected Range" option
   - Test "Quick Sort" variations

4. **Keyboard Shortcut Testing**
   - Test Ctrl+Shift+S (Quick Sort)
   - Test Ctrl+Shift+A (Advanced Sort)
   - Test Ctrl+Shift+I (Smart Sort)
   - Test Ctrl+Shift+E (Open Popup)

### Options Page Testing

1. Navigate to extension options page
2. Test each tab loads correctly
3. Verify all settings save properly
4. Test import/export functionality
5. Check analytics display works

## Workspace Add-on Testing

### Deployment Testing

1. **Deploy Add-on**
   ```bash
   cd workspace-addon
   clasp push
   clasp deploy
   ```

2. **Test in Google Sheets**
   - Open any Google Sheet
   - Go to Extensions → Apps Script
   - Verify add-on appears in menu
   - Click to open sidebar

3. **UI Interaction**
   - Test main card displays
   - Verify column selection dropdown works
   - Test sort order radio buttons
   - Check preview button functionality

## Performance Testing

### Sorting Speed Benchmarks

**Test Environment**: Chrome browser, 8GB RAM

| Dataset Size | Columns | Criteria | Expected Time |
|---|---|---|---|
| 100 rows | 5 | 1 | < 100ms |
| 1000 rows | 5 | 1 | < 500ms |
| 10000 rows | 5 | 1 | < 2000ms |
| 1000 rows | 10 | 3 | < 1000ms |

### Memory Usage

Monitor memory consumption during:
- Loading large sheets
- Performing sorts
- Opening dialogs
- Analytics tracking

## Browser Compatibility Testing

### Chrome Extension
- [ ] Chrome 90+
- [ ] Edge 90+
- [ ] Brave
- [ ] Opera

### Workspace Add-on
- [ ] Chrome
- [ ] Firefox
- [ ] Safari
- [ ] Edge

## Troubleshooting

### Common Issues

**Issue**: Extension not appearing in Chrome
- Solution: Verify extension is enabled in chrome://extensions/
- Check manifest.json syntax
- Clear browser cache

**Issue**: "Permission denied" errors
- Solution: Verify OAuth credentials are correct
- Check permissions in manifest.json
- Ensure Google Sheets API is enabled

**Issue**: Sorts not applying correctly
- Solution: Check data format consistency
- Verify headers are properly detected
- Check for merged cells or special formatting

**Issue**: Performance issues with large datasets
- Solution: Reduce number of rows in view
- Close unnecessary browser tabs
- Check for browser extensions that might interfere

## Automated Testing

For continuous integration, run:
```bash
npm test
npm run test-sorting
```

## Regression Testing Checklist

After any code changes, verify:
- [ ] Basic single-column sort works
- [ ] Multi-column sort works
- [ ] Preview functionality works
- [ ] Custom sort orders work
- [ ] Error handling is intact
- [ ] UI displays correctly
- [ ] No console errors
- [ ] Performance is acceptable
- [ ] All keyboard shortcuts work
- [ ] Options page saves settings

## Test Report Template

```
Date: _______________
Tester: _______________
Version: _______________

Test Case Results:
✓ Test 1.1: _____________
✓ Test 1.2: _____________
✗ Test 1.3: _____________

Issues Found:
1. [Description]
   Severity: High/Medium/Low
   Steps to reproduce: ...
   
Performance Metrics:
- Average sort time: ___ms
- Memory usage: ___MB
- Browser: _______________

Sign-off:
Approved by: _______________ Date: _______________
```

## Continuous Testing Strategy

1. **Manual Testing**: Every release candidate
2. **Automated Tests**: On every commit
3. **Performance Tests**: Weekly
4. **Browser Compatibility**: Monthly
5. **User Acceptance Testing**: Before major releases