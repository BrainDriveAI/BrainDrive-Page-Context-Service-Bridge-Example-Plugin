import React from 'react';
import { Services } from '../types';

/**
 * PageContextListener Component
 * 
 * Demonstrates how to listen for page context changes using the PageContext Service Bridge.
 * Shows best practices for:
 * - Setting up page context change listeners
 * - Tracking change history
 * - Proper listener cleanup
 * - Educational logging
 */

interface PageContextListenerProps {
  services?: Services;
}

interface PageContextChange {
  timestamp: string;
  previousContext: any;
  newContext: any;
  changeType: string;
}

interface PageContextListenerState {
  isServiceConnected: boolean;
  isListening: boolean;
  error: string;
  status: string;
  changeHistory: PageContextChange[];
  currentContext: any;
}

class PageContextListener extends React.Component<PageContextListenerProps, PageContextListenerState> {
  private pageContextUnsubscribe: (() => void) | null = null;

  constructor(props: PageContextListenerProps) {
    super(props);
    
    this.state = {
      isServiceConnected: false,
      isListening: false,
      error: '',
      status: 'Initializing PageContext Listener...',
      changeHistory: [],
      currentContext: null
    };
  }

  componentDidMount() {
    this.initializePageContextListener();
  }

  componentDidUpdate(prevProps: PageContextListenerProps) {
    if (prevProps.services?.pageContext !== this.props.services?.pageContext) {
      this.initializePageContextListener();
    }
  }

  componentWillUnmount() {
    this.cleanup();
  }

  cleanup = () => {
    try {
      if (this.pageContextUnsubscribe) {
        this.pageContextUnsubscribe();
        this.pageContextUnsubscribe = null;
      }
    } catch (error) {
      console.warn('[PageContextListener] Error during cleanup:', error);
    }
  };

  initializePageContextListener = () => {
    this.cleanup();
    
    try {
      // BEST PRACTICE: Always check if services are available before using them
      if (!this.props.services) {
        throw new Error('Services not provided to component');
      }
      
      if (!this.props.services.pageContext) {
        // This is normal during initialization - service may not be ready yet
        this.setState({
          status: '⏳ Waiting for PageContext Service to become available...',
          isServiceConnected: false,
          isListening: false,
          error: '',
          changeHistory: [] // Clear history when service is not available
        });
        console.log('[PageContextListener] 📚 LEARNING: PageContext Service not yet available - this is normal during startup');
        return;
      }
      
      // BEST PRACTICE: Validate service methods before calling them
      if (typeof this.props.services.pageContext.onPageContextChange !== 'function') {
        throw new Error('PageContext Service missing onPageContextChange method');
      }
      
      if (typeof this.props.services.pageContext.getCurrentPageContext !== 'function') {
        throw new Error('PageContext Service missing getCurrentPageContext method');
      }
      
      // Get initial page context
      let initialContext: any;
      try {
        initialContext = this.props.services.pageContext.getCurrentPageContext();
        console.log('[PageContextListener] 📚 LEARNING: Successfully retrieved initial page context:', initialContext);
      } catch (contextError) {
        console.error('[PageContextListener] ❌ Failed to get initial page context:', contextError);
        initialContext = null;
      }
      
      // Set up page context change listener with comprehensive logging
      this.pageContextUnsubscribe = this.props.services.pageContext.onPageContextChange((newContext: any) => {
        try {
          const timestamp = new Date().toISOString();
          const previousContext = this.state.currentContext;
          
          console.group('[PageContextListener] 🔄 Page Context Change Detected');
          console.log('Timestamp:', timestamp);
          console.log('Previous Context:', previousContext);
          console.log('New Context:', newContext);
          console.log('📚 LEARNING: Page context change received through listener');
          console.groupEnd();
          
          // BEST PRACTICE: Validate received data
          if (!newContext || typeof newContext !== 'object') {
            console.warn('[PageContextListener] ⚠️ Invalid page context received:', newContext);
            return;
          }
          
          // Determine change type
          let changeType = 'Unknown';
          if (!previousContext) {
            changeType = 'Initial Load';
          } else if (previousContext.pageId !== newContext.pageId) {
            changeType = 'Page Navigation';
          } else if (previousContext.pageName !== newContext.pageName) {
            changeType = 'Page Name Change';
          } else if (previousContext.pageRoute !== newContext.pageRoute) {
            changeType = 'Route Change';
          } else {
            changeType = 'Context Update';
          }
          
          // Create change record
          const changeRecord: PageContextChange = {
            timestamp,
            previousContext,
            newContext,
            changeType
          };
          
          // Update state with new context and change history
          this.setState(prevState => ({
            currentContext: newContext,
            changeHistory: [changeRecord, ...prevState.changeHistory.slice(0, 9)], // Keep last 10 changes
            status: `✅ Page context changed: ${changeType} at ${new Date(timestamp).toLocaleTimeString()}`
          }));
          
        } catch (listenerError) {
          console.error('[PageContextListener] ❌ Error in page context change listener:', listenerError);
          this.setState({
            error: `Page context listener error: ${listenerError instanceof Error ? listenerError.message : 'Unknown error'}`
          });
        }
      });
      
      // Set initial state
      this.setState({
        isServiceConnected: true,
        isListening: true,
        currentContext: initialContext,
        status: '✅ PageContext Listener active and monitoring changes',
        error: ''
      });
      
      // Initialize with fresh history and add initial context if available
      const initialHistory: PageContextChange[] = [];
      if (initialContext) {
        const initialChange: PageContextChange = {
          timestamp: new Date().toISOString(),
          previousContext: null,
          newContext: initialContext,
          changeType: 'Initial Load'
        };
        initialHistory.push(initialChange);
      }
      
      this.setState({
        currentContext: initialContext,
        changeHistory: initialHistory,
        isServiceConnected: true,
        isListening: true,
        status: '✅ PageContext Listener active and monitoring changes',
        error: ''
      });
      
      console.log('[PageContextListener] ✅ PageContext Listener successfully initialized');
      console.log('[PageContextListener] 📚 LEARNING: Now monitoring for page context changes');
      
    } catch (error) {
      console.error('[PageContextListener] ❌ Failed to initialize PageContext Listener:', error);
      console.log('[PageContextListener] 📚 LEARNING: This error handling prevents component crashes');
      
      // BEST PRACTICE: Provide detailed error information for debugging
      let errorMessage = 'PageContext Listener initialization failed';
      
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      this.setState({
        status: `❌ ${errorMessage}`,
        isServiceConnected: false,
        isListening: false,
        error: errorMessage
      });
      
      // BEST PRACTICE: Log detailed error for developers
      console.group('[PageContextListener] 🐛 Error Details');
      console.log('Error:', error);
      console.log('Services Available:', !!this.props.services);
      console.log('PageContext Service Available:', !!this.props.services?.pageContext);
      console.groupEnd();
    }
  };

  handleClearHistory = () => {
    this.setState({
      changeHistory: [],
      status: '🗑️ Change history cleared'
    });
    console.log('[PageContextListener] 📚 LEARNING: Change history cleared by user');
  };

  formatContextForDisplay = (context: any): string => {
    if (!context) return 'None';
    
    try {
      return `${context.pageName || 'Unknown'} (${context.pageId || 'No ID'})`;
    } catch (error) {
      return 'Invalid Context';
    }
  };

  getStatusType = (status: string): string => {
    if (status.includes('❌')) return 'status-error';
    if (status.includes('✅')) return 'status-success';
    if (status.includes('⏳')) return 'status-warning';
    if (status.includes('🗑️')) return 'status-info';
    return 'status-info';
  };

  render() {
    const { 
      isServiceConnected, 
      isListening, 
      error, 
      status, 
      changeHistory, 
      currentContext 
    } = this.state;

    return (
      <div style={{ padding: '16px', maxWidth: '600px', border: '1px solid #ddd', borderRadius: '8px', margin: '8px' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <h3 style={{ margin: 0, fontSize: '16px' }}>
            👂 Page Context Listener
          </h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <div 
                style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  backgroundColor: isServiceConnected ? '#4caf50' : '#f44336'
                }}
              />
              <span style={{ fontSize: '10px', color: '#666' }}>
                {isServiceConnected ? 'Connected' : 'Disconnected'}
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <div 
                style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  backgroundColor: isListening ? '#2196f3' : '#ff9800',
                  animation: isListening ? 'pulse 2s infinite' : 'none'
                }}
              />
              <span style={{ fontSize: '10px', color: '#666' }}>
                {isListening ? 'Listening' : 'Not Listening'}
              </span>
            </div>
          </div>
        </div>

        {/* Status */}
        <div style={{ marginBottom: '12px' }}>
          <div 
            className={this.getStatusType(status)}
            style={{ 
              fontSize: '11px', 
              padding: '6px 8px', 
              borderRadius: '4px',
              backgroundColor: status.includes('❌') ? '#ffebee' : 
                             status.includes('✅') ? '#e8f5e8' : 
                             status.includes('⏳') ? '#fff3e0' : '#e3f2fd',
              border: `1px solid ${status.includes('❌') ? '#ffcdd2' : 
                                  status.includes('✅') ? '#c8e6c9' : 
                                  status.includes('⏳') ? '#ffcc02' : '#bbdefb'}`
            }}
          >
            <strong>Status:</strong> {status}
          </div>
        </div>

        {/* Current Context */}
        {currentContext && (
          <div style={{ 
            marginBottom: '12px',
            padding: '12px',
            border: '2px solid #2196f3',
            borderRadius: '8px',
            backgroundColor: '#f3f9ff'
          }}>
            <h4 style={{ margin: '0 0 8px 0', fontSize: '14px' }}>
              📍 Current Page Context
            </h4>
            <div style={{ fontSize: '12px' }}>
              <strong>{this.formatContextForDisplay(currentContext)}</strong>
              <div style={{ fontSize: '10px', color: '#666', marginTop: '4px' }}>
                Route: {currentContext.pageRoute || 'Unknown'}
              </div>
            </div>
          </div>
        )}

        {/* Change History */}
        <div style={{ marginBottom: '12px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <h4 style={{ margin: 0, fontSize: '14px' }}>
              📜 Change History ({changeHistory.length}/10)
            </h4>
            {changeHistory.length > 0 && (
              <button
                onClick={this.handleClearHistory}
                style={{ 
                  fontSize: '10px', 
                  padding: '4px 8px',
                  backgroundColor: '#ff9800',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
                title="Clear change history"
              >
                🗑️ Clear
              </button>
            )}
          </div>
          
          <div style={{ 
            maxHeight: '200px', 
            overflowY: 'auto', 
            border: '1px solid #ddd', 
            borderRadius: '4px',
            backgroundColor: '#fafafa'
          }}>
            {changeHistory.length === 0 ? (
              <div style={{ 
                padding: '16px', 
                textAlign: 'center', 
                color: '#666', 
                fontSize: '12px' 
              }}>
                No page context changes detected yet.
                <br />
                <span style={{ fontSize: '10px' }}>
                  📚 Navigate to different pages to see changes here
                </span>
              </div>
            ) : (
              changeHistory.map((change, index) => (
                <div 
                  key={index}
                  style={{ 
                    padding: '8px', 
                    borderBottom: index < changeHistory.length - 1 ? '1px solid #eee' : 'none',
                    fontSize: '11px'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <strong style={{ color: '#2196f3' }}>{change.changeType}</strong>
                    <span style={{ color: '#666', fontSize: '10px' }}>
                      {new Date(change.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                  <div style={{ fontSize: '10px', color: '#666' }}>
                    From: {this.formatContextForDisplay(change.previousContext)}
                    <br />
                    To: {this.formatContextForDisplay(change.newContext)}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div style={{
            marginBottom: '12px',
            padding: '8px',
            backgroundColor: '#ffebee',
            border: '1px solid #ffcdd2',
            borderRadius: '4px',
            fontSize: '11px'
          }}>
            <strong style={{ color: '#f44336' }}>Error:</strong>
            <div style={{ color: '#f44336', marginTop: '4px' }}>{error}</div>
          </div>
        )}

        {/* Educational Footer */}
        <div style={{
          marginTop: '12px',
          padding: '6px',
          backgroundColor: '#e3f2fd',
          border: '1px solid #bbdefb',
          borderRadius: '4px',
          fontSize: '9px',
          textAlign: 'center'
        }}>
          <span 
            title="This component demonstrates page context change listening using the PageContext Service Bridge. It tracks all page navigation and context updates in real-time."
            style={{ cursor: 'help' }}
          >
            📚 PageContext Change Listener Demo - Hover for details
          </span>
        </div>

        {/* CSS for pulse animation */}
        <style>{`
          @keyframes pulse {
            0% { opacity: 1; }
            50% { opacity: 0.5; }
            100% { opacity: 1; }
          }
        `}</style>
      </div>
    );
  }
}

export default PageContextListener;