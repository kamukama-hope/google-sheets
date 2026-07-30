# Google Sheets API Integration

This document explains how the Google Sheets Sorting Helper integrates with Google Sheets API for both the Workspace Add-on and Chrome Extension.

## Architecture Overview

### Workspace Add-on Integration
- **Direct Access**: Uses Apps Script's built-in SpreadsheetApp service
- **Authentication**: Automatic through Google Apps Script runtime
- **Permissions**: Configured in `appsscript.json` manifest
- **Data Flow**: Direct JavaScript calls to Sheets services

### Chrome Extension Integration
- **API Access**: Uses Google Sheets API v4 via REST calls
- **Authentication**: OAuth 2.0 with user consent
- **Permissions**: Configured in extension manifest
- **Data Flow**: HTTPS requests with Bearer token authentication

## API Methods Implementation

### Common Operations

#### 1. Get Range Data
**Workspace Add-on:**
```javascript
const range = sheet.getRange('A1:C10');
const values = range.getValues();
```

**Chrome Extension:**
```javascript
const response = await sheetsAPIClient.getValues(spreadsheetId, 'A1:C10');
const values = response.values;
```

#### 2. Set Range Data
**Workspace Add-on:**
```javascript
range.setValues(newValues);
```

**Chrome Extension:**
```javascript
await sheetsAPIClient.updateValues(spreadsheetId, 'A1:C10', newValues);
```

#### 3. Analyze Data Structure
Both implementations use the shared `analyzeDataStructure()` function but get data differently:

**Workspace Add-on:**
```javascript
const rangeData = sheetsAPI.getRangeData(range);
const analysis = sheetsAPI.analyzeDataStructure(rangeData.values, hasHeaders);
```

**Chrome Extension:**
```javascript
const analysis = await sheetsAPIClient.analyzeRange(spreadsheetId, range);
```

## Authentication & Permissions

### Workspace Add-on Permissions
Required OAuth scopes in `appsscript.json`:
```json
{
  "oauthScopes": [
    "https://www.googleapis.com/auth/spreadsheets",
    "https://www.googleapis.com/auth/script.container.ui",
    "https://www.googleapis.com/auth/script.storage"
  ]
}
```

### Chrome Extension Permissions
Required permissions in `manifest.json`:
```json
{
  "permissions": ["activeTab", "identity"],
  "host_permissions": [
    "https://docs.google.com/*",
    "https://sheets.google.com/*"
  ],
  "oauth2": {
    "client_id": "YOUR_CLIENT_ID.apps.googleusercontent.com",
    "scopes": [
      "https://www.googleapis.com/auth/spreadsheets"
    ]
  }
}
```

## Error Handling

### Common Error Types
1. **Authentication Errors** - Token expired or invalid
2. **Permission Errors** - Insufficient access to spreadsheet
3. **API Limit Errors** - Rate limiting or quota exceeded
4. **Data Validation Errors** - Invalid ranges or data formats

### Retry Logic
Both implementations include retry logic with exponential backoff:
```javascript
for (let attempt = 0; attempt < maxRetries; attempt++) {
  try {
    return await apiCall();
  } catch (error) {
    if (attempt < maxRetries - 1) {
      await wait(retryDelay * (attempt + 1));
    }
  }
}
```

## Data Type Detection

Both implementations use the shared data type detection logic:

### Supported Data Types
- **Numbers**: Integers, decimals, currency
- **Dates**: Various date formats (MM/DD/YYYY, YYYY-MM-DD, etc.)
- **Text**: All string data
- **Boolean**: true/false, yes/no variants
- **Empty**: Null, undefined, empty strings

### Detection Algorithm
```javascript
function detectDataType(value) {
  if (isEmpty(value)) return 'empty';
  if (typeof value === 'boolean') return 'boolean';
  if (typeof value === 'number') return 'number';
  if (isDateString(value)) return 'date';
  return 'text';
}
```

## Performance Considerations

### Workspace Add-on
- **Advantages**: Direct API access, no network latency
- **Limitations**: Apps Script execution time limits (6 minutes max)
- **Optimization**: Batch operations, minimize API calls

### Chrome Extension
- **Advantages**: No execution time limits, more flexible UI
- **Limitations**: Network latency, API rate limits
- **Optimization**: Batch API requests, token caching

### Best Practices
1. **Batch Operations**: Use `batchGet` and `batchUpdate` for multiple ranges
2. **Minimize API Calls**: Cache data when possible
3. **Error Recovery**: Implement proper retry logic
4. **User Feedback**: Show progress indicators for long operations

## Testing API Integration

### Unit Testing
```bash
# Test basic sorting algorithms
npm run test-sorting

# Test API utilities
npm run test
```

### Manual Testing Steps
1. **Workspace Add-on:**
   - Deploy to Apps Script
   - Open Google Sheets
   - Test add-on functionality

2. **Chrome Extension:**
   - Load unpacked extension
   - Navigate to Google Sheets
   - Test extension features

### Common Issues & Solutions

#### Issue: "User has not enabled Apps Script API"
**Solution:** Enable at https://script.google.com/home/usersettings

#### Issue: Extension OAuth errors
**Solution:** 
1. Check client ID in manifest
2. Verify OAuth configuration in Google Cloud Console
3. Ensure extension ID is whitelisted

#### Issue: Rate limiting errors
**Solution:**
1. Implement exponential backoff
2. Use batch operations
3. Cache frequently accessed data

## API Rate Limits

### Google Sheets API Quotas
- **Requests per 100 seconds per user**: 300
- **Requests per 100 seconds**: 30,000
- **Read requests per 100 seconds per user**: 300
- **Write requests per 100 seconds per user**: 300

### Mitigation Strategies
1. **Batch Operations**: Combine multiple operations
2. **Caching**: Store frequently accessed data
3. **Throttling**: Add delays between requests
4. **Error Handling**: Graceful degradation on quota exceeded

## Security Considerations

### Data Privacy
- **Principle of Least Privilege**: Request minimum required permissions
- **No External Storage**: All data processing happens locally or in Google's cloud
- **Secure Token Handling**: Tokens are managed by Chrome's identity API

### Best Practices
1. **Validate Input**: Check data ranges and formats
2. **Sanitize Data**: Clean user input before API calls
3. **Audit Logs**: Log important operations (where permitted)
4. **User Consent**: Clear permissions and data usage explanation