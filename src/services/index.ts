// PageContext Service Bridge Example - Service exports

export { default as PluginService } from './PluginService';

// PageContext Service exports
export {
  createPageContextService,
  logPageContextServiceConcepts,
  PluginPageContextService,
  PageContextServiceError
} from './pageContextService';

export type {
  PageContextData,
  PageContextChangeListener,
  PluginStateConfig
} from './pageContextService';