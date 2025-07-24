// TEMPLATE: Core type definitions for BrainDrive plugins
// TODO: Customize these types based on your plugin's specific needs

// Service interfaces - these match the BrainDrive service contracts
export interface ApiService {
  get: (url: string, options?: any) => Promise<ApiResponse>;
  post: (url: string, data: any, options?: any) => Promise<ApiResponse>;
  put: (url: string, data: any, options?: any) => Promise<ApiResponse>;
  delete: (url: string, options?: any) => Promise<ApiResponse>;
  postStreaming?: (url: string, data: any, onChunk: (chunk: string) => void, options?: any) => Promise<ApiResponse>;
}

export interface EventService {
  sendMessage: (target: string, message: any, options?: any) => void;
  subscribeToMessages: (target: string, callback: (message: any) => void) => void;
  unsubscribeFromMessages: (target: string, callback: (message: any) => void) => void;
}

export interface ThemeService {
  getCurrentTheme: () => string;
  setTheme: (theme: string) => void;
  toggleTheme: () => void;
  addThemeChangeListener: (callback: (theme: string) => void) => void;
  removeThemeChangeListener: (callback: (theme: string) => void) => void;
}

export interface SettingsService {
  get: (key: string) => any;
  set: (key: string, value: any) => Promise<void>;
  getSetting?: (id: string) => Promise<any>;
  setSetting?: (id: string, value: any) => Promise<any>;
  getSettingDefinitions?: () => Promise<any>;
}

export interface PageContextService {
  getCurrentPageContext(): {
    pageId: string;
    pageName: string;
    pageRoute: string;
  } | null;
  onPageContextChange(callback: (context: any) => void): () => void;
}

// Plugin State Service interface
export interface PluginStateService {
  configure: (config: any) => void;
  getConfiguration: () => any;
  saveState: (state: any) => Promise<void>;
  getState: () => Promise<any>;
  clearState: () => Promise<void>;
  validateState: (state: any) => boolean;
  sanitizeState: (state: any) => any;
  onSave: (callback: (state: any) => void) => () => void;
  onRestore: (callback: (state: any) => void) => () => void;
  onClear: (callback: () => void) => () => void;
}

// Services container
export interface Services {
  api?: ApiService;
  event?: EventService;
  theme?: ThemeService;
  settings?: SettingsService;
  pageContext?: PageContextService;
  pluginState?: PluginStateService;
}

// API Response interface
export interface ApiResponse {
  data?: any;
  status?: number;
  id?: string;
  [key: string]: any;
}

// ServiceExample_PageContext-specific types
export interface ServiceExamplePageContextProps {
  moduleId?: string;
  pluginId?: string;
  instanceId?: string;
  services: Services;
  title?: string;
  description?: string;
  config?: PluginConfig;
}

export interface ServiceExamplePageContextState {
  isLoading: boolean;
  error: string;
  currentTheme: string;
  isInitializing: boolean;
  data: any; // Replace 'any' with your specific data type
}

// ServiceExample_PageContext configuration interface
export interface PluginConfig {
  refreshInterval?: number;
  showAdvancedOptions?: boolean;
  showDebugInfo?: boolean;
  autoRefresh?: boolean;
  customSetting?: string;
  [key: string]: any;
}

// TEMPLATE: Example data interface - replace with your plugin's data structure
export interface PluginData {
  // TODO: Define the structure of data your plugin works with
  id: string;
  name: string;
  value: any;
  timestamp: string;
}

// TEMPLATE: Example event interface - customize for your plugin's events
export interface PluginEvent {
  type: string;
  data: any;
  timestamp: string;
}