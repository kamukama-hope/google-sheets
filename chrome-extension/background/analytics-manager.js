/**
 * Analytics Manager
 * Tracks user events and extension usage statistics (with privacy considerations)
 */

export class AnalyticsManager {
  constructor() {
    this.storageKey = 'analyticsData';
    this.eventsKey = 'analyticsEvents';
    this.maxEventsStored = 500;
    this.sessionId = this.generateSessionId();
  }

  /**
   * Track a user event
   * @param {string} eventName - Event name
   * @param {Object} properties - Event properties
   * @return {Promise<Object>} Event tracking result
   */
  async trackEvent(eventName, properties = {}) {
    try {
      const event = {
        id: this.generateEventId(),
        name: eventName,
        properties: properties,
        timestamp: Date.now(),
        sessionId: this.sessionId,
        version: chrome.runtime.getManifest().version
      };

      // Add event to storage
      await this.storeEvent(event);

      // Update session statistics
      await this.updateSessionStats(eventName);

      console.log(`Analytics: Event tracked - ${eventName}`, properties);

      return { tracked: true, eventId: event.id };

    } catch (error) {
      console.error('Failed to track event:', error);
      // Silently fail - don't disrupt user experience
      return { tracked: false, error: error.message };
    }
  }

  /**
   * Store event in local storage
   * @param {Object} event - Event to store
   */
  async storeEvent(event) {
    try {
      const result = await chrome.storage.local.get([this.eventsKey]);
      let events = result[this.eventsKey] || [];

      // Add new event
      events.push(event);

      // Limit stored events to prevent storage bloat
      if (events.length > this.maxEventsStored) {
        events = events.slice(-this.maxEventsStored);
      }

      await chrome.storage.local.set({ [this.eventsKey]: events });

    } catch (error) {
      console.error('Failed to store event:', error);
    }
  }

  /**
   * Update session statistics
   * @param {string} eventName - Event name
   */
  async updateSessionStats(eventName) {
    try {
      const result = await chrome.storage.local.get([this.storageKey]);
      let stats = result[this.storageKey] || {
        sessions: 0,
        totalEvents: 0,
        eventCounts: {},
        lastActive: null,
        startTime: Date.now()
      };

      // Update stats
      stats.totalEvents++;
      stats.eventCounts[eventName] = (stats.eventCounts[eventName] || 0) + 1;
      stats.lastActive = Date.now();

      await chrome.storage.local.set({ [this.storageKey]: stats });

    } catch (error) {
      console.error('Failed to update session stats:', error);
    }
  }

  /**
   * Get analytics data
   * @return {Promise<Object>} Analytics summary
   */
  async getAnalytics() {
    try {
      const result = await chrome.storage.local.get([this.storageKey, this.eventsKey]);
      const stats = result[this.storageKey] || {};
      const events = result[this.eventsKey] || [];

      return {
        sessionId: this.sessionId,
        stats: stats,
        recentEvents: events.slice(-10),
        summary: this.calculateAnalyticsSummary(stats, events)
      };

    } catch (error) {
      console.error('Failed to get analytics:', error);
      return { error: error.message };
    }
  }

  /**
   * Calculate analytics summary
   * @param {Object} stats - Statistics object
   * @param {Array} events - Events array
   * @return {Object} Summary
   */
  calculateAnalyticsSummary(stats, events) {
    const now = Date.now();
    const oneDayAgo = now - (24 * 60 * 60 * 1000);
    const oneWeekAgo = now - (7 * 24 * 60 * 60 * 1000);

    const eventsLast24h = events.filter(e => e.timestamp > oneDayAgo).length;
    const eventsLastWeek = events.filter(e => e.timestamp > oneWeekAgo).length;

    // Top events
    const eventCounts = stats.eventCounts || {};
    const topEvents = Object.entries(eventCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, count]) => ({ name, count }));

    // Session duration
    const sessionDuration = stats.lastActive - (stats.startTime || 0);

    return {
      totalEvents: stats.totalEvents || 0,
      eventsLast24h,
      eventsLastWeek,
      topEvents,
      sessionDuration,
      version: chrome.runtime.getManifest().version
    };
  }

  /**
   * Get user cohort information (anonymized)
   * @return {Promise<Object>} Cohort information
   */
  async getUserCohort() {
    try {
      const result = await chrome.storage.sync.get(['installDate']);
      const installDate = result.installDate || Date.now();
      const daysInstalled = Math.floor((Date.now() - installDate) / (24 * 60 * 60 * 1000));

      return {
        cohort: this.calculateCohort(installDate),
        daysInstalled: daysInstalled,
        sessionId: this.sessionId
      };

    } catch (error) {
      console.error('Failed to get user cohort:', error);
      return { error: error.message };
    }
  }

  /**
   * Calculate installation cohort
   * @param {number} installDate - Installation timestamp
   * @return {string} Cohort identifier
   */
  calculateCohort(installDate) {
    const date = new Date(installDate);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    return `${year}-${month}`;
  }

  /**
   * Get feature usage breakdown
   * @return {Promise<Object>} Feature usage statistics
   */
  async getFeatureUsage() {
    try {
      const result = await chrome.storage.local.get([this.eventsKey]);
      const events = result[this.eventsKey] || [];

      const featureUsage = {
        quickSort: 0,
        advancedSort: 0,
        smartSort: 0,
        contextMenu: 0,
        keyboardShortcuts: 0,
        templates: 0,
        customOrders: 0,
        preview: 0
      };

      // Count feature usage
      events.forEach(event => {
        if (event.name === 'quick_sort') featureUsage.quickSort++;
        else if (event.name === 'advanced_sort') featureUsage.advancedSort++;
        else if (event.name === 'smart_sort') featureUsage.smartSort++;
        else if (event.name === 'context_menu_used') featureUsage.contextMenu++;
        else if (event.name === 'keyboard_shortcut_used') featureUsage.keyboardShortcuts++;
        else if (event.name === 'template_used') featureUsage.templates++;
        else if (event.name === 'custom_order_applied') featureUsage.customOrders++;
        else if (event.name === 'preview_shown') featureUsage.preview++;
      });

      // Calculate percentages
      const totalFeatureUses = Object.values(featureUsage).reduce((a, b) => a + b, 0);
      const featurePercentages = {};

      Object.keys(featureUsage).forEach(feature => {
        featurePercentages[feature] = totalFeatureUses > 0 
          ? Math.round((featureUsage[feature] / totalFeatureUses) * 100)
          : 0;
      });

      return {
        usage: featureUsage,
        percentages: featurePercentages,
        totalUses: totalFeatureUses
      };

    } catch (error) {
      console.error('Failed to get feature usage:', error);
      return { error: error.message };
    }
  }

  /**
   * Get error tracking data
   * @return {Promise<Array>} Array of tracked errors
   */
  async getErrorTracking() {
    try {
      const result = await chrome.storage.local.get([this.eventsKey]);
      const events = result[this.eventsKey] || [];

      const errors = events
        .filter(event => event.name === 'error_occurred')
        .slice(-20); // Get last 20 errors

      return {
        totalErrors: errors.length,
        errors: errors,
        recentErrors: errors.slice(-5)
      };

    } catch (error) {
      console.error('Failed to get error tracking:', error);
      return { error: error.message };
    }
  }

  /**
   * Clear all analytics data
   * @return {Promise<Object>} Clear result
   */
  async clearAllAnalytics() {
    try {
      await chrome.storage.local.remove([this.storageKey, this.eventsKey]);
      this.sessionId = this.generateSessionId();

      return {
        cleared: true,
        message: 'All analytics data cleared'
      };

    } catch (error) {
      console.error('Failed to clear analytics:', error);
      return { error: error.message };
    }
  }

  /**
   * Export analytics data (for debugging/support)
   * @return {Promise<Object>} Exported data
   */
  async exportAnalytics() {
    try {
      const analytics = await this.getAnalytics();
      const featureUsage = await this.getFeatureUsage();
      const errors = await this.getErrorTracking();
      const cohort = await this.getUserCohort();

      return {
        exportDate: new Date().toISOString(),
        analytics,
        featureUsage,
        errors,
        cohort,
        extensionVersion: chrome.runtime.getManifest().version
      };

    } catch (error) {
      console.error('Failed to export analytics:', error);
      return { error: error.message };
    }
  }

  /**
   * Generate unique session ID
   * @return {string} Session ID
   */
  generateSessionId() {
    return `session_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  }

  /**
   * Generate unique event ID
   * @return {string} Event ID
   */
  generateEventId() {
    return `event_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  }

  /**
   * Get performance metrics
   * @return {Promise<Object>} Performance data
   */
  async getPerformanceMetrics() {
    try {
      const result = await chrome.storage.local.get([this.eventsKey]);
      const events = result[this.eventsKey] || [];

      // Calculate average time between events (rough activity rate)
      if (events.length < 2) {
        return { averageEventInterval: 0, eventFrequency: 'low' };
      }

      let totalGap = 0;
      for (let i = 1; i < events.length; i++) {
        totalGap += events[i].timestamp - events[i - 1].timestamp;
      }

      const averageEventInterval = Math.round(totalGap / (events.length - 1));

      // Categorize frequency
      let eventFrequency = 'low';
      if (averageEventInterval < 5000) {
        eventFrequency = 'high';
      } else if (averageEventInterval < 30000) {
        eventFrequency = 'medium';
      }

      return {
        averageEventInterval,
        eventFrequency,
        totalEvents: events.length
      };

    } catch (error) {
      console.error('Failed to get performance metrics:', error);
      return { error: error.message };
    }
  }
}