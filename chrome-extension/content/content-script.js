/**
 * Google Sheets Sorting Helper - Content Script
 * Injects sorting functionality into Google Sheets interface
 */

// Initialize the extension when the page loads
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeExtension);
} else {
  initializeExtension();
}

/**
 * Initialize the extension functionality
 */
function initializeExtension() {
  console.log('Google Sheets Sorting Helper: Initializing...');
  
  // Check if we're on a Google Sheets page
  if (!isGoogleSheetsPage()) {
    console.log('Not a Google Sheets page, skipping initialization');
    return;
  }

  // Wait for the Sheets interface to load
  waitForSheetsInterface(async () => {
    console.log('Google Sheets interface detected');
    
    // Initialize API client
    const apiInitialized = await sheetsAPIClient.initialize();
    if (!apiInitialized) {
      console.error('Failed to initialize Sheets API client');
      return;
    }
    
    setupSortingUI();
    setupEventListeners();
  });
}

/**
 * Check if current page is Google Sheets
 * @return {boolean} True if on Google Sheets
 */
function isGoogleSheetsPage() {
  return window.location.hostname === 'docs.google.com' && 
         window.location.pathname.includes('/spreadsheets/');
}

/**
 * Wait for Google Sheets interface to fully load
 * @param {Function} callback - Function to call when ready
 */
function waitForSheetsInterface(callback) {
  let attempts = 0;
  const maxAttempts = 50; // 10 seconds max wait time
  
  const checkInterval = setInterval(() => {
    attempts++;
    
    // Look for key Google Sheets UI elements
    const toolbar = document.querySelector('[role="toolbar"]');
    const grid = document.querySelector('[role="grid"]');
    
    if (toolbar && grid) {
      clearInterval(checkInterval);
      callback();
    } else if (attempts >= maxAttempts) {
      clearInterval(checkInterval);
      console.error('Google Sheets interface not found after 10 seconds');
    }
  }, 200);
}

/**
 * Set up the sorting UI elements
 */
function setupSortingUI() {
  // Create floating action button
  createFloatingActionButton();
  
  // Add sorting options to existing menus (if possible)
  enhanceExistingMenus();
}

/**
 * Create a floating action button for quick access
 */
function createFloatingActionButton() {
  // Check if button already exists
  if (document.getElementById('sheets-sort-helper-fab')) {
    return;
  }

  const fab = document.createElement('div');
  fab.id = 'sheets-sort-helper-fab';
  fab.className = 'sort-helper-fab';
  fab.title = 'Advanced Sort Options';
  fab.innerHTML = `
    <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
      <path d="M3 18h6v-2H3v2zM3 6v2h18V6H3zm0 7h12v-2H3v2z"/>
    </svg>
  `;
  
  fab.addEventListener('click', showSortingDialog);
  
  // Position the button
  fab.style.cssText = `
    position: fixed;
    right: 20px;
    bottom: 80px;
    width: 56px;
    height: 56px;
    border-radius: 50%;
    background-color: #4285f4;
    box-shadow: 0 2px 10px rgba(0,0,0,0.3);
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    transition: all 0.3s ease;
  `;
  
  // Add hover effects
  fab.addEventListener('mouseenter', () => {
    fab.style.transform = 'scale(1.1)';
    fab.style.boxShadow = '0 4px 15px rgba(0,0,0,0.4)';
  });
  
  fab.addEventListener('mouseleave', () => {
    fab.style.transform = 'scale(1)';
    fab.style.boxShadow = '0 2px 10px rgba(0,0,0,0.3)';
  });
  
  document.body.appendChild(fab);
}

/**
 * Enhance existing Google Sheets menus with sorting options
 */
function enhanceExistingMenus() {
  // This is a placeholder for enhancing existing menus
  // In a real implementation, we would need to carefully observe
  // Google Sheets' menu structure and add options appropriately
  console.log('Menu enhancement placeholder - to be implemented');
}

/**
 * Set up event listeners for sheet interactions
 */
function setupEventListeners() {
  // Listen for selection changes
  document.addEventListener('selectionchange', handleSelectionChange);
  
  // Listen for keyboard shortcuts
  document.addEventListener('keydown', handleKeyboardShortcuts);
  
  // Listen for messages from background script
  chrome.runtime.onMessage.addListener(handleBackgroundMessage);
}

/**
 * Handle selection changes in the sheet
 */
function handleSelectionChange() {
  // Debounce selection changes to avoid excessive processing
  clearTimeout(window.selectionChangeTimeout);
  window.selectionChangeTimeout = setTimeout(() => {
    const selectedRange = getSelectedRange();
    if (selectedRange) {
      updateFabVisibility(true);
    } else {
      updateFabVisibility(false);
    }
  }, 300);
}

/**
 * Handle keyboard shortcuts
 * @param {Event} event - The keyboard event
 */
function handleKeyboardShortcuts(event) {
  // Ctrl+Shift+S for sort dialog
  if (event.ctrlKey && event.shiftKey && event.key === 'S') {
    event.preventDefault();
    showSortingDialog();
  }
  
  // Ctrl+Shift+Q for quick sort
  if (event.ctrlKey && event.shiftKey && event.key === 'Q') {
    event.preventDefault();
    performQuickSort();
  }
}

/**
 * Handle messages from background script
 * @param {Object} message - The message object
 * @param {Object} sender - The sender object
 * @param {Function} sendResponse - Response function
 */
function handleBackgroundMessage(message, sender, sendResponse) {
  switch (message.action) {
    case 'showSortDialog':
      showSortingDialog();
      break;
    default:
      console.log('Unknown message action:', message.action);
  }
}

/**
 * Get the currently selected range information
 * @return {Object|null} Range information or null
 */
function getSelectedRange() {
  // This is a simplified version - real implementation would need to
  // interact with Google Sheets' internal APIs or DOM structure
  const selection = window.getSelection();
  if (selection.rangeCount > 0) {
    return {
      text: selection.toString(),
      range: selection.getRangeAt(0)
    };
  }
  return null;
}

/**
 * Update the visibility of the floating action button
 * @param {boolean} visible - Whether the button should be visible
 */
function updateFabVisibility(visible) {
  const fab = document.getElementById('sheets-sort-helper-fab');
  if (fab) {
    fab.style.display = visible ? 'flex' : 'none';
  }
}

/**
 * Show the sorting dialog
 */
async function showSortingDialog() {
  try {
    // Get current spreadsheet info
    const spreadsheetId = sheetsAPIClient.getSpreadsheetId();
    if (!spreadsheetId) {
      alert('Could not detect spreadsheet. Please make sure you are on a Google Sheets page.');
      return;
    }

    // Analyze the current selection (simplified - would need better selection detection)
    const currentRange = 'A1:Z100'; // Placeholder - would need actual selection detection
    const analysis = await sheetsAPIClient.analyzeRange(spreadsheetId, currentRange);
    
    // Create and show the advanced sorting dialog
    const dialog = window.sortingUI.createAdvancedSortDialog(analysis);
    document.body.appendChild(dialog);
    
    // Add fade-in animation
    setTimeout(() => {
      dialog.classList.add('dialog-visible');
    }, 10);
    
  } catch (error) {
    console.error('Error showing sorting dialog:', error);
    alert('Failed to load sorting options: ' + error.message);
  }
}

/**
 * Create the sorting dialog with analysis data
 * @param {Object} analysisData - Range analysis data
 * @return {HTMLElement} The dialog element
 */
function createSortingDialog(analysisData) {
  const dialog = document.createElement('div');
  dialog.id = 'sheets-sort-dialog';
  dialog.className = 'sort-helper-dialog';
  
  // Build column options from analysis
  let columnOptions = '';
  if (analysisData && analysisData.columns) {
    analysisData.columns.forEach((column, index) => {
      const selected = index === 0 ? 'selected' : '';
      columnOptions += `<option value="${index}" ${selected}>${column.header} (${column.dataType})</option>`;
    });
  } else {
    // Fallback options
    for (let i = 0; i < 10; i++) {
      const selected = i === 0 ? 'selected' : '';
      columnOptions += `<option value="${i}" ${selected}>Column ${String.fromCharCode(65 + i)}</option>`;
    }
  }
  
  dialog.innerHTML = `
    <div class="sort-dialog-backdrop" onclick="closeSortingDialog()"></div>
    <div class="sort-dialog-content">
      <div class="sort-dialog-header">
        <h2>Advanced Sorting Options</h2>
        <button onclick="closeSortingDialog()" class="close-button">&times;</button>
      </div>
      <div class="sort-dialog-body">
        ${analysisData ? `
        <div class="sort-option">
          <label>Data Analysis:</label>
          <div class="analysis-info">
            ${analysisData.numRows} rows, ${analysisData.numCols} columns
            ${analysisData.hasHeaders ? ' (headers detected)' : ' (no headers detected)'}
          </div>
        </div>
        ` : ''}
        <div class="sort-option">
          <label>Sort Column:</label>
          <select id="sort-column">
            ${columnOptions}
          </select>
        </div>
        <div class="sort-option">
          <label>Sort Order:</label>
          <select id="sort-order">
            <option value="asc">Ascending (A-Z)</option>
            <option value="desc">Descending (Z-A)</option>
          </select>
        </div>
        <div class="sort-option">
          <label>Data Type:</label>
          <select id="data-type">
            <option value="auto">Auto-detect</option>
            <option value="text">Text</option>
            <option value="number">Numbers</option>
            <option value="date">Dates</option>
          </select>
        </div>
        <div class="sort-option">
          <label>
            <input type="checkbox" id="has-headers" ${analysisData && analysisData.hasHeaders ? 'checked' : ''}>
            First row contains headers
          </label>
        </div>
      </div>
      <div class="sort-dialog-footer">
        <button onclick="previewSort()" class="btn-preview">Preview</button>
        <button onclick="applySort()" class="btn-apply">Apply Sort</button>
        <button onclick="closeSortingDialog()" class="btn-cancel">Cancel</button>
      </div>
    </div>
  `;
  
  return dialog;
}

/**
 * Close the sorting dialog
 */
function closeSortingDialog() {
  window.sortingUI.closeSortingDialog();
}

/**
 * Preview the sort operation
 */
async function previewSort() {
  try {
    const spreadsheetId = sheetsAPIClient.getSpreadsheetId();
    const sortColumn = parseInt(document.getElementById('sort-column').value);
    const sortOrder = document.getElementById('sort-order').value;
    const hasHeaders = document.getElementById('has-headers').checked;
    const dataType = document.getElementById('data-type')?.value || 'auto';
    
    if (!spreadsheetId) {
      alert('Could not detect spreadsheet');
      return;
    }

    // Get current range data (simplified)
    const currentRange = 'A1:Z100'; // Would need actual selection detection
    const response = await sheetsAPIClient.getValues(spreadsheetId, currentRange);
    
    if (!response.values || response.values.length === 0) {
      alert('No data found to sort');
      return;
    }

    // Perform sort preview
    const sortCriteria = [{ column: sortColumn, order: sortOrder, dataType: dataType }];
    const sortedData = sheetsAPIClient.performSort(response.values, sortCriteria, hasHeaders);
    
    // Show preview (simplified - would show a proper preview dialog)
    const previewRows = sortedData.slice(0, 5);
    const previewText = previewRows.map(row => row.slice(0, 3).join(' | ')).join('\n');
    
    alert('Sort Preview (first 5 rows, first 3 columns):\n\n' + previewText);
    
  } catch (error) {
    console.error('Preview error:', error);
    alert('Preview failed: ' + error.message);
  }
}

/**
 * Apply the sort operation
 */
async function applySort() {
  try {
    const spreadsheetId = sheetsAPIClient.getSpreadsheetId();
    const sortColumn = parseInt(document.getElementById('sort-column').value);
    const sortOrder = document.getElementById('sort-order').value;
    const hasHeaders = document.getElementById('has-headers').checked;
    const dataType = document.getElementById('data-type')?.value || 'auto';
    
    if (!spreadsheetId) {
      alert('Could not detect spreadsheet');
      return;
    }

    // Confirm with user
    if (!confirm('Are you sure you want to apply this sort? This will modify your spreadsheet data.')) {
      return;
    }

    const currentRange = 'A1:Z100'; // Would need actual selection detection
    const sortCriteria = [{ column: sortColumn, order: sortOrder, dataType: dataType }];
    
    const result = await sheetsAPIClient.sortRange(spreadsheetId, currentRange, sortCriteria, hasHeaders);
    
    if (result.success) {
      alert(`Sort applied successfully! Updated ${result.sortedRows} rows.`);
      closeSortingDialog();
    } else {
      throw new Error('Sort operation failed');
    }
    
  } catch (error) {
    console.error('Apply sort error:', error);
    alert('Sort failed: ' + error.message);
  }
}

/**
 * Perform quick sort on selected range
 */
async function performQuickSort() {
  try {
    const spreadsheetId = sheetsAPIClient.getSpreadsheetId();
    if (!spreadsheetId) {
      alert('Could not detect spreadsheet');
      return;
    }

    // Simplified quick sort - sort by first column, ascending
    const currentRange = 'A1:Z100'; // Would need actual selection detection
    const sortCriteria = [{ column: 0, order: 'asc' }];
    
    if (!confirm('Quick sort will sort by the first column in ascending order. Continue?')) {
      return;
    }
    
    const result = await sheetsAPIClient.sortRange(spreadsheetId, currentRange, sortCriteria, true);
    
    if (result.success) {
      alert(`Quick sort applied! Updated ${result.sortedRows} rows.`);
    } else {
      throw new Error('Quick sort failed');
    }
    
  } catch (error) {
    console.error('Quick sort error:', error);
    alert('Quick sort failed: ' + error.message);
  }
}

// Make functions globally available for onclick handlers
window.closeSortingDialog = closeSortingDialog;
window.previewSort = previewSort;
window.applySort = applySort;

console.log('Google Sheets Sorting Helper: Content script loaded');