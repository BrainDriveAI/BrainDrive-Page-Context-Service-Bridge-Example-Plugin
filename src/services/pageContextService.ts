/**
 * PageContext Service for ServiceExample_PageContext plugin
 *
 * This service provides a comprehensive wrapper around BrainDrive's PageContext Service Bridge,
 * demonstrating best practices for page context management within the BrainDrive platform.
 *
 * Key Features:
 * - Type-safe page context operations
 * - Automatic page context change detection
 * - Plugin state management
 * - Error handling and validation
 * - Educational logging for debugging
 * - Service availability checking
 *
 * Based on the BrainDrive service bridge patterns
 */

/**
 * Page context data structure
 */
export interface PageContextData {
  pageId: string;
  pageName: string;
  pageRoute: string;
}

/**
 * Page context change listener callback type
 */
export type PageContextChangeListener = (context: PageContextData) => void;

/**
 * Plugin state configuration for PageContext service
 */
export interface PluginStateConfig {
  pluginId: string;
  stateStrategy: 'none' | 'session' | 'persistent' | 'custom';
  preserveKeys?: string[];
  stateSchema?: {
    [key: string]: {
      type: 'string' | 'number' | 'boolean' | 'object' | 'array';
      required?: boolean;
      default?: any;
    };
  };
  maxStateSize?: number;
  ttl?: number;
}

/**
 * Interface for the PageContext Service bridge provided by BrainDrive
 *
 * This is the core interface that BrainDrive provides to plugins for page context management.
 * Your plugin receives an implementation of this interface through the services prop.
 */
interface PageContextServiceBridge {
  /**
   * Get the current page context
   * @returns The current page context data
   */
  getCurrentPageContext: () => PageContextData | null;
  
  /**
   * Add a listener for page context changes
   * @param listener - Function to call when page context changes
   * @returns Unsubscribe function
   */
  onPageContextChange: (listener: PageContextChangeListener) => () => void;
  
  /**
   * Save plugin state
   * @param pluginId - The plugin identifier
   * @param state - The state to save
   */
  savePluginState?: (pluginId: string, state: any) => Promise<void>;
  
  /**
   * Get plugin state
   * @param pluginId - The plugin identifier
   * @returns The saved state
   */
  getPluginState?: (pluginId: string) => Promise<any>;
  
  /**
   * Clear plugin state
   * @param pluginId - The plugin identifier
   */
  clearPluginState?: (pluginId: string) => Promise<void>;
  
  /**
   * Register plugin state configuration
   * @param config - The state configuration
   */
  registerPluginStateConfig?: (config: PluginStateConfig) => void;
}

/**
 * Custom error types for PageContext Service operations
 */
export class PageContextServiceError extends Error {
  constructor(message: string, public code: string) {
    super(message);
    this.name = 'PageContextServiceError';
  }
}

/**
 * Validation utilities for page context operations
 */
class PageContextValidator {
  /**
   * Validate that a page context value is valid
   */
  static validatePageContext(context: any): context is PageContextData {
    if (!context || typeof context !== 'object') {
      console.warn('[PageContextService] Invalid context: not an object');
      return false;
    }
    
    const requiredFields = ['pageId', 'pageName', 'pageRoute'];
    for (const field of requiredFields) {
      if (typeof context[field] !== 'string') {
        console.warn(`[PageContextService] Invalid context: ${field} must be a string`);
        return false;
      }
    }
    
    return true;
  }
  
  /**
   * Validate page context change listener
   */
  static validateListener(listener: any): listener is PageContextChangeListener {
    if (typeof listener !== 'function') {
      console.warn('[PageContextService] Invalid listener: must be a function');
      return false;
    }
    
    return true;
  }
}

/**
 * Plugin-specific PageContext Service wrapper
 *
 * This class provides a high-level interface for BrainDrive's PageContext Service Bridge,
 * automatically handling common patterns and providing educational logging.
 *
 * Key Features:
 * - Automatic plugin identification for all operations
 * - Comprehensive error handling and validation
 * - Educational logging for debugging and learning
 * - Service availability checking
 * - Page context validation and sanitization
 * - Listener management and cleanup
 * - Plugin state management
 *
 * Usage Pattern:
 * 1. Create instance with createPageContextService(pluginId, moduleId)
 * 2. Set service bridge when services become available
 * 3. Use getCurrentPageContext() to get current page context
 * 4. Use onPageContextChange() to listen for context changes
 * 5. Use state management methods for plugin persistence
 * 6. Always remove listeners in component cleanup
 */
class PluginPageContextService {
  private pluginId: string;
  private moduleId: string;
  private serviceBridge?: PageContextServiceBridge;
  private isConnected: boolean = false;
  private listeners: Set<PageContextChangeListener> = new Set();
  private currentContext: PageContextData | null = null;
  private operationCount: number = 0;
  
  constructor(pluginId: string, moduleId: string) {
    this.pluginId = pluginId;
    this.moduleId = moduleId;
    
    // Educational logging
    console.log(`[PageContextService] Created service instance for ${pluginId}/${moduleId}`);
  }
  
  /**
   * Set the service bridge (called by the plugin system)
   *
   * This method is called by BrainDrive when the PageContext Service becomes available.
   * It's the critical connection point between your plugin and BrainDrive's page context system.
   *
   * @param bridge - The PageContext Service Bridge implementation from BrainDrive
   */
  setServiceBridge(bridge: PageContextServiceBridge) {
    if (!bridge) {
      throw new PageContextServiceError('Service bridge cannot be null', 'INVALID_BRIDGE');
    }
    
    this.serviceBridge = bridge;
    this.isConnected = true;
    
    // Get initial context
    try {
      this.currentContext = bridge.getCurrentPageContext();
    } catch (error) {
      console.warn(`[PageContextService] Failed to get initial context:`, error);
      this.currentContext = null; // fallback
    }
    
    // Educational logging
    console.log(`[PageContextService] ✅ Service bridge connected for ${this.pluginId}/${this.moduleId}`);
    console.log(`[PageContextService] 📚 LEARNING: This connection allows your module to manage page context`);
    console.log(`[PageContextService] 📚 LEARNING: Current context is:`, this.currentContext);
  }
  
  /**
   * Check if the PageContext Service is available and connected
   *
   * Always check this before attempting to use page context operations.
   * This is a common pattern in BrainDrive plugin development.
   *
   * @returns true if the service is available, false otherwise
   */
  isServiceAvailable(): boolean {
    const available = this.serviceBridge !== undefined && this.isConnected;
    
    if (!available) {
      console.warn(`[PageContextService] ⚠️ Service not available for ${this.pluginId}/${this.moduleId}`);
      console.log(`[PageContextService] 📚 LEARNING: Check service availability before using page context operations`);
    }
    
    return available;
  }
  
  /**
   * Get the current page context
   *
   * This is the primary method for getting the current page context in BrainDrive.
   * It demonstrates proper error handling and logging patterns.
   *
   * @returns The current page context data or null
   * @throws PageContextServiceError if service is unavailable
   */
  getCurrentPageContext(): PageContextData | null {
    // Step 1: Validate service availability
    if (!this.isServiceAvailable()) {
      throw new PageContextServiceError(
        'PageContext Service not available. Ensure setServiceBridge() was called.',
        'SERVICE_UNAVAILABLE'
      );
    }
    
    try {
      // Step 2: Get context from service bridge
      const context = this.serviceBridge!.getCurrentPageContext();
      
      // Step 3: Validate context
      if (context && !PageContextValidator.validatePageContext(context)) {
        throw new PageContextServiceError('Invalid page context returned from service', 'INVALID_CONTEXT');
      }
      
      // Step 4: Update cached context
      this.currentContext = context;
      this.operationCount++;
      
      // Step 5: Educational logging
      console.log(`[PageContextService] 📄 Current context retrieved (operation #${this.operationCount}):`, context);
      console.log(`[PageContextService] 📚 LEARNING: Page context retrieved from BrainDrive's PageContext Service`);
      
      return context;
      
    } catch (error) {
      console.error(`[PageContextService] ❌ Failed to get current page context:`, error);
      
      if (error instanceof PageContextServiceError) {
        throw error;
      }
      
      throw new PageContextServiceError(
        `Failed to get page context: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'GET_CONTEXT_FAILED'
      );
    }
  }
  
  /**
   * Add a page context change listener
   *
   * This method sets up page context change listening for the current module.
   * It demonstrates proper listener patterns and error handling.
   *
   * @param listener - Function to call when page context changes
   * @returns Unsubscribe function
   * @throws PageContextServiceError if service is unavailable
   */
  onPageContextChange(listener: PageContextChangeListener): () => void {
    // Step 1: Validate service availability
    if (!this.isServiceAvailable()) {
      throw new PageContextServiceError(
        'PageContext Service not available. Ensure setServiceBridge() was called.',
        'SERVICE_UNAVAILABLE'
      );
    }
    
    // Step 2: Validate listener
    if (!PageContextValidator.validateListener(listener)) {
      throw new PageContextServiceError('Invalid listener provided', 'INVALID_LISTENER');
    }
    
    try {
      // Step 3: Track listener for cleanup
      this.listeners.add(listener);
      
      // Step 4: Educational logging
      console.log(`[PageContextService] 🔔 Adding page context change listener for ${this.moduleId}`);
      console.log(`[PageContextService] 📚 LEARNING: Will receive notifications when page context changes`);
      
      // Step 5: Add listener through the service bridge
      const unsubscribe = this.serviceBridge!.onPageContextChange((context: PageContextData) => {
        // Update cached context
        this.currentContext = context;
        
        // Educational logging (only in development to avoid production noise)
        if (typeof window !== 'undefined' && (window as any).__DEV__) {
          console.group(`[PageContextService] 📄 Page Context Changed`);
          console.log(`Module: ${this.moduleId}`);
          console.log(`New Context:`, context);
          console.log(`📚 LEARNING: This change was received through the PageContext Service Bridge`);
          console.groupEnd();
        }
        
        // Call the original listener
        listener(context);
      });
      
      // Step 6: Return enhanced unsubscribe function
      return () => {
        this.listeners.delete(listener);
        unsubscribe();
        console.log(`[PageContextService] 🔕 Removed page context change listener for ${this.moduleId}`);
      };
      
    } catch (error) {
      console.error(`[PageContextService] ❌ Failed to add page context change listener:`, error);
      throw new PageContextServiceError(
        `Failed to add listener: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'ADD_LISTENER_FAILED'
      );
    }
  }
  
  /**
   * Save plugin state (if supported by the service)
   *
   * This method demonstrates how to save plugin state using the PageContext service.
   *
   * @param state - The state to save
   * @returns Promise that resolves when state is saved
   */
  async savePluginState(state: any): Promise<void> {
    if (!this.isServiceAvailable()) {
      throw new PageContextServiceError(
        'PageContext Service not available. Ensure setServiceBridge() was called.',
        'SERVICE_UNAVAILABLE'
      );
    }
    
    if (!this.serviceBridge!.savePluginState) {
      throw new PageContextServiceError(
        'Plugin state saving not supported by this PageContext Service implementation',
        'SAVE_NOT_SUPPORTED'
      );
    }
    
    try {
      console.log(`[PageContextService] 💾 Saving plugin state for ${this.pluginId}`);
      console.log(`[PageContextService] 📚 LEARNING: State will be persisted through PageContext Service`);
      
      await this.serviceBridge!.savePluginState(this.pluginId, state);
      this.operationCount++;
      
      console.log(`[PageContextService] ✅ Plugin state saved successfully`);
      
    } catch (error) {
      console.error(`[PageContextService] ❌ Failed to save plugin state:`, error);
      throw new PageContextServiceError(
        `Failed to save state: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'SAVE_STATE_FAILED'
      );
    }
  }
  
  /**
   * Get plugin state (if supported by the service)
   *
   * This method demonstrates how to retrieve plugin state using the PageContext service.
   *
   * @returns Promise that resolves to the saved state
   */
  async getPluginState(): Promise<any> {
    if (!this.isServiceAvailable()) {
      throw new PageContextServiceError(
        'PageContext Service not available. Ensure setServiceBridge() was called.',
        'SERVICE_UNAVAILABLE'
      );
    }
    
    if (!this.serviceBridge!.getPluginState) {
      throw new PageContextServiceError(
        'Plugin state retrieval not supported by this PageContext Service implementation',
        'GET_NOT_SUPPORTED'
      );
    }
    
    try {
      console.log(`[PageContextService] 📥 Retrieving plugin state for ${this.pluginId}`);
      console.log(`[PageContextService] 📚 LEARNING: State will be loaded from PageContext Service`);
      
      const state = await this.serviceBridge!.getPluginState(this.pluginId);
      this.operationCount++;
      
      console.log(`[PageContextService] ✅ Plugin state retrieved successfully:`, state);
      
      return state;
      
    } catch (error) {
      console.error(`[PageContextService] ❌ Failed to get plugin state:`, error);
      throw new PageContextServiceError(
        `Failed to get state: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'GET_STATE_FAILED'
      );
    }
  }
  
  /**
   * Remove all page context change listeners (cleanup helper)
   *
   * Call this method when your component is being destroyed to ensure
   * all listeners are properly cleaned up.
   */
  removeAllListeners(): void {
    console.log(`[PageContextService] 🧹 Cleaning up all page context listeners for ${this.moduleId}`);
    
    this.listeners.clear();
    console.log(`[PageContextService] 📚 LEARNING: All page context listeners cleaned up - no memory leaks!`);
  }
  
  /**
   * Get service statistics for debugging and learning
   *
   * This method provides insights into the service usage, helpful for
   * debugging and understanding page context operation patterns.
   */
  getServiceStats() {
    return {
      pluginId: this.pluginId,
      moduleId: this.moduleId,
      isConnected: this.isConnected,
      currentContext: this.currentContext,
      operationsPerformed: this.operationCount,
      activeListeners: this.listeners.size,
      serviceBridgeAvailable: !!this.serviceBridge,
      supportsStateSaving: !!(this.serviceBridge?.savePluginState),
      supportsStateRetrieval: !!(this.serviceBridge?.getPluginState)
    };
  }
}

/**
 * Factory function to create a PageContext service instance
 *
 * This is the recommended way to create PageContext service instances in your plugins.
 * It follows BrainDrive's service creation patterns and provides proper typing.
 *
 * @param pluginId - Your plugin's unique identifier
 * @param moduleId - Your module's unique identifier
 * @returns A new PageContext service instance
 */
export const createPageContextService = (pluginId: string, moduleId: string): PluginPageContextService => {
  console.log(`[PageContextService] 📚 LEARNING: Creating PageContext service for ${pluginId}/${moduleId}`);
  console.log(`[PageContextService] 📚 LEARNING: This service will help you manage page context and plugin state`);
  
  return new PluginPageContextService(pluginId, moduleId);
};

/**
 * Educational logging function for PageContext Service concepts
 *
 * Call this function to log educational information about PageContext Service usage.
 * Useful for learning and debugging.
 */
export const logPageContextServiceConcepts = () => {
  console.group('📚 PageContext Service Bridge - Key Concepts');
  console.log('🔍 Page Context: Information about the current page (ID, name, route, studio status)');
  console.log('👂 Change Listening: Subscribe to page navigation and context updates');
  console.log('💾 State Management: Persist plugin data across page changes');
  console.log('🔒 Validation: Ensure data integrity and type safety');
  console.log('🧹 Cleanup: Proper resource management and memory leak prevention');
  console.log('📊 Monitoring: Track service usage and performance');
  console.groupEnd();
  
  console.group('📚 Best Practices');
  console.log('✅ Always check service availability before operations');
  console.log('✅ Validate all data received from the service');
  console.log('✅ Handle errors gracefully with user-friendly messages');
  console.log('✅ Clean up listeners in componentWillUnmount');
  console.log('✅ Use educational logging for debugging');
  console.log('✅ Follow TypeScript patterns for type safety');
  console.groupEnd();
};

// Export the service class for advanced usage
export { PluginPageContextService };