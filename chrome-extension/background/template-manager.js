/**
 * Sorting Template Manager
 * Handles saving, loading, and managing user-defined sorting templates
 */

export class SortingTemplateManager {
  constructor() {
    this.storageKey = 'sortTemplates';
    this.maxTemplates = 50; // Limit to prevent storage bloat
  }

  /**
   * Save a new sorting template
   * @param {Object} template - Template object
   * @return {Promise<Object>} Save result
   */
  async saveTemplate(template) {
    try {
      // Validate template
      const validatedTemplate = this.validateTemplate(template);
      
      // Get existing templates
      const existingTemplates = await this.getUserTemplates();
      
      // Check if template with same name exists
      const existingIndex = existingTemplates.findIndex(t => t.name === validatedTemplate.name);
      
      if (existingIndex !== -1) {
        // Update existing template
        existingTemplates[existingIndex] = validatedTemplate;
      } else {
        // Check template limit
        if (existingTemplates.length >= this.maxTemplates) {
          throw new Error(`Maximum number of templates (${this.maxTemplates}) reached`);
        }
        
        // Add new template
        existingTemplates.push(validatedTemplate);
      }
      
      // Sort templates by name for consistency
      existingTemplates.sort((a, b) => a.name.localeCompare(b.name));
      
      // Save to storage
      await chrome.storage.sync.set({ [this.storageKey]: existingTemplates });
      
      return {
        id: validatedTemplate.id,
        name: validatedTemplate.name,
        isNew: existingIndex === -1,
        totalTemplates: existingTemplates.length
      };
      
    } catch (error) {
      console.error('Failed to save template:', error);
      throw new Error(`Template save failed: ${error.message}`);
    }
  }

  /**
   * Get all user templates
   * @return {Promise<Array>} Array of templates
   */
  async getUserTemplates() {
    try {
      const result = await chrome.storage.sync.get([this.storageKey]);
      const templates = result[this.storageKey] || [];
      
      // Ensure templates have required fields
      return templates.filter(template => this.isValidTemplate(template, false));
      
    } catch (error) {
      console.error('Failed to get templates:', error);
      return [];
    }
  }

  /**
   * Get a specific template by ID
   * @param {string} templateId - Template ID
   * @return {Promise<Object|null>} Template or null if not found
   */
  async getTemplate(templateId) {
    const templates = await this.getUserTemplates();
    return templates.find(template => template.id === templateId) || null;
  }

  /**
   * Delete a template
   * @param {string} templateId - Template ID to delete
   * @return {Promise<Object>} Delete result
   */
  async deleteTemplate(templateId) {
    try {
      const templates = await this.getUserTemplates();
      const templateIndex = templates.findIndex(template => template.id === templateId);
      
      if (templateIndex === -1) {
        throw new Error('Template not found');
      }
      
      const deletedTemplate = templates[templateIndex];
      templates.splice(templateIndex, 1);
      
      // Save updated list
      await chrome.storage.sync.set({ [this.storageKey]: templates });
      
      return {
        deleted: true,
        templateName: deletedTemplate.name,
        remainingTemplates: templates.length
      };
      
    } catch (error) {
      console.error('Failed to delete template:', error);
      throw new Error(`Template deletion failed: ${error.message}`);
    }
  }

  /**
   * Update an existing template
   * @param {string} templateId - Template ID to update
   * @param {Object} updates - Updates to apply
   * @return {Promise<Object>} Update result
   */
  async updateTemplate(templateId, updates) {
    try {
      const templates = await this.getUserTemplates();
      const templateIndex = templates.findIndex(template => template.id === templateId);
      
      if (templateIndex === -1) {
        throw new Error('Template not found');
      }
      
      // Merge updates
      const updatedTemplate = {
        ...templates[templateIndex],
        ...updates,
        id: templateId, // Preserve original ID
        updatedAt: Date.now()
      };
      
      // Validate updated template
      const validatedTemplate = this.validateTemplate(updatedTemplate);
      templates[templateIndex] = validatedTemplate;
      
      // Save to storage
      await chrome.storage.sync.set({ [this.storageKey]: templates });
      
      return {
        updated: true,
        templateId: templateId,
        templateName: validatedTemplate.name
      };
      
    } catch (error) {
      console.error('Failed to update template:', error);
      throw new Error(`Template update failed: ${error.message}`);
    }
  }

  /**
   * Import templates from data
   * @param {Array} templatesData - Array of template objects
   * @param {boolean} overwrite - Whether to overwrite existing templates
   * @return {Promise<Object>} Import result
   */
  async importTemplates(templatesData, overwrite = false) {
    try {
      if (!Array.isArray(templatesData)) {
        throw new Error('Templates data must be an array');
      }
      
      const existingTemplates = overwrite ? [] : await this.getUserTemplates();
      let imported = 0;
      let skipped = 0;
      let errors = [];
      
      for (const templateData of templatesData) {
        try {
          const validatedTemplate = this.validateTemplate(templateData);
          
          // Check for duplicates (by name)
          const existingIndex = existingTemplates.findIndex(t => t.name === validatedTemplate.name);
          
          if (existingIndex !== -1 && !overwrite) {
            skipped++;
          } else {
            if (existingIndex !== -1) {
              existingTemplates[existingIndex] = validatedTemplate;
            } else {
              existingTemplates.push(validatedTemplate);
            }
            imported++;
          }
          
        } catch (error) {
          errors.push(`Template "${templateData.name || 'unknown'}": ${error.message}`);
        }
      }
      
      // Check template limit
      if (existingTemplates.length > this.maxTemplates) {
        existingTemplates.splice(this.maxTemplates);
        errors.push(`Imported templates exceeded limit, truncated to ${this.maxTemplates}`);
      }
      
      // Save templates
      await chrome.storage.sync.set({ [this.storageKey]: existingTemplates });
      
      return {
        imported,
        skipped,
        errors,
        totalTemplates: existingTemplates.length
      };
      
    } catch (error) {
      console.error('Failed to import templates:', error);
      throw new Error(`Template import failed: ${error.message}`);
    }
  }

  /**
   * Export all templates
   * @return {Promise<Array>} Array of templates
   */
  async exportTemplates() {
    const templates = await this.getUserTemplates();
    
    // Clean templates for export (remove internal metadata)
    return templates.map(template => ({
      name: template.name,
      description: template.description,
      criteria: template.criteria,
      options: template.options,
      tags: template.tags,
      createdAt: template.createdAt
    }));
  }

  /**
   * Search templates by name or tags
   * @param {string} query - Search query
   * @return {Promise<Array>} Matching templates
   */
  async searchTemplates(query) {
    const templates = await this.getUserTemplates();
    const lowerQuery = query.toLowerCase();
    
    return templates.filter(template => {
      // Search in name
      if (template.name.toLowerCase().includes(lowerQuery)) {
        return true;
      }
      
      // Search in description
      if (template.description && template.description.toLowerCase().includes(lowerQuery)) {
        return true;
      }
      
      // Search in tags
      if (template.tags && template.tags.some(tag => tag.toLowerCase().includes(lowerQuery))) {
        return true;
      }
      
      return false;
    });
  }

  /**
   * Get template usage statistics
   * @return {Promise<Object>} Usage statistics
   */
  async getUsageStatistics() {
    const templates = await this.getUserTemplates();
    
    const stats = {
      totalTemplates: templates.length,
      averageUsage: 0,
      mostUsedTemplate: null,
      leastUsedTemplate: null,
      recentlyCreated: 0,
      recentlyUsed: 0
    };
    
    if (templates.length === 0) {
      return stats;
    }
    
    const now = Date.now();
    const oneWeekAgo = now - (7 * 24 * 60 * 60 * 1000);
    
    let totalUsage = 0;
    let maxUsage = 0;
    let minUsage = Infinity;
    
    templates.forEach(template => {
      const usage = template.usageCount || 0;
      totalUsage += usage;
      
      if (usage > maxUsage) {
        maxUsage = usage;
        stats.mostUsedTemplate = template;
      }
      
      if (usage < minUsage) {
        minUsage = usage;
        stats.leastUsedTemplate = template;
      }
      
      // Count recent activities
      if (template.createdAt && template.createdAt > oneWeekAgo) {
        stats.recentlyCreated++;
      }
      
      if (template.lastUsedAt && template.lastUsedAt > oneWeekAgo) {
        stats.recentlyUsed++;
      }
    });
    
    stats.averageUsage = Math.round(totalUsage / templates.length);
    
    return stats;
  }

  /**
   * Validate template object
   * @param {Object} template - Template to validate
   * @return {Object} Validated template
   */
  validateTemplate(template) {
    if (!template || typeof template !== 'object') {
      throw new Error('Template must be an object');
    }
    
    // Required fields
    if (!template.name || typeof template.name !== 'string' || template.name.trim().length === 0) {
      throw new Error('Template name is required');
    }
    
    if (!template.criteria || !Array.isArray(template.criteria) || template.criteria.length === 0) {
      throw new Error('Template must have at least one sort criterion');
    }
    
    // Validate criteria
    template.criteria.forEach((criterion, index) => {
      if (typeof criterion.column !== 'number' || criterion.column < 0) {
        throw new Error(`Criterion ${index + 1}: invalid column`);
      }
      
      if (!['asc', 'desc'].includes(criterion.order)) {
        throw new Error(`Criterion ${index + 1}: order must be 'asc' or 'desc'`);
      }
    });
    
    // Create validated template
    const validatedTemplate = {
      id: template.id || this.generateTemplateId(),
      name: template.name.trim(),
      description: template.description || '',
      criteria: template.criteria,
      options: template.options || {},
      tags: Array.isArray(template.tags) ? template.tags : [],
      createdAt: template.createdAt || Date.now(),
      updatedAt: Date.now(),
      usageCount: template.usageCount || 0,
      lastUsedAt: template.lastUsedAt || null
    };
    
    // Validate template size (for storage limits)
    const templateSize = JSON.stringify(validatedTemplate).length;
    if (templateSize > 8192) { // 8KB limit per template
      throw new Error('Template is too large (maximum 8KB)');
    }
    
    return validatedTemplate;
  }

  /**
   * Check if template is valid (lightweight validation)
   * @param {Object} template - Template to check
   * @param {boolean} strict - Whether to perform strict validation
   * @return {boolean} Is valid
   */
  isValidTemplate(template, strict = true) {
    try {
      if (strict) {
        this.validateTemplate(template);
      } else {
        // Basic validation
        return template && 
               typeof template === 'object' && 
               template.name && 
               template.criteria && 
               Array.isArray(template.criteria) &&
               template.criteria.length > 0;
      }
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Generate unique template ID
   * @return {string} Unique ID
   */
  generateTemplateId() {
    return `template_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  }

  /**
   * Record template usage
   * @param {string} templateId - Template ID
   * @return {Promise<void>}
   */
  async recordTemplateUsage(templateId) {
    try {
      const templates = await this.getUserTemplates();
      const templateIndex = templates.findIndex(template => template.id === templateId);
      
      if (templateIndex !== -1) {
        templates[templateIndex].usageCount = (templates[templateIndex].usageCount || 0) + 1;
        templates[templateIndex].lastUsedAt = Date.now();
        
        await chrome.storage.sync.set({ [this.storageKey]: templates });
      }
    } catch (error) {
      console.error('Failed to record template usage:', error);
    }
  }
}