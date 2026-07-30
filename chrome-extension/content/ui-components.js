/**
 * Advanced UI Components for Chrome Extension
 * Enhanced interface components for Google Sheets sorting
 */

class SortingUIComponents {
  constructor() {
    this.activeDialog = null;
    this.sortHistory = [];
    this.maxHistoryItems = 10;
  }

  /**
   * Create an advanced sorting dialog with multiple options
   * @param {Object} analysisData - Range analysis data
   * @return {HTMLElement} Advanced dialog element
   */
  createAdvancedSortDialog(analysisData) {
    const dialog = document.createElement('div');
    dialog.id = 'sheets-advanced-sort-dialog';
    dialog.className = 'sort-helper-dialog advanced-dialog';
    
    dialog.innerHTML = `
      <div class="sort-dialog-backdrop" onclick="this.closeSortingDialog()"></div>
      <div class="sort-dialog-content advanced-content">
        ${this.createDialogHeader()}
        ${this.createDataOverviewSection(analysisData)}
        ${this.createSortCriteriaSection(analysisData)}
        ${this.createAdvancedOptionsSection(analysisData)}
        ${this.createDialogFooter()}
      </div>
    `;
    
    // Bind event listeners
    this.bindDialogEvents(dialog);
    
    this.activeDialog = dialog;
    return dialog;
  }

  /**
   * Create dialog header with tabs
   * @return {string} Header HTML
   */
  createDialogHeader() {
    return `
      <div class="sort-dialog-header">
        <h2>Advanced Sorting Options</h2>
        <div class="dialog-tabs">
          <button class="tab-button active" data-tab="basic">Basic Sort</button>
          <button class="tab-button" data-tab="multi">Multi-Column</button>
          <button class="tab-button" data-tab="smart">Smart Sort</button>
        </div>
        <button onclick="window.sortingUI.closeSortingDialog()" class="close-button">&times;</button>
      </div>
    `;
  }

  /**
   * Create data overview section
   * @param {Object} analysisData - Analysis data
   * @return {string} Overview HTML
   */
  createDataOverviewSection(analysisData) {
    if (!analysisData || analysisData.isEmpty) {
      return `
        <div class="data-overview">
          <div class="overview-item">
            <span class="overview-label">Status:</span>
            <span class="overview-value warning">No data detected</span>
          </div>
        </div>
      `;
    }

    const topColumns = analysisData.columns
      ?.filter(col => col.sortability && col.sortability > 0.5)
      ?.slice(0, 3) || [];

    return `
      <div class="data-overview">
        <div class="overview-grid">
          <div class="overview-item">
            <span class="overview-label">Dimensions:</span>
            <span class="overview-value">${analysisData.numRows} rows × ${analysisData.numCols} columns</span>
          </div>
          <div class="overview-item">
            <span class="overview-label">Headers:</span>
            <span class="overview-value ${analysisData.hasHeaders ? 'success' : 'neutral'}">
              ${analysisData.hasHeaders ? 'Detected' : 'Not detected'}
            </span>
          </div>
          <div class="overview-item">
            <span class="overview-label">Data Quality:</span>
            <span class="overview-value">${this.getDataQualityText(analysisData)}</span>
          </div>
          ${topColumns.length > 0 ? `
          <div class="overview-item full-width">
            <span class="overview-label">Best Sort Columns:</span>
            <div class="column-chips">
              ${topColumns.map(col => `
                <span class="column-chip" data-column="${col.index}">
                  ${col.header} (${col.dataType})
                  <span class="confidence">${Math.round(col.sortability * 100)}%</span>
                </span>
              `).join('')}
            </div>
          </div>
          ` : ''}
        </div>
      </div>
    `;
  }

  /**
   * Create sort criteria configuration section
   * @param {Object} analysisData - Analysis data
   * @return {string} Criteria HTML
   */
  createSortCriteriaSection(analysisData) {
    const columns = analysisData?.columns || [];
    
    return `
      <div class="sort-criteria-section">
        <!-- Basic Sort Tab -->
        <div class="tab-content active" data-tab="basic">
          ${this.createBasicSortOptions(columns)}
        </div>
        
        <!-- Multi-Column Sort Tab -->
        <div class="tab-content" data-tab="multi">
          ${this.createMultiColumnSortOptions(columns)}
        </div>
        
        <!-- Smart Sort Tab -->
        <div class="tab-content" data-tab="smart">
          ${this.createSmartSortOptions(analysisData)}
        </div>
      </div>
    `;
  }

  /**
   * Create basic sort options
   * @param {Array} columns - Column information
   * @return {string} Basic sort HTML
   */
  createBasicSortOptions(columns) {
    const columnOptions = columns.map((column, index) => {
      const confidence = Math.round(column.confidence * 100);
      const sortability = column.sortability ? Math.round(column.sortability * 100) : 0;
      return `<option value="${index}" ${index === 0 ? 'selected' : ''}>
        ${column.header} (${column.dataType}, ${confidence}% confidence, ${sortability}% sortable)
      </option>`;
    }).join('');

    return `
      <div class="basic-sort-options">
        <div class="sort-option">
          <label>Sort Column:</label>
          <select id="basic-sort-column" class="enhanced-select">
            ${columnOptions}
          </select>
        </div>
        <div class="sort-option">
          <label>Sort Order:</label>
          <div class="radio-group">
            <label class="radio-option">
              <input type="radio" name="basic-sort-order" value="asc" checked>
              <span class="radio-custom"></span>
              <span class="radio-text">↑ Ascending (A-Z, 1-9, oldest first)</span>
            </label>
            <label class="radio-option">
              <input type="radio" name="basic-sort-order" value="desc">
              <span class="radio-custom"></span>
              <span class="radio-text">↓ Descending (Z-A, 9-1, newest first)</span>
            </label>
          </div>
        </div>
        <div class="sort-option">
          <label>Data Type Override:</label>
          <select id="basic-data-type">
            <option value="auto" selected>Auto-detect</option>
            <option value="text">Text</option>
            <option value="number">Numbers</option>
            <option value="date">Dates</option>
            <option value="boolean">Boolean</option>
          </select>
        </div>
      </div>
    `;
  }

  /**
   * Create multi-column sort options
   * @param {Array} columns - Column information
   * @return {string} Multi-column sort HTML
   */
  createMultiColumnSortOptions(columns) {
    return `
      <div class="multi-column-sort-options">
        <div class="sort-criteria-list" id="sort-criteria-list">
          ${this.createSortCriterionRow(columns, 0, true)}
        </div>
        <div class="sort-actions">
          <button type="button" class="add-criterion-btn" onclick="window.sortingUI.addSortCriterion()">
            <span class="btn-icon">+</span> Add Sort Column
          </button>
          <div class="sort-help">
            <span class="help-icon">?</span>
            <span class="help-text">Drag to reorder • Higher criteria take priority</span>
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Create a single sort criterion row
   * @param {Array} columns - Column information
   * @param {number} index - Criterion index
   * @param {boolean} isPrimary - Whether this is the primary criterion
   * @return {string} Criterion row HTML
   */
  createSortCriterionRow(columns, index, isPrimary = false) {
    const columnOptions = columns.map((column, colIndex) => 
      `<option value="${colIndex}" ${colIndex === index ? 'selected' : ''}>
        ${column.header} (${column.dataType})
      </option>`
    ).join('');

    const customOrderOptions = this.getCustomOrderOptions(columns[index]);

    return `
      <div class="sort-criterion-row" data-index="${index}">
        <div class="criterion-header">
          <span class="drag-handle" ${isPrimary ? 'style="visibility: hidden;"' : ''}>⋮⋮</span>
          <span class="criterion-label">${isPrimary ? 'Primary' : 'Secondary'} Sort</span>
          ${!isPrimary ? '<button class="remove-criterion" onclick="window.sortingUI.removeSortCriterion(' + index + ')">×</button>' : ''}
        </div>
        <div class="criterion-controls">
          <div class="control-group">
            <label>Column:</label>
            <select class="criterion-column" data-criterion="${index}">
              ${columnOptions}
            </select>
          </div>
          <div class="control-group">
            <label>Order:</label>
            <select class="criterion-order" data-criterion="${index}">
              <option value="asc" selected>Ascending</option>
              <option value="desc">Descending</option>
            </select>
          </div>
          ${customOrderOptions ? `
          <div class="control-group">
            <label>Custom Order:</label>
            <select class="criterion-custom" data-criterion="${index}">
              <option value="">None</option>
              ${customOrderOptions}
            </select>
          </div>
          ` : ''}
        </div>
      </div>
    `;
  }

  /**
   * Create smart sort options
   * @param {Object} analysisData - Analysis data
   * @return {string} Smart sort HTML
   */
  createSmartSortOptions(analysisData) {
    return `
      <div class="smart-sort-options">
        <div class="smart-sort-intro">
          <h3>Intelligent Sorting</h3>
          <p>Let AI analyze your data and choose the best sorting approach automatically.</p>
        </div>
        
        <div class="smart-options-grid">
          <div class="smart-option">
            <label class="smart-option-label">
              <input type="radio" name="smart-mode" value="auto" checked>
              <span class="smart-option-content">
                <span class="smart-option-title">Fully Automatic</span>
                <span class="smart-option-desc">Choose columns and order automatically</span>
              </span>
            </label>
          </div>
          
          <div class="smart-option">
            <label class="smart-option-label">
              <input type="radio" name="smart-mode" value="guided">
              <span class="smart-option-content">
                <span class="smart-option-title">Guided Sort</span>
                <span class="smart-option-desc">Suggest options with user confirmation</span>
              </span>
            </label>
          </div>
          
          <div class="smart-option">
            <label class="smart-option-label">
              <input type="radio" name="smart-mode" value="enhanced">
              <span class="smart-option-content">
                <span class="smart-option-title">Enhanced Manual</span>
                <span class="smart-option-desc">Manual selection with AI recommendations</span>
              </span>
            </label>
          </div>
        </div>
        
        <div class="smart-preferences">
          <h4>Smart Sort Preferences</h4>
          <div class="preference-group">
            <label class="checkbox-option">
              <input type="checkbox" id="prefer-recent-dates" checked>
              <span class="checkbox-custom"></span>
              <span class="checkbox-text">Prefer recent dates first</span>
            </label>
            <label class="checkbox-option">
              <input type="checkbox" id="prefer-high-numbers" checked>
              <span class="checkbox-custom"></span>
              <span class="checkbox-text">Prefer high numbers first</span>
            </label>
            <label class="checkbox-option">
              <input type="checkbox" id="detect-custom-orders" checked>
              <span class="checkbox-custom"></span>
              <span class="checkbox-text">Auto-detect custom sort orders</span>
            </label>
          </div>
        </div>
        
        ${analysisData && analysisData.columns ? this.createSmartSortPreview(analysisData) : ''}
      </div>
    `;
  }

  /**
   * Create smart sort preview
   * @param {Object} analysisData - Analysis data
   * @return {string} Preview HTML
   */
  createSmartSortPreview(analysisData) {
    // This would use the smart sort algorithm to generate a preview
    const smartResult = this.generateSmartSortPreview(analysisData);
    
    if (!smartResult || !smartResult.recommendedCriteria.length) {
      return '<div class="smart-preview-empty">No recommendations available</div>';
    }

    return `
      <div class="smart-sort-preview">
        <h4>AI Recommendations</h4>
        <div class="recommendations-list">
          ${smartResult.recommendedCriteria.map((criterion, index) => {
            const column = analysisData.columns[criterion.column];
            return `
              <div class="recommendation-item">
                <div class="recommendation-rank">${index + 1}</div>
                <div class="recommendation-content">
                  <div class="recommendation-title">${column.header}</div>
                  <div class="recommendation-details">
                    ${criterion.order === 'asc' ? '↑' : '↓'} ${criterion.order === 'asc' ? 'Ascending' : 'Descending'} • 
                    ${column.dataType} • 
                    ${Math.round(column.sortability * 100)}% confidence
                  </div>
                </div>
                <div class="recommendation-score">${Math.round(criterion.confidence * 100)}%</div>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    `;
  }

  /**
   * Create advanced options section
   * @param {Object} analysisData - Analysis data
   * @return {string} Options HTML
   */
  createAdvancedOptionsSection(analysisData) {
    return `
      <div class="advanced-options-section">
        <h3>Options</h3>
        <div class="options-grid">
          <label class="checkbox-option">
            <input type="checkbox" id="has-headers" ${analysisData?.hasHeaders ? 'checked' : ''}>
            <span class="checkbox-custom"></span>
            <span class="checkbox-text">First row contains headers</span>
          </label>
          
          <label class="checkbox-option">
            <input type="checkbox" id="create-backup" checked>
            <span class="checkbox-custom"></span>
            <span class="checkbox-text">Create backup before sorting</span>
          </label>
          
          <label class="checkbox-option">
            <input type="checkbox" id="show-preview" checked>
            <span class="checkbox-custom"></span>
            <span class="checkbox-text">Show preview before applying</span>
          </label>
          
          <label class="checkbox-option">
            <input type="checkbox" id="stable-sort">
            <span class="checkbox-custom"></span>
            <span class="checkbox-text">Stable sort (preserve original order for equal values)</span>
          </label>
          
          <label class="checkbox-option">
            <input type="checkbox" id="nulls-last" checked>
            <span class="checkbox-custom"></span>
            <span class="checkbox-text">Put empty cells at the end</span>
          </label>
        </div>
      </div>
    `;
  }

  /**
   * Create dialog footer with action buttons
   * @return {string} Footer HTML
   */
  createDialogFooter() {
    return `
      <div class="sort-dialog-footer advanced-footer">
        <div class="footer-left">
          <button type="button" class="btn-secondary" onclick="window.sortingUI.loadSortTemplate()">
            Load Template
          </button>
          <button type="button" class="btn-secondary" onclick="window.sortingUI.saveSortTemplate()">
            Save Template
          </button>
        </div>
        <div class="footer-right">
          <button type="button" class="btn-cancel" onclick="window.sortingUI.closeSortingDialog()">
            Cancel
          </button>
          <button type="button" class="btn-preview" onclick="window.sortingUI.previewAdvancedSort()">
            Preview
          </button>
          <button type="button" class="btn-apply" onclick="window.sortingUI.applyAdvancedSort()">
            Apply Sort
          </button>
        </div>
      </div>
    `;
  }

  /**
   * Get data quality description
   * @param {Object} analysisData - Analysis data
   * @return {string} Quality text
   */
  getDataQualityText(analysisData) {
    const emptyRatio = analysisData.emptyCells / analysisData.totalCells;
    if (emptyRatio < 0.1) return 'Excellent';
    if (emptyRatio < 0.25) return 'Good';
    if (emptyRatio < 0.5) return 'Fair';
    return 'Poor';
  }

  /**
   * Get custom order options for a column
   * @param {Object} column - Column information
   * @return {string|null} Options HTML or null
   */
  getCustomOrderOptions(column) {
    if (!column?.customOrderMatch) return null;
    
    const customOrders = {
      'MONTHS': 'Months (Jan, Feb, Mar...)',
      'MONTHS_SHORT': 'Short Months (January, February...)',
      'WEEKDAYS': 'Weekdays (Sun, Mon, Tue...)',
      'WEEKDAYS_SHORT': 'Short Weekdays (Sunday, Monday...)',
      'PRIORITY': 'Priority (High, Medium, Low)',
      'STATUS': 'Status (Not Started, In Progress, Completed)',
      'SIZES': 'Sizes (XS, S, M, L, XL...)'
    };
    
    return Object.entries(customOrders).map(([key, label]) => 
      `<option value="${key}">${label}</option>`
    ).join('');
  }

  /**
   * Generate smart sort preview (simplified)
   * @param {Object} analysisData - Analysis data
   * @return {Object} Smart sort recommendations
   */
  generateSmartSortPreview(analysisData) {
    // This is a simplified version - in practice would use the full smart sort algorithm
    const sortableColumns = analysisData.columns
      .filter(col => col.sortability > 0.3)
      .sort((a, b) => b.sortability - a.sortability);
    
    const recommendedCriteria = sortableColumns.slice(0, 2).map(col => ({
      column: col.index,
      order: col.sortRecommendation || 'asc',
      confidence: col.sortability,
      dataType: col.dataType
    }));
    
    return { recommendedCriteria };
  }

  /**
   * Bind event listeners to dialog
   * @param {HTMLElement} dialog - Dialog element
   */
  bindDialogEvents(dialog) {
    // Tab switching
    dialog.querySelectorAll('.tab-button').forEach(button => {
      button.addEventListener('click', (e) => {
        const targetTab = e.target.dataset.tab;
        this.switchTab(dialog, targetTab);
      });
    });

    // Column chip clicks
    dialog.querySelectorAll('.column-chip').forEach(chip => {
      chip.addEventListener('click', (e) => {
        const columnIndex = parseInt(e.target.dataset.column);
        this.selectColumn(dialog, columnIndex);
      });
    });

    // Make sort criteria draggable
    this.initializeDragAndDrop(dialog);
  }

  /**
   * Switch active tab in dialog
   * @param {HTMLElement} dialog - Dialog element
   * @param {string} tabName - Tab to switch to
   */
  switchTab(dialog, tabName) {
    // Update tab buttons
    dialog.querySelectorAll('.tab-button').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.tab === tabName);
    });

    // Update tab content
    dialog.querySelectorAll('.tab-content').forEach(content => {
      content.classList.toggle('active', content.dataset.tab === tabName);
    });
  }

  /**
   * Select a column from the overview chips
   * @param {HTMLElement} dialog - Dialog element
   * @param {number} columnIndex - Column index to select
   */
  selectColumn(dialog, columnIndex) {
    const activeTab = dialog.querySelector('.tab-content.active');
    if (activeTab.dataset.tab === 'basic') {
      const columnSelect = dialog.querySelector('#basic-sort-column');
      if (columnSelect) {
        columnSelect.value = columnIndex;
        columnSelect.dispatchEvent(new Event('change'));
      }
    }
  }

  /**
   * Initialize drag and drop for sort criteria
   * @param {HTMLElement} dialog - Dialog element
   */
  initializeDragAndDrop(dialog) {
    // This would implement drag and drop functionality for reordering sort criteria
    // Simplified implementation for now
    console.log('Drag and drop initialized for dialog', dialog);
  }

  /**
   * Add a new sort criterion
   */
  addSortCriterion() {
    const criteriaList = this.activeDialog?.querySelector('#sort-criteria-list');
    if (!criteriaList) return;

    const existingCriteria = criteriaList.querySelectorAll('.sort-criterion-row');
    const newIndex = existingCriteria.length;
    
    // This would add a new criterion row
    console.log('Adding sort criterion', newIndex);
  }

  /**
   * Remove a sort criterion
   * @param {number} index - Criterion index to remove
   */
  removeSortCriterion(index) {
    const criterionRow = this.activeDialog?.querySelector(`[data-index="${index}"]`);
    if (criterionRow && index > 0) { // Don't allow removing primary criterion
      criterionRow.remove();
    }
  }

  /**
   * Close the sorting dialog
   */
  closeSortingDialog() {
    if (this.activeDialog) {
      this.activeDialog.remove();
      this.activeDialog = null;
    }
  }

  /**
   * Preview advanced sort
   */
  async previewAdvancedSort() {
    // Implementation would gather form data and show preview
    console.log('Previewing advanced sort');
  }

  /**
   * Apply advanced sort
   */
  async applyAdvancedSort() {
    // Implementation would gather form data and apply sort
    console.log('Applying advanced sort');
  }

  /**
   * Load sort template
   */
  loadSortTemplate() {
    // Implementation would load saved sort configurations
    console.log('Loading sort template');
  }

  /**
   * Save sort template
   */
  saveSortTemplate() {
    // Implementation would save current sort configuration
    console.log('Saving sort template');
  }
}

// Create global instance
window.sortingUI = new SortingUIComponents();