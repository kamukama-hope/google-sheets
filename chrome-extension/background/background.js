/**
 * Google Sheets Sorting Helper - Enhanced Background Script
 * Handles OAuth, context menus, keyboard shortcuts, and extension lifecycle
 */

import { SortingTemplateManager } from './template-manager.js';
import { AnalyticsManager } from './analytics-manager.js';

// Initialize managers
const templateManager = new SortingTemplateManager();
const analyticsManager = new AnalyticsManager();

// Extension state management
let extensionState = {
  isActive: false,
  currentTab: null,
  lastError: null,
  sortHistory: [],
  userPreferences: {}
};

/**
 * Extension installation/update handler
 */
chrome.runtime.onInstalled.addListener(async (details) => {
  console.log('Google Sheets Sorting Helper: Extension event -', details.reason);
  
  try {
    if (details.reason === 'install') {
      await handleFirstInstall();
    } else if (details.reason === 'update') {
      await handleUpdate(details.previousVersion);
    }
    
    // Set up context menus
    await setupContextMenus();
    
    // Initialize default settings
    await initializeDefaultSettings();
    
    analyticsManager.trackEvent('extension_lifecycle', details.reason);
    
  } catch (error) {
    console.error('Extension setup failed:', error);
    extensionState.lastError = error.message;
  }
});

/**
 * Handle first-time installation
 */
async function handleFirstInstall() {
  console.log('First time installation - setting up defaults');
  
  // Show welcome notification
  if (chrome.notifications) {
    chrome.notifications.create('welcome', {
      type: 'basic',
      iconUrl: 'icons/icon-48.png',
      title: 'Google Sheets Sorting Helper',
      message: 'Extension installed! Visit any Google Sheet to start sorting.'
    });
  }
  
  // Set default preferences
  await chrome.storage.sync.set({
    'version': chrome.runtime.getManifest().version,
    'installDate': Date.now(),
    'defaultSortOrder': 'asc',
    'showPreview': true,
    'autoDetectHeaders': true,
    'enableSmartSort': true,
    'enableKeyboardShortcuts': true,
    'sortHistory': [],
    'customSortOrders': {},
    'sortTemplates': []
  });
}

/**
 * Handle extension update
 */
async function handleUpdate(previousVersion) {
  console.log(`Extension updated from ${previousVersion} to ${chrome.runtime.getManifest().version}`);
  
  // Perform migration if needed
  await migrateUserData(previousVersion);
  
  // Update version in storage
  await chrome.storage.sync.set({
    'version': chrome.runtime.getManifest().version,
    'updateDate': Date.now()
  });
}

/**
 * Migrate user data between versions
 */
async function migrateUserData(fromVersion) {
  try {
    const data = await chrome.storage.sync.get();
    
    // Migration logic based on version
    if (compareVersions(fromVersion, '1.0.0') < 0) {
      // Migration for pre-1.0.0 versions
      console.log('Migrating data from pre-1.0.0');
    }
    
    // Save migrated data
    await chrome.storage.sync.set(data);
    
  } catch (error) {
    console.error('Data migration failed:', error);
  }
}

/**
 * Set up context menus for right-click functionality
 */
async function setupContextMenus() {
  // Remove existing menus first
  await chrome.contextMenus.removeAll();
  
  // Main sort menu
  chrome.contextMenus.create({
    id: 'sortSelectedRange',
    title: 'Sort Selected Range',
    contexts: ['selection'],
    documentUrlPatterns: ['https://docs.google.com/spreadsheets/*']
  });
  
  // Quick sort options
  chrome.contextMenus.create({
    id: 'quickSortAsc',
    title: 'Quick Sort ↑ (A-Z)',
    contexts: ['selection'],
    documentUrlPatterns: ['https://docs.google.com/spreadsheets/*'],
    parentId: 'sortSelectedRange'
  });
  
  chrome.contextMenus.create({
    id: 'quickSortDesc',
    title: 'Quick Sort ↓ (Z-A)',
    contexts: ['selection'],
    documentUrlPatterns: ['https://docs.google.com/spreadsheets/*'],
    parentId: 'sortSelectedRange'
  });
  
  // Separator
  chrome.contextMenus.create({
    id: 'separator1',
    type: 'separator',
    contexts: ['selection'],
    documentUrlPatterns: ['https://docs.google.com/spreadsheets/*'],
    parentId: 'sortSelectedRange'
  });
  
  // Advanced options
  chrome.contextMenus.create({
    id: 'advancedSort',
    title: 'Advanced Sort Options...',
    contexts: ['selection'],
    documentUrlPatterns: ['https://docs.google.com/spreadsheets/*'],
    parentId: 'sortSelectedRange'
  });
  
  chrome.contextMenus.create({
    id: 'smartSort',
    title: '🤖 Smart Sort (AI)',
    contexts: ['selection'],
    documentUrlPatterns: ['https://docs.google.com/spreadsheets/*'],
    parentId: 'sortSelectedRange'
  });
  
  // Template menu
  chrome.contextMenus.create({
    id: 'sortTemplates',
    title: 'Sort Templates',
    contexts: ['selection'],
    documentUrlPatterns: ['https://docs.google.com/spreadsheets/*']
  });
  
  // Load user templates
  const templates = await templateManager.getUserTemplates();
  if (templates.length > 0) {
    templates.forEach((template, index) => {
      chrome.contextMenus.create({
        id: `template_${template.id}`,
        title: template.name,
        contexts: ['selection'],
        documentUrlPatterns: ['https://docs.google.com/spreadsheets/*'],
        parentId: 'sortTemplates'
      });
    });
  } else {
    chrome.contextMenus.create({
      id: 'noTemplates',
      title: 'No templates saved',
      contexts: ['selection'],
      documentUrlPatterns: ['https://docs.google.com/spreadsheets/*'],
      parentId: 'sortTemplates',
      enabled: false
    });
  }
}

/**
 * Initialize default settings
 */
async function initializeDefaultSettings() {
  const currentSettings = await chrome.storage.sync.get([
    'defaultSortOrder',
    'showPreview',
    'autoDetectHeaders',
    'enableSmartSort',
    'enableKeyboardShortcuts'
  ]);
  
  const defaultSettings = {
    defaultSortOrder: 'asc',
    showPreview: true,
    autoDetectHeaders: true,
    enableSmartSort: true,
    enableKeyboardShortcuts: true,
    theme: 'auto',
    animationsEnabled: true,
    debugMode: false
  };
  
  // Only set defaults for missing settings
  const newSettings = {};
  Object.keys(defaultSettings).forEach(key => {
    if (currentSettings[key] === undefined) {
      newSettings[key] = defaultSettings[key];
    }
  });
  
  if (Object.keys(newSettings).length > 0) {
    await chrome.storage.sync.set(newSettings);
  }
}

/**
 * Handle context menu clicks
 */
chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  try {
    extensionState.currentTab = tab;
    
    const action = {
      action: 'contextMenuAction',
      menuItemId: info.menuItemId,
      selectedText: info.selectionText,
      pageUrl: info.pageUrl,
      frameUrl: info.frameUrl
    };
    
    // Handle template actions
    if (info.menuItemId.startsWith('template_')) {
      const templateId = info.menuItemId.replace('template_', '');
      action.templateId = templateId;
      action.action = 'applyTemplate';
    }
    
    // Send message to content script
    const response = await chrome.tabs.sendMessage(tab.id, action);
    
    if (response && response.success) {
      analyticsManager.trackEvent('context_menu_used', info.menuItemId);
    }
    
  } catch (error) {
    console.error('Context menu action failed:', error);
    await showErrorNotification('Context menu action failed', error.message);
  }
});

/**
 * Handle keyboard shortcuts
 */
chrome.commands.onCommand.addListener(async (command, tab) => {
  try {
    // Check if shortcuts are enabled
    const settings = await chrome.storage.sync.get(['enableKeyboardShortcuts']);
    if (!settings.enableKeyboardShortcuts) {
      return;
    }
    
    extensionState.currentTab = tab;
    
    const action = {
      action: 'keyboardShortcut',
      command: command
    };
    
    // Send command to active tab
    if (tab && tab.id) {
      const response = await chrome.tabs.sendMessage(tab.id, action);
      
      if (response && response.success) {
        analyticsManager.trackEvent('keyboard_shortcut_used', command);
      }
    }
    
  } catch (error) {
    console.error('Keyboard shortcut failed:', error);
    await showErrorNotification('Keyboard shortcut failed', error.message);
  }
});

/**
 * Handle messages from content scripts and popup
 */
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  // Handle async operations
  handleMessage(request, sender, sendResponse);
  return true; // Keep message channel open for async response
});

/**
 * Handle different types of messages
 */
async function handleMessage(request, sender, sendResponse) {
  try {
    let result;
    
    switch (request.action) {
      case 'getAuthToken':
        result = await handleGetAuthToken();
        break;
        
      case 'revokeAuthToken':
        result = await handleRevokeAuthToken();
        break;
        
      case 'getSheetsData':
        result = await handleGetSheetsData(request.spreadsheetId, request.range);
        break;
        
      case 'updateSheetsData':
        result = await handleUpdateSheetsData(request.spreadsheetId, request.range, request.values);
        break;
        
      case 'saveUserPreferences':
        result = await handleSaveUserPreferences(request.preferences);
        break;
        
      case 'getUserPreferences':
        result = await handleGetUserPreferences();
        break;
        
      case 'saveSortTemplate':
        result = await handleSaveSortTemplate(request.template);
        break;
        
      case 'getUserTemplates':
        result = await handleGetUserTemplates();
        break;
        
      case 'deleteSortTemplate':
        result = await handleDeleteSortTemplate(request.templateId);
        break;
        
      case 'trackAnalyticsEvent':
        result = await handleTrackAnalyticsEvent(request.eventName, request.properties);
        break;
        
      case 'reportError':
        result = await handleReportError(request.error, request.context);
        break;
        
      default:
        throw new Error(`Unknown message action: ${request.action}`);
    }
    
    sendResponse({ success: true, data: result });
    
  } catch (error) {
    console.error('Message handling failed:', error);
    sendResponse({ success: false, error: error.message });
  }
}

/**
 * Get OAuth token for Google Sheets API
 */
async function handleGetAuthToken() {
  return new Promise((resolve, reject) => {
    chrome.identity.getAuthToken({ interactive: true }, (token) => {
      if (chrome.runtime.lastError) {
        reject(new Error(chrome.runtime.lastError.message));
      } else if (token) {
        resolve(token);
      } else {
        reject(new Error('Failed to get auth token'));
      }
    });
  });
}

/**
 * Revoke the current OAuth token
 */
async function handleRevokeAuthToken() {
  return new Promise((resolve, reject) => {
    chrome.identity.getAuthToken({ interactive: false }, (token) => {
      if (token) {
        chrome.identity.removeCachedAuthToken({ token }, () => {
          // Revoke token on Google's servers
          fetch(`https://oauth2.googleapis.com/revoke?token=${token}`, {
            method: 'POST'
          })
          .then(() => resolve())
          .catch(reject);
        });
      } else {
        resolve();
      }
    });
  });
}

/**
 * Get data from Google Sheets API
 */
async function handleGetSheetsData(spreadsheetId, range) {
  const token = await handleGetAuthToken();
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${range}`;
  
  const response = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return await response.json();
}

/**
 * Update data in Google Sheets API
 */
async function handleUpdateSheetsData(spreadsheetId, range, values) {
  const token = await handleGetAuthToken();
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${range}?valueInputOption=RAW`;
  
  const response = await fetch(url, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      values: values
    })
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return await response.json();
}

/**
 * Save user preferences
 */
async function handleSaveUserPreferences(preferences) {
  await chrome.storage.sync.set(preferences);
  extensionState.userPreferences = { ...extensionState.userPreferences, ...preferences };
  return { saved: Object.keys(preferences).length };
}

/**
 * Get user preferences
 */
async function handleGetUserPreferences() {
  const preferences = await chrome.storage.sync.get();
  extensionState.userPreferences = preferences;
  return preferences;
}

/**
 * Save sort template
 */
async function handleSaveSortTemplate(template) {
  const result = await templateManager.saveTemplate(template);
  
  // Refresh context menus to include new template
  await setupContextMenus();
  
  return result;
}

/**
 * Get user templates
 */
async function handleGetUserTemplates() {
  return await templateManager.getUserTemplates();
}

/**
 * Delete sort template
 */
async function handleDeleteSortTemplate(templateId) {
  const result = await templateManager.deleteTemplate(templateId);
  
  // Refresh context menus
  await setupContextMenus();
  
  return result;
}

/**
 * Track analytics event
 */
async function handleTrackAnalyticsEvent(eventName, properties) {
  return await analyticsManager.trackEvent(eventName, properties);
}

/**
 * Report error
 */
async function handleReportError(error, context) {
  console.error('Reported error:', error, context);
  
  // Store error for debugging
  extensionState.lastError = {
    error: error,
    context: context,
    timestamp: Date.now()
  };
  
  // Track error in analytics
  await analyticsManager.trackEvent('error_occurred', {
    error: error,
    context: context
  });
  
  return { reported: true };
}

/**
 * Show error notification to user
 */
async function showErrorNotification(title, message) {
  if (chrome.notifications) {
    chrome.notifications.create('error', {
      type: 'basic',
      iconUrl: 'icons/icon-48.png',
      title: title,
      message: message
    });
  }
}

/**
 * Handle tab updates to manage extension state
 */
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.url && tab.url.includes('docs.google.com/spreadsheets')) {
    extensionState.isActive = true;
    extensionState.currentTab = tab;
  }
});

/**
 * Handle tab activation
 */
chrome.tabs.onActivated.addListener(async (activeInfo) => {
  try {
    const tab = await chrome.tabs.get(activeInfo.tabId);
    if (tab.url && tab.url.includes('docs.google.com/spreadsheets')) {
      extensionState.isActive = true;
      extensionState.currentTab = tab;
    } else {
      extensionState.isActive = false;
      extensionState.currentTab = null;
    }
  } catch (error) {
    console.error('Tab activation handling failed:', error);
  }
});

/**
 * Utility function to compare version strings
 */
function compareVersions(a, b) {
  const aParts = a.split('.').map(Number);
  const bParts = b.split('.').map(Number);
  
  for (let i = 0; i < Math.max(aParts.length, bParts.length); i++) {
    const aPart = aParts[i] || 0;
    const bPart = bParts[i] || 0;
    
    if (aPart < bPart) return -1;
    if (aPart > bPart) return 1;
  }
  
  return 0;
}

// Export extension state for debugging
if (typeof globalThis !== 'undefined') {
  globalThis.extensionState = extensionState;
}

console.log('Google Sheets Sorting Helper: Background script loaded');