/**
 * Shared Sorting Algorithms
 * Advanced sorting utilities used by both workspace add-on and chrome extension
 */

/**
 * Data type detection utilities
 */
const DataTypes = {
  NUMBER: 'number',
  DATE: 'date',
  TEXT: 'text',
  BOOLEAN: 'boolean',
  EMPTY: 'empty'
};

/**
 * Detect the data type of a value
 * @param {*} value - The value to analyze
 * @return {string} The detected data type
 */
function detectDataType(value) {
  if (value === null || value === undefined || value === '') {
    return DataTypes.EMPTY;
  }

  if (typeof value === 'boolean') {
    return DataTypes.BOOLEAN;
  }

  if (typeof value === 'number' && !isNaN(value)) {
    return DataTypes.NUMBER;
  }

  if (typeof value === 'string') {
    // Check if it's a number string
    const numValue = parseFloat(value.replace(/,/g, ''));
    if (!isNaN(numValue) && isFinite(numValue)) {
      return DataTypes.NUMBER;
    }

    // Check if it's a date string
    const dateValue = new Date(value);
    if (!isNaN(dateValue.getTime())) {
      // Additional date format checks
      const datePatterns = [
        /^\d{1,2}\/\d{1,2}\/\d{4}$/,  // MM/DD/YYYY
        /^\d{4}-\d{1,2}-\d{1,2}$/,   // YYYY-MM-DD
        /^\d{1,2}-\d{1,2}-\d{4}$/,   // MM-DD-YYYY
        /^(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s\d{1,2},?\s\d{4}$/i
      ];
      
      if (datePatterns.some(pattern => pattern.test(value))) {
        return DataTypes.DATE;
      }
    }

    // Check for boolean strings
    if (/^(true|false|yes|no)$/i.test(value)) {
      return DataTypes.BOOLEAN;
    }
  }

  return DataTypes.TEXT;
}

/**
 * Analyze a column of data to determine the predominant data type
 * @param {Array} column - Array of column values
 * @return {Object} Analysis result with type and confidence
 */
function analyzeColumnDataType(column) {
  if (!Array.isArray(column) || column.length === 0) {
    return { type: DataTypes.TEXT, confidence: 0 };
  }

  const typeCounts = {};
  let nonEmptyCount = 0;

  column.forEach(value => {
    const type = detectDataType(value);
    if (type !== DataTypes.EMPTY) {
      typeCounts[type] = (typeCounts[type] || 0) + 1;
      nonEmptyCount++;
    }
  });

  if (nonEmptyCount === 0) {
    return { type: DataTypes.EMPTY, confidence: 1 };
  }

  // Find the most common type
  let maxCount = 0;
  let predominantType = DataTypes.TEXT;

  Object.entries(typeCounts).forEach(([type, count]) => {
    if (count > maxCount) {
      maxCount = count;
      predominantType = type;
    }
  });

  const confidence = maxCount / nonEmptyCount;
  
  return { 
    type: predominantType, 
    confidence,
    distribution: typeCounts,
    totalValues: column.length,
    nonEmptyValues: nonEmptyCount
  };
}

/**
 * Convert value to appropriate type for comparison
 * @param {*} value - The value to convert
 * @param {string} targetType - The target data type
 * @return {*} Converted value
 */
function convertValueForComparison(value, targetType) {
  if (value === null || value === undefined || value === '') {
    return null;
  }

  switch (targetType) {
    case DataTypes.NUMBER:
      const numValue = typeof value === 'string' ? 
        parseFloat(value.replace(/,/g, '')) : Number(value);
      return isNaN(numValue) ? null : numValue;

    case DataTypes.DATE:
      const dateValue = new Date(value);
      return isNaN(dateValue.getTime()) ? null : dateValue;

    case DataTypes.BOOLEAN:
      if (typeof value === 'boolean') return value;
      if (typeof value === 'string') {
        const lowerValue = value.toLowerCase();
        if (['true', 'yes', '1'].includes(lowerValue)) return true;
        if (['false', 'no', '0'].includes(lowerValue)) return false;
      }
      return null;

    case DataTypes.TEXT:
    default:
      return String(value).toLowerCase();
  }
}

/**
 * Custom sort order definitions
 */
const CustomSortOrders = {
  MONTHS: ['January', 'February', 'March', 'April', 'May', 'June',
           'July', 'August', 'September', 'October', 'November', 'December'],
  MONTHS_SHORT: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
  WEEKDAYS: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
  WEEKDAYS_SHORT: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
  PRIORITY: ['High', 'Medium', 'Low'],
  STATUS: ['Not Started', 'In Progress', 'Completed'],
  SIZES: ['XS', 'S', 'M', 'L', 'XL', 'XXL']
};

/**
 * Check if a column matches a custom sort order
 * @param {Array} column - Array of column values
 * @return {Object|null} Matched custom sort order or null
 */
function detectCustomSortOrder(column) {
  const uniqueValues = [...new Set(column.filter(v => v !== null && v !== undefined && v !== ''))];
  
  for (const [orderName, orderArray] of Object.entries(CustomSortOrders)) {
    // Check if all unique values are in the custom order
    const matches = uniqueValues.every(value => 
      orderArray.some(orderValue => 
        String(value).toLowerCase() === orderValue.toLowerCase()
      )
    );
    
    if (matches && uniqueValues.length > 1) {
      return {
        name: orderName,
        order: orderArray,
        matchedValues: uniqueValues
      };
    }
  }
  
  return null;
}

/**
 * Advanced sorting function with multiple criteria support
 * @param {Array<Array>} data - 2D array of data to sort
 * @param {Array<Object>} sortCriteria - Array of sort criteria objects
 * @param {boolean} hasHeaders - Whether first row contains headers
 * @param {Object} options - Additional sorting options
 * @return {Array<Array>} Sorted data
 */
function advancedSort(data, sortCriteria, hasHeaders = true, options = {}) {
  if (!Array.isArray(data) || data.length === 0) {
    return data;
  }

  if (!Array.isArray(sortCriteria) || sortCriteria.length === 0) {
    return data;
  }

  // Separate headers if present
  const headers = hasHeaders ? [data[0]] : [];
  const dataToSort = hasHeaders ? data.slice(1) : [...data];

  // Validate sort criteria
  const validCriteria = sortCriteria.filter(criterion => {
    return criterion.column >= 0 && 
           criterion.column < (data[0] ? data[0].length : 0) &&
           ['asc', 'desc'].includes(criterion.order);
  });

  if (validCriteria.length === 0) {
    return data;
  }

  // Create a stable sort by adding original index
  const indexedData = dataToSort.map((row, index) => ({
    row: row,
    originalIndex: index
  }));

  // Sort the data
  indexedData.sort((itemA, itemB) => {
    const rowA = itemA.row;
    const rowB = itemB.row;

    for (const criterion of validCriteria) {
      const { column, order, dataType, customOrder, nullsLast = true } = criterion;
      
      let valueA = rowA[column];
      let valueB = rowB[column];
      
      // Handle custom sort orders first
      if (customOrder && Array.isArray(customOrder)) {
        const comparison = compareWithCustomOrder(valueA, valueB, customOrder);
        if (comparison !== 0) {
          return order === 'asc' ? comparison : -comparison;
        }
        continue;
      }

      // Convert values for comparison based on detected or specified type
      const targetType = dataType || detectDataType(valueA);
      const convertedA = convertValueForComparison(valueA, targetType);
      const convertedB = convertValueForComparison(valueB, targetType);
      
      // Handle null values
      if (convertedA === null && convertedB === null) continue;
      if (convertedA === null) return nullsLast ? 1 : -1;
      if (convertedB === null) return nullsLast ? -1 : 1;
      
      // Perform type-specific comparison
      let comparison = compareValues(convertedA, convertedB, targetType);
      
      if (comparison !== 0) {
        return order === 'asc' ? comparison : -comparison;
      }
    }
    
    // Stable sort - use original index as tiebreaker
    return itemA.originalIndex - itemB.originalIndex;
  });

  // Extract sorted rows
  const sortedData = indexedData.map(item => item.row);

  // Recombine headers with sorted data
  return [...headers, ...sortedData];
}

/**
 * Compare values with custom sort order
 * @param {*} valueA - First value
 * @param {*} valueB - Second value
 * @param {Array} customOrder - Custom order array
 * @return {number} Comparison result
 */
function compareWithCustomOrder(valueA, valueB, customOrder) {
  const normalizeValue = (val) => String(val).toLowerCase().trim();
  
  const indexA = customOrder.findIndex(item => 
    normalizeValue(valueA) === normalizeValue(item)
  );
  const indexB = customOrder.findIndex(item => 
    normalizeValue(valueB) === normalizeValue(item)
  );
  
  // If both values are in custom order, compare by position
  if (indexA !== -1 && indexB !== -1) {
    return indexA - indexB;
  }
  
  // If only one is in custom order, it comes first
  if (indexA !== -1) return -1;
  if (indexB !== -1) return 1;
  
  // If neither is in custom order, fall back to regular comparison
  return 0;
}

/**
 * Type-specific value comparison
 * @param {*} valueA - First value
 * @param {*} valueB - Second value
 * @param {string} dataType - Data type for comparison
 * @return {number} Comparison result
 */
function compareValues(valueA, valueB, dataType) {
  switch (dataType) {
    case DataTypes.NUMBER:
      return valueA - valueB;
      
    case DataTypes.DATE:
      return valueA.getTime() - valueB.getTime();
      
    case DataTypes.BOOLEAN:
      // false < true
      return valueA === valueB ? 0 : (valueA ? 1 : -1);
      
    case DataTypes.TEXT:
    default:
      // Locale-aware string comparison
      return valueA.localeCompare(valueB, undefined, {
        numeric: true,
        sensitivity: 'base',
        ignorePunctuation: false
      });
  }
}

/**
 * Generate sort preview without modifying original data
 * @param {Array<Array>} data - Original data
 * @param {Array<Object>} sortCriteria - Sort criteria
 * @param {boolean} hasHeaders - Whether first row contains headers
 * @param {number} previewRows - Number of rows to include in preview
 * @return {Object} Preview result with sorted data sample and statistics
 */
function generateSortPreview(data, sortCriteria, hasHeaders = true, previewRows = 10) {
  const sortedData = advancedSort(data, sortCriteria, hasHeaders);
  
  const preview = sortedData.slice(0, hasHeaders ? previewRows + 1 : previewRows);
  
  // Generate statistics
  const stats = {
    totalRows: data.length,
    dataRows: hasHeaders ? data.length - 1 : data.length,
    sortCriteria: sortCriteria.length,
    previewRows: preview.length - (hasHeaders ? 1 : 0)
  };

  return {
    preview,
    stats,
    hasHeaders
  };
}

/**
 * Smart sort that automatically determines the best sorting approach
 * @param {Array<Array>} data - 2D array of data to sort
 * @param {Object} options - Smart sort options
 * @return {Object} Smart sort result with applied criteria
 */
function smartSort(data, options = {}) {
  if (!Array.isArray(data) || data.length === 0) {
    return { sortedData: data, appliedCriteria: [], analysis: null };
  }

  const {
    hasHeaders = null, // null = auto-detect
    preferredColumn = null, // null = auto-detect
    preferredOrder = 'asc',
    maxCriteria = 3
  } = options;

  // Auto-detect headers if not specified
  const detectedHeaders = hasHeaders !== null ? hasHeaders : autoDetectHeaders(data);
  
  // Analyze data structure
  const analysis = analyzeDataForSmartSort(data, detectedHeaders);
  
  if (analysis.columns.length === 0) {
    return { sortedData: data, appliedCriteria: [], analysis };
  }

  // Determine best sorting criteria
  const criteria = determineBestSortCriteria(analysis, {
    preferredColumn,
    preferredOrder,
    maxCriteria
  });

  // Apply the sort
  const sortedData = advancedSort(data, criteria, detectedHeaders);

  return {
    sortedData,
    appliedCriteria: criteria,
    analysis,
    confidence: calculateSortConfidence(analysis, criteria)
  };
}

/**
 * Auto-detect if first row contains headers
 * @param {Array<Array>} data - 2D array of data
 * @return {boolean} True if headers detected
 */
function autoDetectHeaders(data) {
  if (!data || data.length < 2) return false;
  
  const firstRow = data[0];
  const secondRow = data[1];
  
  if (!firstRow || !secondRow) return false;

  // Check type consistency between first and second row
  let typeChanges = 0;
  const minColumns = Math.min(firstRow.length, secondRow.length);
  
  for (let i = 0; i < minColumns; i++) {
    const type1 = detectDataType(firstRow[i]);
    const type2 = detectDataType(secondRow[i]);
    
    // If first row is text and second row is different type, likely headers
    if (type1 === DataTypes.TEXT && type2 !== DataTypes.TEXT && type2 !== DataTypes.EMPTY) {
      typeChanges++;
    }
  }
  
  // If more than half the columns show this pattern, likely headers
  return typeChanges > minColumns / 2;
}

/**
 * Analyze data structure for smart sorting
 * @param {Array<Array>} data - 2D array of data
 * @param {boolean} hasHeaders - Whether data has headers
 * @return {Object} Analysis result optimized for sorting
 */
function analyzeDataForSmartSort(data, hasHeaders) {
  const analysis = analyzeDataStructure(data, hasHeaders);
  
  // Add sorting-specific metrics
  analysis.columns.forEach(column => {
    const columnIndex = column.index;
    const columnData = data.slice(hasHeaders ? 1 : 0).map(row => row[columnIndex]);
    
    // Calculate sort metrics
    column.sortability = calculateSortability(columnData);
    column.uniquenessRatio = column.uniqueValues / Math.max(columnData.length, 1);
    column.customOrderMatch = detectCustomSortOrder(columnData);
    column.sortRecommendation = recommendSortOrder(columnData, column.dataType);
  });

  // Sort columns by sortability (best sorting candidates first)
  analysis.columns.sort((a, b) => b.sortability - a.sortability);

  return analysis;
}

/**
 * Calculate how suitable a column is for sorting
 * @param {Array} columnData - Column data array
 * @return {number} Sortability score (0-1)
 */
function calculateSortability(columnData) {
  if (!columnData || columnData.length === 0) return 0;

  const nonEmptyData = columnData.filter(v => v !== null && v !== undefined && v !== '');
  if (nonEmptyData.length === 0) return 0;

  let score = 0;

  // More unique values = better for sorting
  const uniqueCount = new Set(nonEmptyData).size;
  const uniquenessScore = Math.min(uniqueCount / nonEmptyData.length, 1);
  score += uniquenessScore * 0.4;

  // Consistent data type = better for sorting
  const typeAnalysis = analyzeColumnDataType(columnData);
  score += typeAnalysis.confidence * 0.3;

  // Less empty values = better for sorting
  const completenessScore = nonEmptyData.length / columnData.length;
  score += completenessScore * 0.2;

  // Detect if data appears to be pre-sorted (reduce score)
  const sortedScore = calculateSortedness(nonEmptyData);
  score += (1 - sortedScore) * 0.1; // Prefer unsorted data for sorting

  return Math.min(Math.max(score, 0), 1);
}

/**
 * Calculate how sorted the data already is
 * @param {Array} data - Data array to analyze
 * @return {number} Sortedness score (0-1)
 */
function calculateSortedness(data) {
  if (data.length < 2) return 1;

  let ascendingCount = 0;
  let descendingCount = 0;

  for (let i = 1; i < data.length; i++) {
    const prev = String(data[i - 1]).toLowerCase();
    const curr = String(data[i]).toLowerCase();
    
    if (prev <= curr) ascendingCount++;
    if (prev >= curr) descendingCount++;
  }

  const maxCount = Math.max(ascendingCount, descendingCount);
  return maxCount / (data.length - 1);
}

/**
 * Recommend sort order based on data type and content
 * @param {Array} columnData - Column data
 * @param {string} dataType - Detected data type
 * @return {string} Recommended sort order
 */
function recommendSortOrder(columnData, dataType) {
  if (dataType === DataTypes.DATE) {
    // For dates, prefer newest first for recent data
    const dates = columnData
      .filter(d => d instanceof Date || !isNaN(Date.parse(d)))
      .map(d => new Date(d));
    
    if (dates.length > 0) {
      const avgDate = new Date(dates.reduce((sum, date) => sum + date.getTime(), 0) / dates.length);
      const now = new Date();
      
      // If average date is recent (within last year), prefer desc
      return (now - avgDate) < (365 * 24 * 60 * 60 * 1000) ? 'desc' : 'asc';
    }
  }
  
  if (dataType === DataTypes.NUMBER) {
    // For numbers, check if they look like rankings, scores, etc.
    const numbers = columnData.filter(v => typeof v === 'number' || !isNaN(parseFloat(v)));
    if (numbers.length > 0) {
      const max = Math.max(...numbers.map(n => parseFloat(n)));
      // If numbers are small (like rankings), prefer ascending
      return max <= 100 ? 'asc' : 'desc';
    }
  }
  
  // Default to ascending for most cases
  return 'asc';
}

/**
 * Determine the best sort criteria for smart sort
 * @param {Object} analysis - Data analysis result
 * @param {Object} options - Criteria options
 * @return {Array<Object>} Sort criteria array
 */
function determineBestSortCriteria(analysis, options) {
  const {
    preferredColumn,
    preferredOrder,
    maxCriteria
  } = options;

  const criteria = [];

  // If preferred column is specified, use it first
  if (preferredColumn !== null && analysis.columns[preferredColumn]) {
    const column = analysis.columns.find(col => col.index === preferredColumn);
    if (column) {
      criteria.push({
        column: preferredColumn,
        order: preferredOrder,
        dataType: column.dataType,
        customOrder: column.customOrderMatch?.order
      });
    }
  }

  // Add best additional columns up to maxCriteria
  const usedColumns = new Set(criteria.map(c => c.column));
  const availableColumns = analysis.columns.filter(col => !usedColumns.has(col.index));

  for (const column of availableColumns) {
    if (criteria.length >= maxCriteria) break;
    
    // Only add high-sortability columns as secondary criteria
    if (column.sortability > 0.5) {
      criteria.push({
        column: column.index,
        order: column.sortRecommendation,
        dataType: column.dataType,
        customOrder: column.customOrderMatch?.order
      });
    }
  }

  // If no criteria determined, use the first column
  if (criteria.length === 0 && analysis.columns.length > 0) {
    const firstColumn = analysis.columns[0];
    criteria.push({
      column: firstColumn.index,
      order: preferredOrder,
      dataType: firstColumn.dataType
    });
  }

  return criteria;
}

/**
 * Calculate confidence score for the applied sort
 * @param {Object} analysis - Data analysis result
 * @param {Array<Object>} criteria - Applied sort criteria
 * @return {number} Confidence score (0-1)
 */
function calculateSortConfidence(analysis, criteria) {
  if (!criteria || criteria.length === 0) return 0;

  let totalConfidence = 0;
  let totalWeight = 0;

  criteria.forEach((criterion, index) => {
    const column = analysis.columns.find(col => col.index === criterion.column);
    if (column) {
      // Primary criterion has more weight
      const weight = index === 0 ? 0.7 : 0.3 / (criteria.length - 1);
      totalConfidence += column.sortability * column.confidence * weight;
      totalWeight += weight;
    }
  });

  return totalWeight > 0 ? totalConfidence / totalWeight : 0;
}

// Export functions for use in both environments
if (typeof module !== 'undefined' && module.exports) {
  // Node.js/CommonJS environment
  module.exports = {
    DataTypes,
    CustomSortOrders,
    detectDataType,
    analyzeColumnDataType,
    convertValueForComparison,
    detectCustomSortOrder,
    advancedSort,
    generateSortPreview,
    validateSortCriteria
  };
} else {
  // Browser environment
  window.SortingAlgorithms = {
    DataTypes,
    CustomSortOrders,
    detectDataType,
    analyzeColumnDataType,
    convertValueForComparison,
    detectCustomSortOrder,
    advancedSort,
    generateSortPreview,
    validateSortCriteria
  };
}
/**
 * Analyze data structure and types in a range
 * @param {Array<Array>} data - 2D array of data
 * @param {boolean} hasHeaders - Whether first row contains headers
 * @return {Object} Analysis results
 */
function analyzeDataStructure(data, hasHeaders = true) {
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
    const analysis = analyzeColumnDataType(columnData);
    
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

// Update exports
if (typeof module !== 'undefined' && module.exports) {
  // Node.js/CommonJS environment
  module.exports = {
    DataTypes,
    CustomSortOrders,
    detectDataType,
    analyzeColumnDataType,
    convertValueForComparison,
    detectCustomSortOrder,
    advancedSort,
    smartSort,
    autoDetectHeaders,
    analyzeDataForSmartSort,
    calculateSortability,
    generateSortPreview,
    validateSortCriteria,
    analyzeDataStructure
  };
} else {
  // Browser environment
  window.SortingAlgorithms = {
    DataTypes,
    CustomSortOrders,
    detectDataType,
    analyzeColumnDataType,
    convertValueForComparison,
    detectCustomSortOrder,
    advancedSort,
    smartSort,
    autoDetectHeaders,
    analyzeDataForSmartSort,
    calculateSortability,
    generateSortPreview,
    validateSortCriteria,
    analyzeDataStructure
  };
}