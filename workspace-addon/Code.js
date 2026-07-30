/**
 * Google Sheets Sorting Helper - Main Entry Point
 * This is the primary Apps Script file for the Google Workspace Add-on
 */

/**
 * Creates the homepage card when the add-on is opened
 * @return {Card} The main homepage card
 */
function onHomepage() {
  return createMainCard();
}

/**
 * Handles selection change events in Google Sheets
 * @param {Object} e - The event object
 * @return {Card} Updated card based on selection
 */
function onSelectionChange(e) {
  const selectedRange = getSelectedRange();
  if (selectedRange) {
    return createSortingCard(selectedRange);
  }
  return createMainCard();
}

/**
 * Creates the main homepage card
 * @return {Card} The main card
 */
function createMainCard() {
  const card = CardService.newCardBuilder()
    .setHeader(CardService.newCardHeader()
      .setTitle('Sheets Sorting Helper')
      .setSubtitle('Advanced sorting made easy')
      .setImageUrl('https://www.gstatic.com/images/branding/product/2x/sheets_48dp.png'))
    .addSection(CardService.newCardSection()
      .addWidget(CardService.newTextParagraph()
        .setText('Select a data range in your sheet to start sorting with advanced options.'))
      .addWidget(CardService.newButtonSet()
        .addButton(CardService.newTextButton()
          .setText('Quick Sort')
          .setOnClickAction(CardService.newAction()
            .setFunctionName('quickSort')))
        .addButton(CardService.newTextButton()
          .setText('Custom Sort')
          .setOnClickAction(CardService.newAction()
            .setFunctionName('openCustomSort')))))
    .addSection(CardService.newCardSection()
      .setHeader('Features')
      .addWidget(CardService.newKeyValue()
        .setTopLabel('✓ Multi-column sorting')
        .setContent('Sort by multiple columns with priority'))
      .addWidget(CardService.newKeyValue()
        .setTopLabel('✓ Custom sort orders')
        .setContent('Define your own sorting sequences'))
      .addWidget(CardService.newKeyValue()
        .setTopLabel('✓ Preview before applying')
        .setContent('See changes before they\'re made'))
      .addWidget(CardService.newKeyValue()
        .setTopLabel('✓ Auto-sort setup')
        .setContent('Automatically sort new data')))
    .build();

  return card;
}

/**
 * Gets the currently selected range in the active sheet
 * @return {Object|null} Range information or null if no selection
 */
function getSelectedRange() {
  try {
    const sheet = SpreadsheetApp.getActiveSheet();
    const range = sheet.getActiveRange();
    
    if (range) {
      return {
        sheet: sheet,
        range: range,
        values: range.getValues(),
        numRows: range.getNumRows(),
        numCols: range.getNumColumns(),
        a1Notation: range.getA1Notation()
      };
    }
  } catch (error) {
    console.error('Error getting selected range:', error);
  }
  
  return null;
}

/**
 * Creates a sorting card based on the selected range
 * @param {Object} rangeInfo - Information about the selected range
 * @return {Card} The sorting configuration card
 */
function createSortingCard(rangeInfo) {
  const card = CardService.newCardBuilder()
    .setHeader(CardService.newCardHeader()
      .setTitle('Sort Configuration')
      .setSubtitle(`Range: ${rangeInfo.a1Notation} (${rangeInfo.numRows} rows, ${rangeInfo.numCols} cols)`))
    .addSection(createSortOptionsSection(rangeInfo))
    .addSection(createActionSection())
    .build();

  return card;
}

/**
 * Creates the sort options section
 * @param {Object} rangeInfo - Information about the selected range
 * @return {CardSection} The sort options section
 */
function createSortOptionsSection(rangeInfo) {
  const section = CardService.newCardSection()
    .setHeader('Sort Options');

  // Add column selection dropdown
  const columnWidget = CardService.newSelectionInput()
    .setType(CardService.SelectionInputType.DROPDOWN)
    .setTitle('Primary Sort Column')
    .setFieldName('primaryColumn');

  // Add column options based on the range
  for (let i = 0; i < rangeInfo.numCols; i++) {
    const columnLetter = String.fromCharCode(65 + i);
    const columnValue = rangeInfo.values[0] ? rangeInfo.values[0][i] : `Column ${columnLetter}`;
    columnWidget.addItem(columnValue || `Column ${columnLetter}`, i.toString(), i === 0);
  }

  section.addWidget(columnWidget);

  // Add sort order selection
  section.addWidget(CardService.newSelectionInput()
    .setType(CardService.SelectionInputType.RADIO_BUTTON)
    .setTitle('Sort Order')
    .setFieldName('sortOrder')
    .addItem('Ascending (A-Z, 1-9)', 'asc', true)
    .addItem('Descending (Z-A, 9-1)', 'desc', false));

  // Add data type selection
  section.addWidget(CardService.newSelectionInput()
    .setType(CardService.SelectionInputType.RADIO_BUTTON)
    .setTitle('Data Type')
    .setFieldName('dataType')
    .addItem('Auto-detect', 'auto', true)
    .addItem('Text', 'text', false)
    .addItem('Numbers', 'numbers', false)
    .addItem('Dates', 'dates', false));

  // Add header row option
  section.addWidget(CardService.newSelectionInput()
    .setType(CardService.SelectionInputType.CHECK_BOX)
    .setTitle('Options')
    .setFieldName('options')
    .addItem('First row contains headers', 'hasHeaders', true));

  return section;
}

/**
 * Creates the action buttons section
 * @return {CardSection} The action section
 */
function createActionSection() {
  return CardService.newCardSection()
    .addWidget(CardService.newButtonSet()
      .addButton(CardService.newTextButton()
        .setText('Preview Sort')
        .setOnClickAction(CardService.newAction()
          .setFunctionName('previewSort'))
        .setTextButtonStyle(CardService.TextButtonStyle.OUTLINED))
      .addButton(CardService.newTextButton()
        .setText('Apply Sort')
        .setOnClickAction(CardService.newAction()
          .setFunctionName('applySort'))
        .setTextButtonStyle(CardService.TextButtonStyle.FILLED)));
}

/**
 * Quick sort functionality with smart defaults
 */
function quickSort() {
  try {
    const sheetInfo = sheetsAPI.getCurrentSheetInfo();
    const rangeData = sheetsAPI.getRangeData(sheetInfo.range);
    
    if (rangeData.isEmpty) {
      return CardService.newNotification()
        .setText('Please select a data range first')
        .setType(CardService.NotificationType.WARNING);
    }

    // Analyze the data to determine best sort approach
    const analysis = sheetsAPI.analyzeDataStructure(rangeData.values, true);
    
    if (analysis.columns.length === 0) {
      return CardService.newNotification()
        .setText('No data found to sort')
        .setType(CardService.NotificationType.WARNING);
    }

    // Default: sort by first column, ascending, auto-detect type
    const sortCriteria = [{
      column: 0,
      order: 'asc',
      dataType: analysis.columns[0].dataType
    }];

    const sortResult = sheetsAPI.sortRange(
      sheetInfo.range,
      sortCriteria,
      analysis.hasHeaders,
      true // Create backup
    );

    if (sortResult.success) {
      return CardService.newNotification()
        .setText(`Quick sort applied! Sorted ${sortResult.sortedRows} rows by ${analysis.columns[0].header}`)
        .setType(CardService.NotificationType.INFO);
    } else {
      throw new Error('Sort operation failed');
    }
    
  } catch (error) {
    console.error('Quick sort error:', error);
    return CardService.newNotification()
      .setText('Quick sort failed: ' + error.message)
      .setType(CardService.NotificationType.ERROR);
  }
}

/**
 * Open custom sort interface
 */
function openCustomSort() {
  try {
    const sheetInfo = sheetsAPI.getCurrentSheetInfo();
    const rangeData = sheetsAPI.getRangeData(sheetInfo.range);
    
    if (rangeData.isEmpty) {
      return CardService.newNotification()
        .setText('Please select a data range first')
        .setType(CardService.NotificationType.WARNING);
    }

    return createAdvancedSortCard(rangeData);
    
  } catch (error) {
    console.error('Custom sort error:', error);
    return CardService.newNotification()
      .setText('Could not open custom sort: ' + error.message)
      .setType(CardService.NotificationType.ERROR);
  }
}

/**
 * Preview sort functionality
 * @param {Object} e - The event object containing form inputs
 */
function previewSort(e) {
  try {
    const formInputs = e.formInput;
    const sortCriteria = buildSortCriteria(formInputs);
    
    if (!sortCriteria || sortCriteria.length === 0) {
      return CardService.newNotification()
        .setText('Please configure sort criteria first')
        .setType(CardService.NotificationType.WARNING);
    }

    const sheetInfo = sheetsAPI.getCurrentSheetInfo();
    const rangeData = sheetsAPI.getRangeData(sheetInfo.range);
    
    if (rangeData.isEmpty) {
      return CardService.newNotification()
        .setText('Selected range is empty')
        .setType(CardService.NotificationType.WARNING);
    }

    const hasHeaders = formInputs.options && formInputs.options.includes('hasHeaders');
    const sortedData = sheetsAPI.performAdvancedSort(rangeData.values, sortCriteria, hasHeaders);
    
    // Create preview card
    return createPreviewCard(rangeData.values, sortedData, sortCriteria, hasHeaders);
    
  } catch (error) {
    console.error('Preview sort error:', error);
    return CardService.newNotification()
      .setText('Preview failed: ' + error.message)
      .setType(CardService.NotificationType.ERROR);
  }
}

/**
 * Apply sort functionality
 * @param {Object} e - The event object containing form inputs
 */
function applySort(e) {
  try {
    const formInputs = e.formInput;
    const sortCriteria = buildSortCriteria(formInputs);
    
    if (!sortCriteria || sortCriteria.length === 0) {
      return CardService.newNotification()
        .setText('Please configure sort criteria first')
        .setType(CardService.NotificationType.WARNING);
    }

    const sheetInfo = sheetsAPI.getCurrentSheetInfo();
    const hasHeaders = formInputs.options && formInputs.options.includes('hasHeaders');
    
    const sortResult = sheetsAPI.sortRange(
      sheetInfo.range,
      sortCriteria,
      hasHeaders,
      true // Create backup
    );

    if (sortResult.success) {
      const message = `Successfully sorted ${sortResult.sortedRows} rows using ${sortResult.criteria} criteria`;
      return CardService.newNotification()
        .setText(message)
        .setType(CardService.NotificationType.INFO);
    } else {
      throw new Error('Sort operation failed');
    }
    
  } catch (error) {
    console.error('Apply sort error:', error);
    return CardService.newNotification()
      .setText('Sort failed: ' + error.message)
      .setType(CardService.NotificationType.ERROR);
  }
}

/**
 * Build sort criteria from form inputs
 * @param {Object} formInputs - Form input values
 * @return {Array<Object>} Sort criteria array
 */
function buildSortCriteria(formInputs) {
  const criteria = [];
  
  if (formInputs.primaryColumn !== undefined) {
    const columnIndex = parseInt(formInputs.primaryColumn);
    const sortOrder = formInputs.sortOrder || 'asc';
    const dataType = formInputs.dataType || 'auto';
    
    criteria.push({
      column: columnIndex,
      order: sortOrder,
      dataType: dataType
    });
  }
  
  return criteria;
}

/**
 * Create a preview card showing before and after data
 * @param {Array<Array>} originalData - Original data
 * @param {Array<Array>} sortedData - Sorted data
 * @param {Array<Object>} sortCriteria - Sort criteria used
 * @param {boolean} hasHeaders - Whether data has headers
 * @return {Card} Preview card
 */
function createPreviewCard(originalData, sortedData, sortCriteria, hasHeaders) {
  const card = CardService.newCardBuilder()
    .setHeader(CardService.newCardHeader()
      .setTitle('Sort Preview')
      .setSubtitle(`${sortCriteria.length} criteria applied`));

  // Add preview section
  const previewSection = CardService.newCardSection()
    .setHeader('Preview Results');

  // Show a few rows of the sorted data
  const previewRows = Math.min(5, sortedData.length);
  const startRow = hasHeaders ? 1 : 0;
  
  for (let i = 0; i < previewRows; i++) {
    const rowIndex = startRow + i;
    if (rowIndex < sortedData.length) {
      const rowData = sortedData[rowIndex];
      const displayText = rowData.slice(0, 3).join(' | '); // Show first 3 columns
      
      previewSection.addWidget(CardService.newKeyValue()
        .setTopLabel(`Row ${i + 1}`)
        .setContent(displayText));
    }
  }

  card.addSection(previewSection);

  // Add action buttons
  const actionSection = CardService.newCardSection()
    .addWidget(CardService.newButtonSet()
      .addButton(CardService.newTextButton()
        .setText('Apply Sort')
        .setOnClickAction(CardService.newAction()
          .setFunctionName('confirmApplySort'))
        .setTextButtonStyle(CardService.TextButtonStyle.FILLED))
      .addButton(CardService.newTextButton()
        .setText('Cancel')
        .setOnClickAction(CardService.newAction()
          .setFunctionName('onSelectionChange'))
        .setTextButtonStyle(CardService.TextButtonStyle.OUTLINED)));

  card.addSection(actionSection);
  
/**
 * Creates an advanced sorting card with multiple options
 * @param {Object} rangeData - Range data information
 * @return {Card} Advanced sort configuration card
 */
function createAdvancedSortCard(rangeData) {
  const analysis = sheetsAPI.analyzeDataStructure(rangeData.values, true);
  
  const card = CardService.newCardBuilder()
    .setHeader(CardService.newCardHeader()
      .setTitle('Advanced Sort Options')
      .setSubtitle(`${analysis.dataRows} rows, ${analysis.numCols} columns`));

  // Data analysis section
  const analysisSection = CardService.newCardSection()
    .setHeader('Data Analysis');
    
  analysisSection.addWidget(CardService.newKeyValue()
    .setTopLabel('Data Type Detection')
    .setContent(analysis.hasHeaders ? 'Headers detected' : 'No headers detected'));
    
  if (analysis.columns.length > 0) {
    const topColumn = analysis.columns[0];
    analysisSection.addWidget(CardService.newKeyValue()
      .setTopLabel(`Primary Column (${topColumn.header})`)
      .setContent(`${topColumn.dataType} (${Math.round(topColumn.confidence * 100)}% confidence)`));
  }

  card.addSection(analysisSection);

  // Sort configuration section
  const configSection = CardService.newCardSection()
    .setHeader('Sort Configuration');

  // Column selection
  const columnWidget = CardService.newSelectionInput()
    .setType(CardService.SelectionInputType.DROPDOWN)
    .setTitle('Primary Sort Column')
    .setFieldName('primaryColumn');

  analysis.columns.forEach((column, index) => {
    const label = `${column.header} (${column.dataType})`;
    columnWidget.addItem(label, index.toString(), index === 0);
  });

  configSection.addWidget(columnWidget);

  // Sort order
  configSection.addWidget(CardService.newSelectionInput()
    .setType(CardService.SelectionInputType.RADIO_BUTTON)
    .setTitle('Sort Order')
    .setFieldName('sortOrder')
    .addItem('Ascending (A-Z, 1-9)', 'asc', true)
    .addItem('Descending (Z-A, 9-1)', 'desc', false));

  // Data type override
  configSection.addWidget(CardService.newSelectionInput()
    .setType(CardService.SelectionInputType.DROPDOWN)
    .setTitle('Data Type Override')
    .setFieldName('dataType')
    .addItem('Auto-detect', 'auto', true)
    .addItem('Text', 'text', false)
    .addItem('Numbers', 'number', false)
    .addItem('Dates', 'date', false));

  // Options
  configSection.addWidget(CardService.newSelectionInput()
    .setType(CardService.SelectionInputType.CHECK_BOX)
    .setTitle('Options')
    .setFieldName('options')
    .addItem('Data has headers', 'hasHeaders', analysis.hasHeaders)
    .addItem('Create backup before sorting', 'createBackup', true));

  card.addSection(configSection);

  // Action buttons
  card.addSection(createActionSection());
  
  return card.build();
}

/**
 * Confirm and apply sort after preview
 * @param {Object} e - Event object
 */
function confirmApplySort(e) {
  // This function would be called from the preview card
  // For now, redirect to apply sort
  return applySort(e);
}

/**
 * Perform smart sort with AI recommendations
 * @param {Object} e - Event object
 */
function performSmartSort(e) {
  try {
    const sheetInfo = sheetsAPI.getCurrentSheetInfo();
    const rangeData = sheetsAPI.getRangeData(sheetInfo.range);
    
    if (rangeData.isEmpty) {
      return CardService.newNotification()
        .setText('Please select a data range first')
        .setType(CardService.NotificationType.WARNING);
    }

    // Perform smart sort analysis
    const analysis = sheetsAPI.analyzeDataStructure(rangeData.values, true);
    const bestColumn = analysis.columns.find(col => col.sortability && col.sortability > 0.5) || analysis.columns[0];
    
    if (!bestColumn) {
      return CardService.newNotification()
        .setText('Unable to determine best sort approach for this data')
        .setType(CardService.NotificationType.WARNING);
    }

    const smartCriteria = [{
      column: bestColumn.index,
      order: bestColumn.sortRecommendation || 'asc',
      dataType: bestColumn.dataType
    }];

    const sortResult = sheetsAPI.sortRange(
      sheetInfo.range,
      smartCriteria,
      analysis.hasHeaders,
      true
    );

    if (sortResult.success) {
      // Show smart sort results
      const smartResult = {
        appliedCriteria: smartCriteria,
        analysis: analysis,
        confidence: bestColumn.sortability || 0.5
      };
      
      return createSmartSortResultCard(smartResult);
    } else {
      throw new Error('Smart sort operation failed');
    }
    
  } catch (error) {
    console.error('Smart sort error:', error);
    return CardService.newNotification()
      .setText('Smart sort failed: ' + error.message)
      .setType(CardService.NotificationType.ERROR);
  }
}

/**
 * Preview multi-column sort
 * @param {Object} e - Event object
 */
function previewMultiSort(e) {
  try {
    const formInputs = e.formInput;
    const multiSortCriteria = buildMultiSortCriteria(formInputs);
    
    if (!multiSortCriteria || multiSortCriteria.length === 0) {
      return CardService.newNotification()
        .setText('Please configure at least one sort criterion')
        .setType(CardService.NotificationType.WARNING);
    }

    const sheetInfo = sheetsAPI.getCurrentSheetInfo();
    const rangeData = sheetsAPI.getRangeData(sheetInfo.range);
    
    const hasHeaders = formInputs.sortOptions && formInputs.sortOptions.includes('hasHeaders');
    const sortedData = sheetsAPI.performAdvancedSort(rangeData.values, multiSortCriteria, hasHeaders);
    const analysis = sheetsAPI.analyzeDataStructure(rangeData.values, hasHeaders);
    
    return createSortPreviewCard(rangeData.values, sortedData, multiSortCriteria, analysis);
    
  } catch (error) {
    console.error('Multi-sort preview error:', error);
    return CardService.newNotification()
      .setText('Preview failed: ' + error.message)
      .setType(CardService.NotificationType.ERROR);
  }
}

/**
 * Apply multi-column sort
 * @param {Object} e - Event object
 */
function applyMultiSort(e) {
  try {
    const formInputs = e.formInput;
    const multiSortCriteria = buildMultiSortCriteria(formInputs);
    
    if (!multiSortCriteria || multiSortCriteria.length === 0) {
      return CardService.newNotification()
        .setText('Please configure at least one sort criterion')
        .setType(CardService.NotificationType.WARNING);
    }

    const sheetInfo = sheetsAPI.getCurrentSheetInfo();
    const hasHeaders = formInputs.sortOptions && formInputs.sortOptions.includes('hasHeaders');
    const createBackup = formInputs.sortOptions && formInputs.sortOptions.includes('createBackup');
    
    const sortResult = sheetsAPI.sortRange(
      sheetInfo.range,
      multiSortCriteria,
      hasHeaders,
      createBackup
    );

    if (sortResult.success) {
      const message = `Multi-column sort applied! Sorted ${sortResult.sortedRows} rows using ${sortResult.criteria} criteria`;
      return CardService.newNotification()
        .setText(message)
        .setType(CardService.NotificationType.INFO);
    } else {
      throw new Error('Sort operation failed');
    }
    
  } catch (error) {
    console.error('Multi-sort error:', error);
    return CardService.newNotification()
      .setText('Multi-column sort failed: ' + error.message)
      .setType(CardService.NotificationType.ERROR);
  }
}

/**
 * Build multi-column sort criteria from form inputs
 * @param {Object} formInputs - Form input values
 * @return {Array<Object>} Sort criteria array
 */
function buildMultiSortCriteria(formInputs) {
  const criteria = [];
  
  // Primary criterion
  if (formInputs.primaryColumn !== undefined) {
    const primaryCriterion = {
      column: parseInt(formInputs.primaryColumn),
      order: formInputs.primaryOrder || 'asc',
      dataType: 'auto'
    };
    
    // Check for custom sort orders
    if (formInputs.customOrders) {
      const customOrdersArray = Array.isArray(formInputs.customOrders) ? formInputs.customOrders : [formInputs.customOrders];
      const primaryCustomOrder = customOrdersArray.find(order => 
        order.startsWith(primaryCriterion.column + ':')
      );
      
      if (primaryCustomOrder) {
        const orderName = primaryCustomOrder.split(':')[1];
        primaryCriterion.customOrder = getCustomOrderArray(orderName);
      }
    }
    
    criteria.push(primaryCriterion);
  }
  
  // Secondary criterion
  if (formInputs.secondaryColumn !== undefined && formInputs.secondaryColumn !== '-1') {
    criteria.push({
      column: parseInt(formInputs.secondaryColumn),
      order: formInputs.secondaryOrder || 'asc',
      dataType: 'auto'
    });
  }
  
  return criteria;
}

/**
 * Get custom order array by name
 * @param {string} orderName - Custom order name
 * @return {Array|null} Custom order array
 */
function getCustomOrderArray(orderName) {
  const customOrders = {
    'MONTHS': ['January', 'February', 'March', 'April', 'May', 'June',
               'July', 'August', 'September', 'October', 'November', 'December'],
    'MONTHS_SHORT': ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                     'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    'WEEKDAYS': ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
    'WEEKDAYS_SHORT': ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
    'PRIORITY': ['High', 'Medium', 'Low'],
    'STATUS': ['Not Started', 'In Progress', 'Completed'],
    'SIZES': ['XS', 'S', 'M', 'L', 'XL', 'XXL']
  };
  
  return customOrders[orderName] || null;
}