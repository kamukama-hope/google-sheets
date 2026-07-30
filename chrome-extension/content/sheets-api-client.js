/**
 * Google Sheets API Client for Chrome Extension
 * Handles API calls to Google Sheets from the content script
 */

class SheetsAPIClient {
  constructor() {
    this.apiBase = 'https://sheets.googleapis.com/v4/spreadsheets';
    this.token = null;
    this.tokenExpiryTime = null;
    this.maxRetries = 3;
    this.retryDelay = 1000;
  }

  /**
   * Initialize the API client with authentication
   * @return {Promise<boolean>} Success status
   */
  async initialize() {
    try {
      await this.refreshToken();
      return true;
    } catch (error) {
      console.error('Failed to initialize Sheets API client:', error);
      return false;
    }
  }

  /**
   * Get or refresh the authentication token
   * @return {Promise<string>} Access token
   */
  async refreshToken() {
    return new Promise((resolve, reject) => {
      // Check if current token is still valid
      if (this.token && this.tokenExpiryTime && Date.now() < this.tokenExpiryTime - 60000) {
        resolve(this.token);
        return;
      }

      // Request new token from background script
      chrome.runtime.sendMessage({ action: 'getAuthToken' }, (response) => {
        if (chrome.runtime.lastError) {
          reject(new Error(chrome.runtime.lastError.message));
          return;
        }

        if (response.success) {
          this.token = response.token;
          // Tokens typically expire in 1 hour, we'll refresh 5 minutes early
          this.tokenExpiryTime = Date.now() + (55 * 60 * 1000);
          resolve(this.token);
        } else {
          reject(new Error(response.error || 'Failed to get auth token'));
        }
      });
    });
  }

  /**
   * Make an authenticated API request
   * @param {string} endpoint - API endpoint
   * @param {Object} options - Request options
   * @return {Promise<Object>} API response
   */
  async makeRequest(endpoint, options = {}) {
    let lastError;
    
    for (let attempt = 0; attempt < this.maxRetries; attempt++) {
      try {
        await this.refreshToken();
        
        const requestOptions = {
          ...options,
          headers: {
            'Authorization': `Bearer ${this.token}`,
            'Content-Type': 'application/json',
            ...options.headers
          }
        };

        const response = await fetch(endpoint, requestOptions);
        
        if (response.status === 401) {
          // Token expired, try to refresh
          this.token = null;
          this.tokenExpiryTime = null;
          continue;
        }

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(`HTTP ${response.status}: ${errorData.error?.message || response.statusText}`);
        }

        return await response.json();
      } catch (error) {
        lastError = error;
        if (attempt < this.maxRetries - 1) {
          await new Promise(resolve => setTimeout(resolve, this.retryDelay * (attempt + 1)));
        }
      }
    }

    throw lastError;
  }

  /**
   * Extract spreadsheet ID from current URL
   * @return {string|null} Spreadsheet ID
   */
  getSpreadsheetId() {
    const match = window.location.href.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
    return match ? match[1] : null;
  }

  /**
   * Get spreadsheet metadata
   * @param {string} spreadsheetId - Spreadsheet ID
   * @return {Promise<Object>} Spreadsheet metadata
   */
  async getSpreadsheetMetadata(spreadsheetId) {
    const endpoint = `${this.apiBase}/${spreadsheetId}?fields=properties,sheets.properties`;
    return await this.makeRequest(endpoint);
  }

  /**
   * Get values from a range
   * @param {string} spreadsheetId - Spreadsheet ID
   * @param {string} range - Range in A1 notation
   * @param {Object} options - Additional options
   * @return {Promise<Object>} Range values
   */
  async getValues(spreadsheetId, range, options = {}) {
    let endpoint = `${this.apiBase}/${spreadsheetId}/values/${encodeURIComponent(range)}`;
    
    const params = new URLSearchParams();
    if (options.valueRenderOption) params.append('valueRenderOption', options.valueRenderOption);
    if (options.dateTimeRenderOption) params.append('dateTimeRenderOption', options.dateTimeRenderOption);
    
    if (params.toString()) {
      endpoint += '?' + params.toString();
    }

    return await this.makeRequest(endpoint);
  }

  /**
   * Update values in a range
   * @param {string} spreadsheetId - Spreadsheet ID
   * @param {string} range - Range in A1 notation
   * @param {Array<Array>} values - Values to update
   * @param {Object} options - Additional options
   * @return {Promise<Object>} Update result
   */
  async updateValues(spreadsheetId, range, values, options = {}) {
    const endpoint = `${this.apiBase}/${spreadsheetId}/values/${encodeURIComponent(range)}?valueInputOption=${options.valueInputOption || 'RAW'}`;
    
    return await this.makeRequest(endpoint, {
      method: 'PUT',
      body: JSON.stringify({
        values: values,
        majorDimension: options.majorDimension || 'ROWS'
      })
    });
  }

  /**
   * Batch get multiple ranges
   * @param {string} spreadsheetId - Spreadsheet ID
   * @param {Array<string>} ranges - Array of ranges
   * @param {Object} options - Additional options
   * @return {Promise<Object>} Batch get result
   */
  async batchGetValues(spreadsheetId, ranges, options = {}) {
    const params = new URLSearchParams();
    ranges.forEach(range => params.append('ranges', range));
    if (options.valueRenderOption) params.append('valueRenderOption', options.valueRenderOption);
    
    const endpoint = `${this.apiBase}/${spreadsheetId}/values:batchGet?${params.toString()}`;
    return await this.makeRequest(endpoint);
  }

  /**
   * Batch update multiple ranges
   * @param {string} spreadsheetId - Spreadsheet ID
   * @param {Array<Object>} valueRanges - Array of value range objects
   * @param {Object} options - Additional options
   * @return {Promise<Object>} Batch update result
   */
  async batchUpdateValues(spreadsheetId, valueRanges, options = {}) {
    const endpoint = `${this.apiBase}/${spreadsheetId}/values:batchUpdate`;
    
    return await this.makeRequest(endpoint, {
      method: 'POST',
      body: JSON.stringify({
        valueInputOption: options.valueInputOption || 'RAW',
        data: valueRanges
      })
    });
  }

  /**
   * Get the currently selected range from the UI
   * @return {Promise<Object|null>} Selected range information
   */
  async getCurrentSelection() {
    try {
      // This is a simplified version - in a real implementation,
      // we would need to interact with the Google Sheets UI to detect selection
      const spreadsheetId = this.getSpreadsheetId();
      if (!spreadsheetId) return null;

      // For now, return a mock selection
      // In practice, this would require DOM manipulation to detect the actual selection
      return {
        spreadsheetId: spreadsheetId,
        range: 'A1:Z1000', // Placeholder
        sheetName: 'Sheet1' // Placeholder
      };
    } catch (error) {
      console.error('Error getting current selection:', error);
      return null;
    }
  }

  /**
   * Analyze data in a range
   * @param {string} spreadsheetId - Spreadsheet ID
   * @param {string} range - Range to analyze
   * @return {Promise<Object>} Analysis results
   */
  async analyzeRange(spreadsheetId, range) {
    try {
      const response = await this.getValues(spreadsheetId, range, {
        valueRenderOption: 'UNFORMATTED_VALUE'
      });
      
      if (!response.values || response.values.length === 0) {
        return {
          isEmpty: true,
          numRows: 0,
          numCols: 0,
          columns: []
        };
      }

      const data = response.values;
      const numRows = data.length;
      const numCols = data[0] ? data[0].length : 0;
      
      // Detect if first row is headers
      const hasHeaders = this.detectHeaders(data);
      const dataStartRow = hasHeaders ? 1 : 0;
      
      // Analyze columns
      const columns = [];
      for (let col = 0; col < numCols; col++) {
        const columnData = [];
        for (let row = dataStartRow; row < numRows; row++) {
          if (data[row] && data[row][col] !== undefined) {
            columnData.push(data[row][col]);
          }
        }
        
        const header = hasHeaders && data[0] ? data[0][col] : `Column ${String.fromCharCode(65 + col)}`;
        const analysis = this.analyzeColumnData(columnData);
        
        columns.push({
          index: col,
          header: header,
          letter: String.fromCharCode(65 + col),
          dataType: analysis.type,
          confidence: analysis.confidence,
          sampleValues: columnData.slice(0, 5),
          uniqueValues: [...new Set(columnData)].length,
          emptyValues: columnData.filter(v => v === '' || v === null || v === undefined).length
        });
      }

      return {
        isEmpty: false,
        numRows: numRows,
        numCols: numCols,
        dataRows: numRows - dataStartRow,
        hasHeaders: hasHeaders,
        columns: columns,
        range: range,
        spreadsheetId: spreadsheetId
      };
    } catch (error) {
      console.error('Error analyzing range:', error);
      throw new Error('Failed to analyze range: ' + error.message);
    }
  }

  /**
   * Detect if the first row contains headers
   * @param {Array<Array>} data - 2D array of data
   * @return {boolean} True if first row appears to be headers
   */
  detectHeaders(data) {
    if (!data || data.length < 2) return false;
    
    const firstRow = data[0];
    const secondRow = data[1];
    
    // Check if first row is all strings and second row has mixed types
    const firstRowAllStrings = firstRow.every(cell => typeof cell === 'string');
    const secondRowMixedTypes = secondRow.some(cell => typeof cell !== 'string');
    
    return firstRowAllStrings && secondRowMixedTypes;
  }

  /**
   * Analyze column data types
   * @param {Array} columnData - Column data to analyze
   * @return {Object} Analysis result
   */
  analyzeColumnData(columnData) {
    if (!columnData || columnData.length === 0) {
      return { type: 'empty', confidence: 1 };
    }

    const typeCounts = {
      number: 0,
      date: 0,
      text: 0,
      boolean: 0,
      empty: 0
    };

    let nonEmptyCount = 0;

    columnData.forEach(value => {
      if (value === '' || value === null || value === undefined) {
        typeCounts.empty++;
        return;
      }
      
      nonEmptyCount++;
      
      if (typeof value === 'boolean') {
        typeCounts.boolean++;
      } else if (typeof value === 'number') {
        typeCounts.number++;
      } else if (value instanceof Date) {
        typeCounts.date++;
      } else if (typeof value === 'string') {
        // Try to detect what the string represents
        if (!isNaN(parseFloat(value)) && isFinite(parseFloat(value))) {
          typeCounts.number++;
        } else if (!isNaN(Date.parse(value))) {
          typeCounts.date++;
        } else if (/^(true|false|yes|no)$/i.test(value)) {
          typeCounts.boolean++;
        } else {
          typeCounts.text++;
        }
      } else {
        typeCounts.text++;
      }
    });

    if (nonEmptyCount === 0) {
      return { type: 'empty', confidence: 1 };
    }

    // Find predominant type
    let maxCount = 0;
    let predominantType = 'text';

    Object.entries(typeCounts).forEach(([type, count]) => {
      if (type !== 'empty' && count > maxCount) {
        maxCount = count;
        predominantType = type;
      }
    });

    return {
      type: predominantType,
      confidence: maxCount / nonEmptyCount,
      distribution: typeCounts
    };
  }

  /**
   * Perform sorting operation on a range
   * @param {string} spreadsheetId - Spreadsheet ID
   * @param {string} range - Range to sort
   * @param {Array<Object>} sortCriteria - Sort criteria
   * @param {boolean} hasHeaders - Whether range has headers
   * @return {Promise<Object>} Sort result
   */
  async sortRange(spreadsheetId, range, sortCriteria, hasHeaders = true) {
    try {
      // Get current data
      const response = await this.getValues(spreadsheetId, range);
      const data = response.values;
      
      if (!data || data.length === 0) {
        throw new Error('No data to sort');
      }

      // Use shared sorting algorithm (would be imported)
      const sortedData = this.performSort(data, sortCriteria, hasHeaders);
      
      // Update the range with sorted data
      const updateResult = await this.updateValues(spreadsheetId, range, sortedData);
      
      return {
        success: true,
        updatedCells: updateResult.updatedCells,
        updatedRows: updateResult.updatedRows,
        sortedRows: sortedData.length - (hasHeaders ? 1 : 0)
      };
    } catch (error) {
      console.error('Error sorting range:', error);
      throw new Error('Sort operation failed: ' + error.message);
    }
  }

  /**
   * Simple sort implementation
   * @param {Array<Array>} data - Data to sort
   * @param {Array<Object>} sortCriteria - Sort criteria
   * @param {boolean} hasHeaders - Has headers flag
   * @return {Array<Array>} Sorted data
   */
  performSort(data, sortCriteria, hasHeaders = true) {
    if (!data || data.length === 0) return data;
    
    const headers = hasHeaders ? [data[0]] : [];
    const dataToSort = hasHeaders ? data.slice(1) : [...data];
    
    dataToSort.sort((rowA, rowB) => {
      for (const criterion of sortCriteria) {
        const { column, order } = criterion;
        
        let valueA = rowA[column] || '';
        let valueB = rowB[column] || '';
        
        // Normalize for comparison
        if (typeof valueA === 'string') valueA = valueA.toLowerCase();
        if (typeof valueB === 'string') valueB = valueB.toLowerCase();
        
        let comparison = 0;
        if (valueA < valueB) comparison = -1;
        else if (valueA > valueB) comparison = 1;
        
        if (comparison !== 0) {
          return order === 'asc' ? comparison : -comparison;
        }
      }
      return 0;
    });
    
    return [...headers, ...dataToSort];
  }
}

// Create global instance
window.sheetsAPIClient = new SheetsAPIClient();