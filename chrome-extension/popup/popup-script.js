/**
 * Google Sheets Sorting Helper - Popup Script
 * Handles the extension popup functionality
 */

// Initialize popup when DOM is loaded
document.addEventListener('DOMContentLoaded', initializePopup);

/**
 * Initialize the popup functionality
 */
function initializePopup() {
  console.log('Initializing popup...');
  
  // Load saved settings
  loadSettings();
  
  // Set up event listeners
  setupEventListeners();
  
  // Check connection status
  checkConnectionStatus();
}

/**
 * Load saved settings from Chrome storage
 */
function loadSettings() {
  chrome.storage.sync.get([
    'defaultSortOrder',
    'showPreview',
    'autoDetectHeaders'
  ], (result) => {
    // Set default sort order
    const sortOrderSelect = document.getElementById('default-sort-order');
    if (result.defaultSortOrder) {
      sortOrderSelect.value = result.defaultSortOrder;
    }
    
    // Set preview checkbox
    const showPreviewCheckbox = document.getElementById('show-preview');
    showPreviewCheckbox.checked = result.showPreview !== false; // Default to true
    
    // Set auto-detect headers checkbox
    const autoDetectCheckbox = document.getElementById('auto-detect-headers');
    autoDetectCheckbox.checked = result.autoDetectHeaders !== false; // Default to true
  });
}

/**
 * Set up event listeners for popup elements
 */
function setupEventListeners() {
  // Quick sort button
  document.getElementById('quick-sort-btn').addEventListener('click', handleQuickSort);
  
  // Custom sort button
  document.getElementById('custom-sort-btn').addEventListener('click', handleCustomSort);
  
  // Settings change handlers
  document.getElementById('show-preview').addEventListener('change', saveSettings);
  document.getElementById('auto-detect-headers').addEventListener('change', saveSettings);
  document.getElementById('default-sort-order').addEventListener('change', saveSettings);
  
  // Footer links
  document.getElementById('help-link').addEventListener('click', openHelp);
  document.getElementById('feedback-link').addEventListener('click', openFeedback);
}

/**
 * Check if the extension can connect to Google Sheets
 */
function checkConnectionStatus() {
  const statusDot = document.getElementById('status-dot');
  const statusText = document.getElementById('status-text');
  
  // Set connecting state
  statusDot.className = 'status-dot connecting';
  statusText.textContent = 'Checking connection...';
  
  // Query active tab
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const currentTab = tabs[0];
    
    if (!currentTab) {
      setConnectionStatus('error', 'Unable to detect current tab');
      return;
    }
    
    // Check if we're on a Google Sheets page
    if (currentTab.url && currentTab.url.includes('docs.google.com/spreadsheets')) {
      // Try to connect to the content script
      chrome.tabs.sendMessage(currentTab.id, { action: 'ping' }, (response) => {
        if (chrome.runtime.lastError) {
          setConnectionStatus('error', 'Extension not loaded in sheet');
          disableButtons();
        } else {
          setConnectionStatus('connected', 'Connected to Google Sheets');
          enableButtons();
        }
      });
    } else {
      setConnectionStatus('error', 'Please open a Google Sheet');
      disableButtons();
    }
  });
}

/**
 * Set the connection status display
 * @param {string} status - Status type: 'connected', 'error', 'connecting'
 * @param {string} message - Status message to display
 */
function setConnectionStatus(status, message) {
  const statusDot = document.getElementById('status-dot');
  const statusText = document.getElementById('status-text');
  
  statusDot.className = `status-dot ${status}`;
  statusText.textContent = message;
}

/**
 * Enable action buttons
 */
function enableButtons() {
  document.getElementById('quick-sort-btn').disabled = false;
  document.getElementById('custom-sort-btn').disabled = false;
}

/**
 * Disable action buttons
 */
function disableButtons() {
  document.getElementById('quick-sort-btn').disabled = true;
  document.getElementById('custom-sort-btn').disabled = true;
}

/**
 * Handle quick sort button click
 */
function handleQuickSort() {
  console.log('Quick sort requested');
  
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    chrome.tabs.sendMessage(tabs[0].id, {
      action: 'performQuickSort'
    }, (response) => {
      if (chrome.runtime.lastError) {
        console.error('Error sending quick sort message:', chrome.runtime.lastError);
        showNotification('Error: Unable to perform quick sort', 'error');
      } else {
        console.log('Quick sort response:', response);
        showNotification('Quick sort applied!', 'success');
        window.close(); // Close popup after successful action
      }
    });
  });
}

/**
 * Handle custom sort button click
 */
function handleCustomSort() {
  console.log('Custom sort requested');
  
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    chrome.tabs.sendMessage(tabs[0].id, {
      action: 'showSortDialog'
    }, (response) => {
      if (chrome.runtime.lastError) {
        console.error('Error sending custom sort message:', chrome.runtime.lastError);
        showNotification('Error: Unable to open sort dialog', 'error');
      } else {
        console.log('Custom sort dialog opened');
        window.close(); // Close popup after opening dialog
      }
    });
  });
}

/**
 * Save settings to Chrome storage
 */
function saveSettings() {
  const settings = {
    defaultSortOrder: document.getElementById('default-sort-order').value,
    showPreview: document.getElementById('show-preview').checked,
    autoDetectHeaders: document.getElementById('auto-detect-headers').checked
  };
  
  chrome.storage.sync.set(settings, () => {
    console.log('Settings saved:', settings);
    showNotification('Settings saved!', 'success');
  });
}

/**
 * Show a temporary notification
 * @param {string} message - The notification message
 * @param {string} type - The notification type: 'success', 'error', 'info'
 */
function showNotification(message, type = 'info') {
  // Create notification element
  const notification = document.createElement('div');
  notification.className = `notification ${type}`;
  notification.textContent = message;
  
  // Style the notification
  notification.style.cssText = `
    position: fixed;
    top: 10px;
    left: 10px;
    right: 10px;
    padding: 12px;
    border-radius: 4px;
    font-size: 13px;
    font-weight: 500;
    z-index: 1000;
    transition: all 0.3s ease;
    ${type === 'success' ? 'background-color: #d4edda; color: #155724; border: 1px solid #c3e6cb;' : ''}
    ${type === 'error' ? 'background-color: #f8d7da; color: #721c24; border: 1px solid #f5c6cb;' : ''}
    ${type === 'info' ? 'background-color: #cce7ff; color: #004085; border: 1px solid #b3d7ff;' : ''}
  `;
  
  document.body.appendChild(notification);
  
  // Remove notification after 3 seconds
  setTimeout(() => {
    notification.style.opacity = '0';
    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification);
      }
    }, 300);
  }, 3000);
}

/**
 * Open help documentation
 * @param {Event} event - Click event
 */
function openHelp(event) {
  event.preventDefault();
  chrome.tabs.create({
    url: 'https://github.com/kiro-sheets-helper/help'
  });
}

/**
 * Open feedback form
 * @param {Event} event - Click event
 */
function openFeedback(event) {
  event.preventDefault();
  chrome.tabs.create({
    url: 'https://github.com/kiro-sheets-helper/feedback'
  });
}

console.log('Popup script loaded');