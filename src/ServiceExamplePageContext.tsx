import React from 'react';
import './ServiceExamplePageContext.css';
import {
  ServiceExamplePageContextProps,
  ServiceExamplePageContextState,
  PluginData,
  Services
} from './types';

// Import PageContext service example components
import {
  PageContextDisplay,
  PageContextListener
} from './components';

/**
 * ServiceExample_PageContext: Main Plugin Component
 *
 * This plugin demonstrates how to use BrainDrive's PageContext Service Bridge.
 * It provides educational examples showing:
 * - How to get current page context information
 * - How to listen for page context changes
 * - Best practices for service integration and error handling
 * 
 * Educational Focus:
 * - Real-time page context display
 * - Page context change history tracking
 * - Proper service validation and lifecycle management
 * - Comprehensive logging for learning purposes
 */
class ServiceExamplePageContext extends React.Component<ServiceExamplePageContextProps, ServiceExamplePageContextState> {
  private themeChangeListener: ((theme: string) => void) | null = null;

  constructor(props: ServiceExamplePageContextProps) {
    super(props);
    
    this.state = {
      isLoading: false,
      error: '',
      currentTheme: 'light',
      isInitializing: true,
      data: null
    };
  }

  componentDidMount() {
    this.initializePlugin();
  }

  componentWillUnmount() {
    this.cleanup();
  }

  initializePlugin = async () => {
    try {
      console.log('[ServiceExample_PageContext] 🚀 Initializing plugin...');
      console.log('[ServiceExample_PageContext] 📚 LEARNING: Plugin initialization started');
      
      // Initialize theme if theme service is available
      if (this.props.services?.theme) {
        const currentTheme = this.props.services.theme.getCurrentTheme();
        this.setState({ currentTheme });
        
        // Set up theme change listener
        this.themeChangeListener = (theme: string) => {
          console.log('[ServiceExample_PageContext] 🎨 Theme changed to:', theme);
          this.setState({ currentTheme: theme });
        };
        
        if (this.props.services.theme.addThemeChangeListener) {
          this.props.services.theme.addThemeChangeListener(this.themeChangeListener);
        }
      }
      
      // Simulate initialization delay for educational purposes
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      this.setState({ 
        isInitializing: false,
        error: ''
      });
      
      console.log('[ServiceExample_PageContext] ✅ Plugin initialized successfully');
      console.log('[ServiceExample_PageContext] 📚 LEARNING: Plugin is now ready to demonstrate PageContext service usage');
      
    } catch (error) {
      console.error('[ServiceExample_PageContext] ❌ Plugin initialization failed:', error);
      
      this.setState({
        isInitializing: false,
        error: error instanceof Error ? error.message : 'Plugin initialization failed'
      });
    }
  };

  cleanup = () => {
    // Clean up theme listener
    if (this.themeChangeListener && this.props.services?.theme?.removeThemeChangeListener) {
      this.props.services.theme.removeThemeChangeListener(this.themeChangeListener);
      this.themeChangeListener = null;
    }
    
    console.log('[ServiceExample_PageContext] 🧹 Plugin cleanup completed');
  };

  handleRetry = () => {
    console.log('[ServiceExample_PageContext] 🔄 Retrying plugin initialization...');
    this.setState({ 
      isInitializing: true, 
      error: '' 
    });
    this.initializePlugin();
  };

  renderServices(): Services {
    return this.props.services || {};
  }

  renderPluginData(): PluginData | null {
    // For educational purposes, create sample plugin data
    return {
      id: this.props.instanceId || 'service-example-pagecontext',
      name: 'PageContext Service Example',
      value: 'Educational demonstration of PageContext service integration',
      timestamp: new Date().toISOString()
    };
  }

  renderLoadingState() {
    return (
      <div className="service-example-pagecontext-loading">
        <div className="loading-spinner"></div>
        <p>Initializing PageContext Service Example...</p>
        <small>📚 Learning: Plugin is setting up service connections</small>
      </div>
    );
  }

  renderErrorState() {
    const { error } = this.state;
    
    return (
      <div className="service-example-pagecontext-error">
        <div className="error-icon">⚠️</div>
        <div className="error-content">
          <h3>Plugin Initialization Error</h3>
          <p>{error}</p>
          <button 
            onClick={this.handleRetry}
            className="retry-button"
          >
            🔄 Retry Initialization
          </button>
          <small>📚 Learning: Error handling prevents plugin crashes and provides recovery options</small>
        </div>
      </div>
    );
  }

  renderContent() {
    const services = this.renderServices();
    
    return (
      <div className="service-example-pagecontext-content">
        <div className="plugin-header">
          <h2>📄 PageContext Service Bridge Example</h2>
          <p className="plugin-description">
            Educational demonstration of BrainDrive's PageContext Service Bridge.
            This plugin shows how to get page information and listen for page context changes.
          </p>
          <div className="learning-note">
            <strong>📚 Learning Objective:</strong> Understand how to integrate with BrainDrive's PageContext service
            for real-time page information and change notifications.
          </div>
        </div>

        <div className="examples-container">
          <div className="example-section">
            <h3>🔍 Current Page Context</h3>
            <p className="section-description">
              Displays the current page information including page ID, name, and route.
              Updates automatically when the page context changes.
            </p>
            <PageContextDisplay services={services} />
          </div>

          <div className="example-section">
            <h3>👂 Page Context Change Listener</h3>
            <p className="section-description">
              Demonstrates how to listen for page context changes and maintain a history
              of changes with timestamps and change types.
            </p>
            <PageContextListener services={services} />
          </div>
        </div>

        <div className="educational-footer">
          <div className="learning-tips">
            <h4>💡 Key Learning Points:</h4>
            <ul>
              <li><strong>Service Validation:</strong> Always check if services are available before using them</li>
              <li><strong>Error Handling:</strong> Implement proper error handling to prevent component crashes</li>
              <li><strong>Lifecycle Management:</strong> Clean up listeners and resources in componentWillUnmount</li>
              <li><strong>Real-time Updates:</strong> Use service listeners for real-time data updates</li>
              <li><strong>Educational Logging:</strong> Use console logging to understand service interactions</li>
            </ul>
          </div>
        </div>
      </div>
    );
  }

  render() {
    const { isInitializing, error, currentTheme } = this.state;
    
    return (
      <div className={`service-example-pagecontext ${currentTheme === 'dark' ? 'dark-theme' : ''}`}>
        {isInitializing ? (
          this.renderLoadingState()
        ) : error ? (
          this.renderErrorState()
        ) : (
          this.renderContent()
        )}
      </div>
    );
  }
}

export default ServiceExamplePageContext;