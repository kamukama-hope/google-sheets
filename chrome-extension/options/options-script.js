/**
 * Options Page Script
 * Handles settings, templates, and preferences management
 */

// Initialize options page
document.addEventListener('DOMContentLoaded', async () => {
  await loadSettings();
  setupTabNavigation();
  setupEventListeners();
  loadTemplates();
  loadAnalytics();
});

/**
 * Load settings from Chrome storage
 */
async function loadSettings() {
  const settings = await chrome.storage.sync.get();
  
  // Set all form values
  Object.keys(settings).forEach(key => {
    const element = document.getElementById(key) || document.querySelector(`[name="${key}"]`);
    if (element) {
      if (element.type === 'checkbox') {
        element.checked = settings[key];
      } else if (element.type === 'radio') {
        const radio = document.querySelector(`input[name="${key}"][value="${settings[key]}"]`);
        if (radio) radio.checked = true;
      } else {
        element.value = settings[key];
      }
    }
  });
}

/**
 * Set up tab navigation
 */
function setupTabNavigation() {
  document.querySelectorAll('.nav-button').forEach(button => {
    button.addEventListener('click', (e) => {
      const tabName = e.currentTarget.dataset.tab;
      switchTab(tabName);
    });
  });
}

/**
 * Switch to a different tab
 */
function switchTab(tabName) {
  // Update buttons
  document.querySelectorAll('.nav-button').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.tab === tabName);
  });

  // Update content
  document.querySelectorAll('.tab-content').forEach(content => {
    content.classList.toggle('active', content.dataset.tab === tabName);
  });
}

/**
 * Set up event listeners
 */
function setupEventListeners() {
  // Save button
  document.getElementById('save-settings-btn').addEventListener('click', saveSettings);
  
  // Reset button
  document.getElementById('reset-to-defaults-btn').addEventListener('click', resetToDefaults);
  
  // Templates
  document.getElementById('import-templates-btn').addEventListener('click', importTemplates);
  document.getElementById('export-templates-btn').addEventListener('click', exportTemplates);
  document.getElementById('clear-templates-btn').addEventListener('click', clearTemplates);
  
  // Analytics
  document.getElementById('view-analytics-btn').addEventListener('click', viewAnalytics);
  document.getElementById('export-analytics-btn').addEventListener('click', exportAnalytics);
  document.getElementById('clear-analytics-btn').addEventListener('click', clearAnalytics);
  
  // Dev tools
  document.getElementById('open-devtools-btn').addEventListener('click', openDevTools);
  document.getElementById('reset-settings-btn').addEventListener('click', resetAllSettings);
  
  // Version info
  document.getElementById('version').textContent = chrome.runtime.getManifest().version;
}

/**
 * Save settings to Chrome storage
 */
async function saveSettings() {
  const settings = {};
  
  // Collect all form values
  document.querySelectorAll('input, select').forEach(element => {
    if (element.name) {
      if (element.type === 'checkbox') {
        settings[element.name] = element.checked;
      } else if (element.type === 'radio' && element.checked) {
        settings[element.name] = element.value;
      } else if (element.type !== 'radio') {
        settings[element.name] = element.value;
      }
    }
  });
  
  try {
    await chrome.storage.sync.set(settings);
    showMessage('Settings saved successfully!', 'success');
  } catch (error) {
    showMessage('Failed to save settings', 'error');
  }
}

/**
 * Reset to default settings
 */
async function resetToDefaults() {
  if (!confirm('Reset all settings to defaults?')) return;
  
  const defaults = {
    defaultSortOrder: 'asc',
    showPreview: true,
    autoDetectHeaders: true,
    enableSmartSort: true,
    enableKeyboardShortcuts: true,
    createBackup: true,
    trackHistory: true,
    animationsEnabled: true,
    stableSort: true,
    nullsLast: true,
    theme: 'auto'
  };
  
  try {
    await chrome.storage.sync.set(defaults);
    await loadSettings();
    showMessage('Settings reset to defaults', 'success');
  } catch (error) {
    showMessage('Failed to reset settings', 'error');
  }
}

/**
 * Load templates list
 */
async function loadTemplates() {
  try {
    const result = await chrome.storage.sync.get(['sortTemplates']);
    const templates = result.sortTemplates || [];
    
    const list = document.getElementById('templates-list');
    const emptyMessage = document.getElementById('no-templates-message');
    
    if (templates.length === 0) {
      list.style.display = 'none';
      emptyMessage.style.display = 'block';
    } else {
      list.style.display = 'grid';
      emptyMessage.style.display = 'none';
      
      list.innerHTML = templates.map(template => `
        <div class="template-item">
          <div class="template-info">
            <div class="template-name">${template.name}</div>
            <div class="template-meta">
              ${template.criteria.length} criteria • Used ${template.usageCount || 0} times
            </div>
          </div>
          <div class="template-actions">
            <button class="btn-secondary" onclick="editTemplate('${template.id}')">Edit</button>
            <button class="btn-danger" onclick="deleteTemplate('${template.id}')">Delete</button>
          </div>
        </div>
      `).join('');
    }
  } catch (error) {
    console.error('Failed to load templates:', error);
  }
}

/**
 * Import templates
 */
function importTemplates() {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = '.json';
  input.onchange = async (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const templates = JSON.parse(event.target.result);
        const result = await chrome.storage.sync.get(['sortTemplates']);
        const existing = result.sortTemplates || [];
        const merged = [...existing, ...templates];
        await chrome.storage.sync.set({ sortTemplates: merged });
        await loadTemplates();
        showMessage('Templates imported successfully!', 'success');
      } catch (error) {
        showMessage('Failed to import templates', 'error');
      }
    };
    reader.readAsText(file);
  };
  input.click();
}

/**
 * Export templates
 */
async function exportTemplates() {
  try {
    const result = await chrome.storage.sync.get(['sortTemplates']);
    const templates = result.sortTemplates || [];
    
    const dataStr = JSON.stringify(templates, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `sort-templates-${Date.now()}.json`;
    link.click();
    URL.revokeObjectURL(url);
    
    showMessage('Templates exported successfully!', 'success');
  } catch (error) {
    showMessage('Failed to export templates', 'error');
  }
}

/**
 * Clear all templates
 */
async function clearTemplates() {
  if (!confirm('Delete all templates? This cannot be undone.')) return;
  
  try {
    await chrome.storage.sync.set({ sortTemplates: [] });
    await loadTemplates();
    showMessage('All templates deleted', 'success');
  } catch (error) {
    showMessage('Failed to delete templates', 'error');
  }
}

/**
 * Delete a template
 */
async function deleteTemplate(templateId) {
  if (!confirm('Delete this template?')) return;
  
  try {
    const result = await chrome.storage.sync.get(['sortTemplates']);
    const templates = (result.sortTemplates || []).filter(t => t.id !== templateId);
    await chrome.storage.sync.set({ sortTemplates: templates });
    await loadTemplates();
    showMessage('Template deleted', 'success');
  } catch (error) {
    showMessage('Failed to delete template', 'error');
  }
}

/**
 * View analytics modal
 */
async function viewAnalytics() {
  const modal = document.getElementById('analytics-modal');
  modal.classList.add('active');
  
  try {
    const result = await chrome.storage.local.get(['analyticsData']);
    const analytics = result.analyticsData || {};
    
    const content = document.getElementById('analytics-content');
    content.innerHTML = `
      <div class="analytics-summary">
        <div><strong>Total Events:</strong> ${analytics.totalEvents || 0}</div>
        <div><strong>Average Usage:</strong> ${Math.round((analytics.totalEvents || 0) / 7)}/day</div>
        <div><strong>Last Active:</strong> ${new Date(analytics.lastActive || Date.now()).toLocaleDateString()}</div>
      </div>
      <h3>Top Events</h3>
      <pre>${JSON.stringify(analytics.eventCounts || {}, null, 2)}</pre>
    `;
  } catch (error) {
    document.getElementById('analytics-content').innerHTML = 'Failed to load analytics';
  }
}

/**
 * Export analytics
 */
async function exportAnalytics() {
  try {
    const result = await chrome.storage.local.get();
    const dataStr = JSON.stringify(result, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `analytics-${Date.now()}.json`;
    link.click();
    URL.revokeObjectURL(url);
    
    showMessage('Analytics exported successfully!', 'success');
  } catch (error) {
    showMessage('Failed to export analytics', 'error');
  }
}

/**
 * Clear analytics
 */
async function clearAnalytics() {
  if (!confirm('Clear all analytics data?')) return;
  
  try {
    await chrome.storage.local.clear();
    closeModal('analytics-modal');
    showMessage('Analytics cleared', 'success');
  } catch (error) {
    showMessage('Failed to clear analytics', 'error');
  }
}

/**
 * Open developer tools
 */
function openDevTools() {
  chrome.runtime.openOptionsPage = chrome.runtime.openOptionsPage || function() {
    window.open(chrome.runtime.getURL('options/options.html'));
  };
  console.log('Developer mode enabled. Check console for debug information.');
  showMessage('Developer mode enabled - check console', 'success');
}

/**
 * Reset all settings
 */
async function resetAllSettings() {
  if (!confirm('Reset ALL settings and data? This cannot be undone.')) return;
  if (!confirm('Are you absolutely sure?')) return;
  
  try {
    await chrome.storage.sync.clear();
    await chrome.storage.local.clear();
    location.reload();
  } catch (error) {
    showMessage('Failed to reset settings', 'error');
  }
}

/**
 * Show status message
 */
function showMessage(message, type = 'info') {
  const msgElement = document.getElementById('status-message');
  msgElement.textContent = message;
  msgElement.className = `footer-message ${type}`;
  
  setTimeout(() => {
    msgElement.textContent = '';
    msgElement.className = 'footer-message';
  }, 3000);
}

/**
 * Close modal
 */
function closeModal(modalId) {
  document.getElementById(modalId).classList.remove('active');
}

// Load analytics on page load
async function loadAnalytics() {
  // This is called when the analytics tab is viewed
  // Implementation is in viewAnalytics()
}