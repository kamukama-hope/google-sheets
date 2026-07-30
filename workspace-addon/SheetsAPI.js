/**
 * Google Sheets API Integration for Workspace Add-on
 * Handles all interactions with Google Sheets data
 */

/**
 * Class for handling Google Sheets API operations
 */
class SheetsAPIHelper {
  constructor() {
    this.maxRetries = 3;
    this.retryDelay = 1000; // 1 second
  }

  /**
   * Get the current active sheet and range information
   * @return {Object} Sheet and range information
   */
  getCurrentSheetInfo() {
    try {
      const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
      const sheet = spreadsheet.getActiveSheet();
      const range = sheet.getActiveRange();
      
      return {
        spreadsheet: spreadsheet,
        sheet: sheet,
        range: range,
        spreadsheetId: spreadsheet.getId(),
        sheetName: sheet.getName(),
        sheetId: sheet.getSheetId(),
        rangeName: range.getA1Notation(),
        numRows: range.getNumRows(),
        numCols: range.getNumColumns()
      };
    } catch (error) {
      console.error('Error getting sheet info:', error);
      throw new Error('Unable to access current sheet: ' + error.message);
    }
  }

  /**
   * Get data from a specific range
   * @param {string|Range} rangeOrNotation - Range object or A1 notation
   * @param {Sheet} sheet - Optional sheet object
   * @return {Object} Range data with metadata
   */
  getRangeData(rangeOrNotation, sheet = null) {
    try {
      let range;
      let targetSheet = sheet || SpreadsheetApp.getActiveSheet();
      
      if (typeof rangeOrNotation === 'string') {
        range = targetSheet.getRange(rangeOrNotation);
      } else {
        range = rangeOrNotation;
      }
      
      const values = range.getValues();
      const displayValues = range.getDisplayValues();
      const formulas = range.getFormulas();
      
      return {
        values: values,
        displayValues: displayValues,
        formulas: formulas,
        range: range,
        numRows: range.getNumRows(),
        numCols: range.getNumColumns(),
        a1Notation: range.getA1Notation(),
        startRow: range.getRow(),
        startCol: range.getColumn(),
        hasFormulas: formulas.some(row => row.some(cell => cell !== '')),
        isEmpty: values.every(row => row.every(cell => cell === '' || cell === null || cell === undefined))
      };
    } catch (error) {
      console.error('Error getting range data:', error);
      throw new Error('Unable to read range data: ' + error.message);
    }
  }

  /**
   * Set data to a specific range
   * @param {string|Range} rangeOrNotation - Range object or A1 notation
   * @param {Array<Array>} values - 2D array of values to set
   * @param {Sheet} sheet - Optional sheet object
   * @return {boolean} Success status
   */
  setRangeData(rangeOrNotation, values, sheet = null) {
    try {
      let range;
      let targetSheet = sheet || SpreadsheetApp.getActiveSheet();
      
      if (typeof rangeOrNotation === 'string') {
        range = targetSheet.getRange(rangeOrNotation);
      } else {
        range = rangeOrNotation;
      }
      
      // Validate dimensions
      if (values.length > range.getNumRows() || 
          (values[0] && values[0].length > range.getNumColumns())) {
        throw new Error('Data dimensions exceed range size');
      }
      
      range.setValues(values);
      return true;
    } catch (error) {
      console.error('Error setting range data:', error);
      throw new Error('Unable to write range data: ' + error.message);
    }
  }

  /**
   * Analyze data structure and types in a range
   * @param {Array<Array>} data - 2D array of data
   * @param {boolean} hasHeaders - Whether first row contains headers
   * @return {Object} Analysis results
   */
  analyzeDataStructure(data, hasHeaders = true) {
    if (!Array.isArray(data) || data.length === 0) {
      return {
        isEmpty: true,
        numRows: 0,
        numCols: 0,
        columns: []
      };
    }

    const numRows = data.length;
    const numCols = data[0] ? data[0].length : 0;
    const dataStartRow = hasHeaders ? 1 : 0;
    const headerRow = hasHeaders ? data[0] : null;
    
    // Analyze each column
    const columns = [];
    for (let col = 0; col < numCols; col++) {
      const columnData = [];
      for (let row = dataStartRow; row < numRows; row++) {
        if (data[row] && data[row][col] !== undefined) {
          columnData.push(data[row][col]);
        }
      }
      
      const header = headerRow ? headerRow[col] : `Column ${String.fromCharCode(65 + col)}`;
      const analysis = this.analyzeColumnData(columnData);
      
      columns.push({
        index: col,
        header: header,
        letter: String.fromCharCode(65 + col),
        dataType: analysis.type,
        confidence: analysis.confidence,
        sampleValues: columnData.slice(0, 5),
        uniqueValues: [...new Set(columnData)].length,
        emptyValues: columnData.filter(v => v === '' || v === null || v === undefined).length,
        ...analysis
      });
    }

    return {
      isEmpty: false,
      numRows: numRows,
      numCols: numCols,
      dataRows: numRows - dataStartRow,
      hasHeaders: hasHeaders,
      headerRow: headerRow,
      columns: columns,
      totalCells: numRows * numCols,
      emptyCells: data.flat().filter(v => v === '' || v === null || v === undefined).length
    };
  }

  /**
   * Analyze a single column of data
   * @param {Array} columnData - Array of column values
   * @return {Object} Column analysis
   */
  analyzeColumnData(columnData) {
    if (!Array.isArray(columnData) || columnData.length === 0) {
      return { type: 'empty', confidence: 1, distribution: {} };
    }

    // Use the shared sorting algorithms for data type detection
    const typeCounts = {};
    let nonEmptyCount = 0;

    columnData.forEach(value => {
      if (value !== '' && value !== null && value !== undefined) {
        const type = this.detectDataType(value);
        typeCounts[type] = (typeCounts[type] || 0) + 1;
        nonEmptyCount++;
      }
    });

    if (nonEmptyCount === 0) {
      return { type: 'empty', confidence: 1, distribution: typeCounts };
    }

    // Find predominant type
    let maxCount = 0;
    let predominantType = 'text';

    Object.entries(typeCounts).forEach(([type, count]) => {
      if (count > maxCount) {
        maxCount = count;
        predominantType = type;
      }
    });

    return {
      type: predominantType,
      confidence: maxCount / nonEmptyCount,
      distribution: typeCounts,
      totalValues: columnData.length,
      nonEmptyValues: nonEmptyCount
    };
  }

  /**
   * Simple data type detection
   * @param {*} value - Value to analyze
   * @return {string} Detected type
   */
  detectDataType(value) {
    if (value === null || value === undefined || value === '') {
      return 'empty';
    }

    if (typeof value === 'boolean') {
      return 'boolean';
    }

    if (typeof value === 'number' && !isNaN(value)) {
      return 'number';
    }

    if (value instanceof Date) {
      return 'date';
    }

    if (typeof value === 'string') {
      // Check for number
      const numValue = parseFloat(value.replace(/,/g, ''));
      if (!isNaN(numValue) && isFinite(numValue)) {
        return 'number';
      }

      // Check for date
      const dateValue = new Date(value);
      if (!isNaN(dateValue.getTime())) {
        return 'date';
      }

      // Check for boolean
      if (/^(true|false|yes|no)$/i.test(value)) {
        return 'boolean';
      }
    }

    return 'text';
  }

  /**
   * Create a backup of the current range before sorting
   * @param {Range} range - Range to backup
   * @return {Object} Backup information
   */
  createBackup(range) {
    try {
      const backupData = this.getRangeData(range);
      const timestamp = new Date().toISOString();
      
      // Store backup in document properties (limited size)
      const properties = PropertiesService.getDocumentProperties();
      const backupKey = `backup_${timestamp}_${range.getA1Notation()}`;
      
      // Store minimal backup info due to size limitations
      const backupInfo = {
        timestamp: timestamp,
        range: range.getA1Notation(),
        sheetName: range.getSheet().getName(),
        numRows: backupData.numRows,
        numCols: backupData.numCols,
        values: backupData.values
      };

      properties.setProperty(backupKey, JSON.stringify(backupInfo));
      
      return {
        backupKey: backupKey,
        timestamp: timestamp,
        canRestore: true
      };
    } catch (error) {
      console.error('Error creating backup:', error);
      return {
        backupKey: null,
        timestamp: new Date().toISOString(),
        canRestore: false,
        error: error.message
      };
    }
  }

  /**
   * Restore data from a backup
   * @param {string} backupKey - Backup key to restore
   * @return {boolean} Success status
   */
  restoreFromBackup(backupKey) {
    try {
      const properties = PropertiesService.getDocumentProperties();
      const backupData = properties.getProperty(backupKey);
      
      if (!backupData) {
        throw new Error('Backup not found');
      }

      const backup = JSON.parse(backupData);
      const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(backup.sheetName);
      
      if (!sheet) {
        throw new Error('Original sheet not found');
      }

      const range = sheet.getRange(backup.range);
      this.setRangeData(range, backup.values);
      
      // Clean up the backup
      properties.deleteProperty(backupKey);
      
      return true;
    } catch (error) {
      console.error('Error restoring backup:', error);
      throw new Error('Unable to restore backup: ' + error.message);
    }
  }

  /**
   * Sort a range using the advanced sorting algorithm
   * @param {Range} range - Range to sort
   * @param {Array<Object>} sortCriteria - Sorting criteria
   * @param {boolean} hasHeaders - Whether range has headers
   * @param {boolean} createBackupFirst - Whether to create backup
   * @return {Object} Sort result
   */
  sortRange(range, sortCriteria, hasHeaders = true, createBackupFirst = true) {
    try {
      let backup = null;
      
      // Create backup if requested
      if (createBackupFirst) {
        backup = this.createBackup(range);
      }

      // Get current data
      const rangeData = this.getRangeData(range);
      
      // Import shared sorting functions (would need to be included in the project)
      // For now, we'll use a simplified version
      const sortedData = this.performAdvancedSort(rangeData.values, sortCriteria, hasHeaders);
      
      // Apply sorted data
      this.setRangeData(range, sortedData);
      
      return {
        success: true,
        backup: backup,
        sortedRows: sortedData.length - (hasHeaders ? 1 : 0),
        criteria: sortCriteria.length
      };
    } catch (error) {
      console.error('Error sorting range:', error);
      throw new Error('Sorting failed: ' + error.message);
    }
  }

  /**
   * Simplified advanced sort implementation
   * @param {Array<Array>} data - Data to sort
   * @param {Array<Object>} sortCriteria - Sort criteria
   * @param {boolean} hasHeaders - Has headers flag
   * @return {Array<Array>} Sorted data
   */
  performAdvancedSort(data, sortCriteria, hasHeaders = true) {
    if (!data || data.length === 0) return data;
    
    const headers = hasHeaders ? [data[0]] : [];
    const dataToSort = hasHeaders ? data.slice(1) : [...data];
    
    dataToSort.sort((rowA, rowB) => {
      for (const criterion of sortCriteria) {
        const { column, order } = criterion;
        
        let valueA = rowA[column];
        let valueB = rowB[column];
        
        // Convert for comparison
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

  /**
   * Get available sheets in the spreadsheet
   * @return {Array<Object>} Sheet information
   */
  getAvailableSheets() {
    try {
      const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
      const sheets = spreadsheet.getSheets();
      
      return sheets.map(sheet => ({
        name: sheet.getName(),
        id: sheet.getSheetId(),
        index: sheet.getIndex(),
        isActive: sheet === spreadsheet.getActiveSheet(),
        rowCount: sheet.getLastRow(),
        columnCount: sheet.getLastColumn()
      }));
    } catch (error) {
      console.error('Error getting sheets:', error);
      throw new Error('Unable to get sheet list: ' + error.message);
    }
  }

  /**
   * Get named ranges in the spreadsheet
   * @return {Array<Object>} Named range information
   */
  getNamedRanges() {
    try {
      const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
      const namedRanges = spreadsheet.getNamedRanges();
      
      return namedRanges.map(namedRange => ({
        name: namedRange.getName(),
        range: namedRange.getRange().getA1Notation(),
        sheetName: namedRange.getRange().getSheet().getName()
      }));
    } catch (error) {
      console.error('Error getting named ranges:', error);
      return [];
    }
  }
}

// Create global instance
const sheetsAPI = new SheetsAPIHelper();