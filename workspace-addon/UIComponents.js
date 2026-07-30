/**
 * UI Components for Google Workspace Add-on
 * Advanced UI building functions for the sorting interface
 */

/**
 * Create a multi-column sort configuration card
 * @param {Object} rangeData - Range data information
 * @param {Object} analysis - Data analysis results
 * @return {Card} Multi-column sort card
 */
function createMultiColumnSortCard(rangeData, analysis) {
  const card = CardService.newCardBuilder()
    .setHeader(CardService.newCardHeader()
      .setTitle('Multi-Column Sort')
      .setSubtitle(`${analysis.dataRows} rows, ${analysis.numCols} columns`));

  // Data overview section
  const overviewSection = CardService.newCardSection()
    .setHeader('Data Overview');

  overviewSection.addWidget(CardService.newKeyValue()
    .setTopLabel('Data Structure')
    .setContent(`${analysis.hasHeaders ? 'With headers' : 'No headers'} • ${analysis.emptyCells}/${analysis.totalCells} empty cells`));

  // Show top sortable columns
  const topColumns = analysis.columns
    .filter(col => col.sortability && col.sortability > 0.3)
    .slice(0, 3);

  if (topColumns.length > 0) {
    overviewSection.addWidget(CardService.newKeyValue()
      .setTopLabel('Best Sort Columns')
      .setContent(topColumns.map(col => `${col.header} (${col.dataType})`).join(', ')));
  }

  card.addSection(overviewSection);

  // Primary sort section
  const primarySection = CardService.newCardSection()
    .setHeader('Primary Sort Column');

  const primaryColumnWidget = CardService.newSelectionInput()
    .setType(CardService.SelectionInputType.DROPDOWN)
    .setTitle('Column')
    .setFieldName('primaryColumn');

  analysis.columns.forEach((column, index) => {
    const confidence = Math.round(column.confidence * 100);
    const sortability = column.sortability ? Math.round(column.sortability * 100) : 0;
    const label = `${column.header} (${column.dataType}, ${confidence}% confidence, ${sortability}% sortability)`;
    primaryColumnWidget.addItem(label, index.toString(), index === 0);
  });

  primarySection.addWidget(primaryColumnWidget);

  // Primary sort order
  primarySection.addWidget(CardService.newSelectionInput()
    .setType(CardService.SelectionInputType.RADIO_BUTTON)
    .setTitle('Sort Order')
    .setFieldName('primaryOrder')
    .addItem('Ascending (A-Z, 1-9)', 'asc', true)
    .addItem('Descending (Z-A, 9-1)', 'desc', false));

  card.addSection(primarySection);

  // Secondary sort section (if enough columns)
  if (analysis.columns.length > 1) {
    const secondarySection = CardService.newCardSection()
      .setHeader('Secondary Sort (Optional)');

    const secondaryColumnWidget = CardService.newSelectionInput()
      .setType(CardService.SelectionInputType.DROPDOWN)
      .setTitle('Column')
      .setFieldName('secondaryColumn')
      .addItem('None', '-1', true);

    analysis.columns.forEach((column, index) => {
      const label = `${column.header} (${column.dataType})`;
      secondaryColumnWidget.addItem(label, index.toString(), false);
    });

    secondarySection.addWidget(secondaryColumnWidget);

    secondarySection.addWidget(CardService.newSelectionInput()
      .setType(CardService.SelectionInputType.RADIO_BUTTON)
      .setTitle('Secondary Order')
      .setFieldName('secondaryOrder')
      .addItem('Ascending', 'asc', true)
      .addItem('Descending', 'desc', false));

    card.addSection(secondarySection);
  }

  // Advanced options section
  const optionsSection = CardService.newCardSection()
    .setHeader('Advanced Options');

  optionsSection.addWidget(CardService.newSelectionInput()
    .setType(CardService.SelectionInputType.CHECK_BOX)
    .setTitle('Sort Options')
    .setFieldName('sortOptions')
    .addItem('Data has headers', 'hasHeaders', analysis.hasHeaders)
    .addItem('Create backup before sorting', 'createBackup', true)
    .addItem('Show preview first', 'showPreview', true)
    .addItem('Use smart sort recommendations', 'useSmartSort', false));

  // Custom sort orders for applicable columns
  const customOrderColumns = analysis.columns.filter(col => col.customOrderMatch);
  if (customOrderColumns.length > 0) {
    const customOrderWidget = CardService.newSelectionInput()
      .setType(CardService.SelectionInputType.CHECK_BOX)
      .setTitle('Custom Sort Orders')
      .setFieldName('customOrders');

    customOrderColumns.forEach(col => {
      customOrderWidget.addItem(
        `Use ${col.customOrderMatch.name} order for ${col.header}`,
        `${col.index}:${col.customOrderMatch.name}`,
        true
      );
    });

    optionsSection.addWidget(customOrderWidget);
  }

  card.addSection(optionsSection);

  // Action buttons
  card.addSection(createMultiSortActionSection());

  return card.build();
}

/**
 * Create action buttons for multi-column sort
 * @return {CardSection} Action section
 */
function createMultiSortActionSection() {
  return CardService.newCardSection()
    .addWidget(CardService.newButtonSet()
      .addButton(CardService.newTextButton()
        .setText('Smart Sort')
        .setOnClickAction(CardService.newAction()
          .setFunctionName('performSmartSort'))
        .setTextButtonStyle(CardService.TextButtonStyle.FILLED))
      .addButton(CardService.newTextButton()
        .setText('Preview')
        .setOnClickAction(CardService.newAction()
          .setFunctionName('previewMultiSort'))
        .setTextButtonStyle(CardService.TextButtonStyle.OUTLINED))
      .addButton(CardService.newTextButton()
        .setText('Apply')
        .setOnClickAction(CardService.newAction()
          .setFunctionName('applyMultiSort'))
        .setTextButtonStyle(CardService.TextButtonStyle.OUTLINED)));
}

/**
 * Create a sort preview card with before/after comparison
 * @param {Array<Array>} originalData - Original data
 * @param {Array<Array>} sortedData - Sorted data preview
 * @param {Array<Object>} criteria - Applied sort criteria
 * @param {Object} analysis - Data analysis
 * @return {Card} Preview card
 */
function createSortPreviewCard(originalData, sortedData, criteria, analysis) {
  const card = CardService.newCardBuilder()
    .setHeader(CardService.newCardHeader()
      .setTitle('Sort Preview')
      .setSubtitle(`${criteria.length} criteria applied`));

  // Applied criteria section
  const criteriaSection = CardService.newCardSection()
    .setHeader('Applied Sort Criteria');

  criteria.forEach((criterion, index) => {
    const column = analysis.columns[criterion.column];
    const orderText = criterion.order === 'asc' ? '↑ Ascending' : '↓ Descending';
    const customText = criterion.customOrder ? ` (Custom: ${criterion.customOrder.slice(0, 3).join(', ')}...)` : '';
    
    criteriaSection.addWidget(CardService.newKeyValue()
      .setTopLabel(`${index + 1}. ${column.header}`)
      .setContent(`${orderText} • ${criterion.dataType}${customText}`));
  });

  card.addSection(criteriaSection);

  // Preview data section
  const previewSection = CardService.newCardSection()
    .setHeader('Preview Results');

  // Show sample of sorted data
  const sampleSize = Math.min(6, sortedData.length);
  const startRow = analysis.hasHeaders ? 1 : 0;
  
  for (let i = 0; i < Math.min(sampleSize - startRow, 5); i++) {
    const rowIndex = startRow + i;
    if (rowIndex < sortedData.length && sortedData[rowIndex]) {
      const rowData = sortedData[rowIndex];
      const displayCols = Math.min(3, rowData.length);
      const displayText = rowData.slice(0, displayCols).map(cell => 
        String(cell).length > 20 ? String(cell).substring(0, 17) + '...' : String(cell)
      ).join(' | ');
      
      previewSection.addWidget(CardService.newKeyValue()
        .setTopLabel(`Row ${i + 1}`)
        .setContent(displayText));
    }
  }

  if (sortedData.length > sampleSize) {
    previewSection.addWidget(CardService.newTextParagraph()
      .setText(`... and ${sortedData.length - sampleSize} more rows`));
  }

  card.addSection(previewSection);

  // Changes summary
  const changesSection = CardService.newCardSection()
    .setHeader('Changes Summary');

  const changesSummary = analyzeSortChanges(originalData, sortedData, analysis.hasHeaders);
  
  changesSection.addWidget(CardService.newKeyValue()
    .setTopLabel('Rows Affected')
    .setContent(`${changesSummary.movedRows}/${changesSummary.totalRows} rows will change position`));

  if (changesSummary.topChanges.length > 0) {
    const topChange = changesSummary.topChanges[0];
    changesSection.addWidget(CardService.newKeyValue()
      .setTopLabel('Biggest Change')
      .setContent(`Row ${topChange.originalPosition + 1} → Row ${topChange.newPosition + 1}`));
  }

  card.addSection(changesSection);

  // Action buttons
  const actionSection = CardService.newCardSection()
    .addWidget(CardService.newButtonSet()
      .addButton(CardService.newTextButton()
        .setText('Apply Sort')
        .setOnClickAction(CardService.newAction()
          .setFunctionName('confirmAndApplySort'))
        .setTextButtonStyle(CardService.TextButtonStyle.FILLED))
      .addButton(CardService.newTextButton()
        .setText('Modify Criteria')
        .setOnClickAction(CardService.newAction()
          .setFunctionName('backToSortConfig'))
        .setTextButtonStyle(CardService.TextButtonStyle.OUTLINED))
      .addButton(CardService.newTextButton()
        .setText('Cancel')
        .setOnClickAction(CardService.newAction()
          .setFunctionName('onSelectionChange'))
        .setTextButtonStyle(CardService.TextButtonStyle.OUTLINED)));

  card.addSection(actionSection);

  return card.build();
}

/**
 * Analyze changes between original and sorted data
 * @param {Array<Array>} originalData - Original data
 * @param {Array<Array>} sortedData - Sorted data
 * @param {boolean} hasHeaders - Whether data has headers
 * @return {Object} Changes analysis
 */
function analyzeSortChanges(originalData, sortedData, hasHeaders) {
  const startRow = hasHeaders ? 1 : 0;
  const dataRows = originalData.slice(startRow);
  const sortedRows = sortedData.slice(startRow);
  
  let movedRows = 0;
  const topChanges = [];
  
  // Create a map of original row positions
  const originalPositions = new Map();
  dataRows.forEach((row, index) => {
    const rowKey = row.join('|'); // Simple row identifier
    originalPositions.set(rowKey, index);
  });
  
  // Find position changes
  sortedRows.forEach((row, newIndex) => {
    const rowKey = row.join('|');
    const originalIndex = originalPositions.get(rowKey);
    
    if (originalIndex !== undefined && originalIndex !== newIndex) {
      movedRows++;
      const positionChange = Math.abs(newIndex - originalIndex);
      
      topChanges.push({
        originalPosition: originalIndex,
        newPosition: newIndex,
        positionChange: positionChange,
        rowData: row
      });
    }
  });
  
  // Sort by biggest position changes
  topChanges.sort((a, b) => b.positionChange - a.positionChange);
  
  return {
    totalRows: dataRows.length,
    movedRows: movedRows,
    percentageMoved: Math.round((movedRows / dataRows.length) * 100),
    topChanges: topChanges.slice(0, 5)
  };
}

/**
 * Create a smart sort results card
 * @param {Object} smartSortResult - Result from smart sort
 * @return {Card} Smart sort results card
 */
function createSmartSortResultCard(smartSortResult) {
  const card = CardService.newCardBuilder()
    .setHeader(CardService.newCardHeader()
      .setTitle('Smart Sort Applied')
      .setSubtitle(`Confidence: ${Math.round(smartSortResult.confidence * 100)}%`));

  // Applied criteria
  const criteriaSection = CardService.newCardSection()
    .setHeader('Automatic Sort Decisions');

  smartSortResult.appliedCriteria.forEach((criterion, index) => {
    const column = smartSortResult.analysis.columns.find(col => col.index === criterion.column);
    if (column) {
      const reasonText = getSmartSortReason(column, criterion, index === 0);
      
      criteriaSection.addWidget(CardService.newKeyValue()
        .setTopLabel(`${index + 1}. ${column.header}`)
        .setContent(reasonText));
    }
  });

  card.addSection(criteriaSection);

  // Results summary
  const resultsSection = CardService.newCardSection()
    .setHeader('Results');

  const dataRows = smartSortResult.analysis.dataRows;
  resultsSection.addWidget(CardService.newKeyValue()
    .setTopLabel('Sorted Data')
    .setContent(`${dataRows} rows sorted successfully`));

  resultsSection.addWidget(CardService.newKeyValue()
    .setTopLabel('Sort Quality')
    .setContent(getSortQualityDescription(smartSortResult.confidence)));

  card.addSection(resultsSection);

  // Action buttons
  const actionSection = CardService.newCardSection()
    .addWidget(CardService.newButtonSet()
      .addButton(CardService.newTextButton()
        .setText('Done')
        .setOnClickAction(CardService.newAction()
          .setFunctionName('onSelectionChange'))
        .setTextButtonStyle(CardService.TextButtonStyle.FILLED))
      .addButton(CardService.newTextButton()
        .setText('Undo Sort')
        .setOnClickAction(CardService.newAction()
          .setFunctionName('undoLastSort'))
        .setTextButtonStyle(CardService.TextButtonStyle.OUTLINED)));

  card.addSection(actionSection);

  return card.build();
}

/**
 * Get explanation for smart sort decision
 * @param {Object} column - Column information
 * @param {Object} criterion - Sort criterion
 * @param {boolean} isPrimary - Whether this is the primary sort
 * @return {string} Explanation text
 */
function getSmartSortReason(column, criterion) {
  const order = criterion.order === 'asc' ? 'ascending' : 'descending';
  const sortabilityPercent = Math.round(column.sortability * 100);
  
  let reason = `${order} (${sortabilityPercent}% sortability)`;
  
  if (criterion.customOrder) {
    reason += ` • Custom order detected`;
  } else if (column.dataType === 'date') {
    reason += ` • Date format`;
  } else if (column.dataType === 'number') {
    reason += ` • Numeric data`;
  }
  
  return reason;
}

/**
 * Get sort quality description
 * @param {number} confidence - Confidence score (0-1)
 * @return {string} Quality description
 */
function getSortQualityDescription(confidence) {
  if (confidence >= 0.8) return 'Excellent - High confidence in sort decisions';
  if (confidence >= 0.6) return 'Good - Confident in most sort decisions';
  if (confidence >= 0.4) return 'Fair - Some uncertainty in sort decisions';
  return 'Low - Limited data for optimal sorting';
}