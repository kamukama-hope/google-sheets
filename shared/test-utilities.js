/**
 * Testing Utilities for Google Sheets Sorting Helper
 * Provides sample data and testing functions for development
 */

/**
 * Sample test data sets for development and testing
 */
const TestData = {
  // Simple numeric data
  NUMBERS: [
    ['Number', 'Value', 'Category'],
    [3, 'Three', 'Odd'],
    [1, 'One', 'Odd'],
    [4, 'Four', 'Even'],
    [2, 'Two', 'Even'],
    [5, 'Five', 'Odd']
  ],

  // Mixed data types
  MIXED: [
    ['Name', 'Age', 'Date Joined', 'Active'],
    ['Alice Johnson', 28, '2020-01-15', true],
    ['Bob Smith', 34, '2019-06-22', true],
    ['Charlie Brown', 22, '2021-03-08', false],
    ['Diana Wilson', 31, '2020-11-30', true],
    ['Eve Davis', 26, '2021-07-14', false]
  ],

  // Custom sort orders
  PRIORITIES: [
    ['Task', 'Priority', 'Status'],
    ['Update documentation', 'Low', 'Completed'],
    ['Fix login bug', 'High', 'In Progress'],
    ['Add new feature', 'Medium', 'Not Started'],
    ['Code review', 'High', 'In Progress'],
    ['Deploy to production', 'Medium', 'Not Started']
  ],

  // Date-heavy data
  DATES: [
    ['Event', 'Date', 'Attendance'],
    ['Conference', '2024-03-15', 150],
    ['Workshop', '2024-02-01', 75],
    ['Seminar', '2024-04-20', 120],
    ['Meeting', '2024-01-10', 25],
    ['Training', '2024-05-05', 200]
  ],

  // Text data with various cases
  NAMES: [
    ['First Name', 'Last Name', 'Department'],
    ['john', 'DOE', 'Engineering'],
    ['Jane', 'smith', 'Marketing'],
    ['MIKE', 'Johnson', 'Sales'],
    ['Sarah', 'WILSON', 'HR'],
    ['david', 'brown', 'Finance']
  ]
};

/**
 * Test scenarios for sorting functionality
 */
const TestScenarios = [
  {
    name: 'Basic Ascending Sort',
    data: TestData.NUMBERS,
    criteria: [{ column: 0, order: 'asc' }],
    hasHeaders: true,
    expectedFirstValue: 1
  },
  {
    name: 'Multi-Column Sort',
    data: TestData.MIXED,
    criteria: [
      { column: 3, order: 'desc' }, // Active status first
      { column: 1, order: 'asc' }   // Then by age
    ],
    hasHeaders: true,
    expectedFirstValue: 'Alice Johnson'
  },
  {
    name: 'Custom Priority Sort',
    data: TestData.PRIORITIES,
    criteria: [{
      column: 1,
      order: 'asc',
      customOrder: ['High', 'Medium', 'Low']
    }],
    hasHeaders: true,
    expectedFirstValue: 'Fix login bug'
  },
  {
    name: 'Date Sort',
    data: TestData.DATES,
    criteria: [{ column: 1, order: 'desc', dataType: 'date' }],
    hasHeaders: true,
    expectedFirstValue: 'Training'
  }
];

/**
 * Generate random test data
 * @param {number} rows - Number of data rows (excluding headers)
 * @param {number} cols - Number of columns
 * @param {string} dataType - Type of data to generate
 * @return {Array<Array>} Generated test data
 */
function generateTestData(rows = 10, cols = 3, dataType = 'mixed') {
  const headers = [];
  for (let i = 0; i < cols; i++) {
    headers.push(`Column ${String.fromCharCode(65 + i)}`);
  }

  const data = [headers];

  for (let row = 0; row < rows; row++) {
    const rowData = [];
    for (let col = 0; col < cols; col++) {
      rowData.push(generateCellValue(dataType, row, col));
    }
    data.push(rowData);
  }

  return data;
}

/**
 * Generate a single cell value based on type
 * @param {string} dataType - Type of data to generate
 * @param {number} row - Row index
 * @param {number} col - Column index
 * @return {*} Generated value
 */
function generateCellValue(dataType, row, col) {
  switch (dataType) {
    case 'numbers':
      return Math.floor(Math.random() * 1000);
    
    case 'text':
      const words = ['Alpha', 'Beta', 'Gamma', 'Delta', 'Epsilon', 'Zeta'];
      return words[Math.floor(Math.random() * words.length)] + (row + 1);
    
    case 'dates':
      const startDate = new Date(2020, 0, 1);
      const endDate = new Date(2024, 11, 31);
      const randomTime = startDate.getTime() + Math.random() * (endDate.getTime() - startDate.getTime());
      return new Date(randomTime).toISOString().split('T')[0];
    
    case 'boolean':
      return Math.random() > 0.5;
    
    case 'mixed':
    default:
      const types = ['numbers', 'text', 'dates', 'boolean'];
      const randomType = types[col % types.length];
      return generateCellValue(randomType, row, col);
  }
}

/**
 * Run a test scenario
 * @param {Object} scenario - Test scenario object
 * @param {Function} sortFunction - Sorting function to test
 * @return {Object} Test result
 */
function runTestScenario(scenario, sortFunction) {
  const startTime = Date.now();
  
  try {
    const sortedData = sortFunction(scenario.data, scenario.criteria, scenario.hasHeaders);
    const endTime = Date.now();
    
    // Verify the result
    const dataStartRow = scenario.hasHeaders ? 1 : 0;
    const firstDataValue = sortedData[dataStartRow] ? sortedData[dataStartRow][0] : null;
    
    const passed = scenario.expectedFirstValue ? 
      firstDataValue === scenario.expectedFirstValue : 
      sortedData.length > 0;
    
    return {
      name: scenario.name,
      passed: passed,
      executionTime: endTime - startTime,
      result: sortedData,
      firstValue: firstDataValue,
      expected: scenario.expectedFirstValue,
      error: null
    };
  } catch (error) {
    return {
      name: scenario.name,
      passed: false,
      executionTime: Date.now() - startTime,
      result: null,
      firstValue: null,
      expected: scenario.expectedFirstValue,
      error: error.message
    };
  }
}

/**
 * Run all test scenarios
 * @param {Function} sortFunction - Sorting function to test
 * @return {Object} Test results summary
 */
function runAllTests(sortFunction) {
  const results = [];
  let passed = 0;
  let failed = 0;
  
  TestScenarios.forEach(scenario => {
    const result = runTestScenario(scenario, sortFunction);
    results.push(result);
    
    if (result.passed) {
      passed++;
    } else {
      failed++;
    }
  });
  
  return {
    total: results.length,
    passed: passed,
    failed: failed,
    results: results,
    summary: `${passed}/${results.length} tests passed`
  };
}

/**
 * Create a test spreadsheet range for Google Sheets
 * @param {string} sheetName - Name of the sheet
 * @param {Array<Array>} data - Test data
 * @return {string} A1 notation range
 */
function createTestRange(sheetName, data) {
  if (!data || data.length === 0) return `${sheetName}!A1`;
  
  const numRows = data.length;
  const numCols = data[0] ? data[0].length : 1;
  const endCol = String.fromCharCode(64 + numCols);
  
  return `${sheetName}!A1:${endCol}${numRows}`;
}

// Export for different environments
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    TestData,
    TestScenarios,
    generateTestData,
    generateCellValue,
    runTestScenario,
    runAllTests,
    createTestRange
  };
} else {
  window.TestUtilities = {
    TestData,
    TestScenarios,
    generateTestData,
    generateCellValue,
    runTestScenario,
    runAllTests,
    createTestRange
  };
}