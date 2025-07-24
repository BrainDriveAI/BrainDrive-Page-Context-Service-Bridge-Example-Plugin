import React from 'react';
import { Services } from '../types';

/**
 * PageContextDisplay Component
 * 
 * Demonstrates how to display current page context information from the PageContext Service Bridge.
 * Shows best practices for:
 * - Getting current page context
 * - Service availability checking
 * - Error handling and validation
 * - Real-time updates when page context changes
 */

interface PageContextDisplayProps {
  services?: Services;
}

interface PageContextDisplayState {
  pageId: string;
  pageName: string;
  pageRoute: string;
  isServiceConnected: boolean;
  error: string;
  status: string;
}

class PageContextDisplay extends React.Component<PageContextDisplayProps, PageContextDisplayState> {
  private pageContextUnsubscribe: (() => void) | null = null;

  constructor(props: PageContextDisplayProps) {
    super(props);
    
    this.state = {
      pageId: '',
      pageName: '',
      pageRoute: '',
      isServiceConnected: false,
      error: '',
      status: 'Initializing PageContext Service...'
    };
  }

  componentDidMount() {
    this.initializePageContextService();
  }

  componentDidUpdate(prevProps: PageContextDisplayProps) {
    if (prevProps.services?.pageContext !== this.props.services?.pageContext) {
      this.initializePageContextService();
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
      console.warn('[PageContextDisplay] Error during cleanup:', error);
    }
  };

  initializePageContextService = () => {
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
          error: ''
        });
        console.log('[PageContextDisplay] 📚 LEARNING: PageContext Service not yet available - this is normal during startup');
        return;
      }
      
      // BEST PRACTICE: Validate service methods before calling them
      if (typeof this.props.services.pageContext.getCurrentPageContext !== 'function') {
        throw new Error('PageContext Service missing getCurrentPageContext method');
      }
      
      if (typeof this.props.services.pageContext.onPageContextChange !== 'function') {
        throw new Error('PageContext Service missing onPageContextChange method');
      }
      
      // Get current page context with error handling
      let currentContext: any;
      try {
        currentContext = this.props.services.pageContext.getCurrentPageContext();
        console.log('[PageContextDisplay] 📚 LEARNING: Successfully retrieved current page context:', currentContext);
      } catch (contextError) {
        console.error('[PageContextDisplay] ❌ Failed to get current page context:', contextError);
        throw new Error(`Failed to get current page context: ${contextError instanceof Error ? contextError.message : 'Unknown error'}`);
      }
      
      // Set up page context change listener with error handling
      this.pageContextUnsubscribe = this.props.services.pageContext.onPageContextChange((context: any) => {
        try {
          console.log('[PageContextDisplay] 🔄 Page context changed to:', context);
          console.log('[PageContextDisplay] 📚 LEARNING: Page context change received through listener');
          
          // BEST PRACTICE: Validate received data
          if (!context || typeof context !== 'object') {
            console.warn('[PageContextDisplay] ⚠️ Invalid page context received:', context);
            return;
          }
          
          this.setState({
            pageId: context.pageId || '',
            pageName: context.pageName || '',
            pageRoute: context.pageRoute || '',
            status: `✅ Page context updated: ${context.pageName || 'Unknown'}`
          });
        } catch (listenerError) {
          console.error('[PageContextDisplay] ❌ Error in page context change listener:', listenerError);
          this.setState({
            error: `Page context listener error: ${listenerError instanceof Error ? listenerError.message : 'Unknown error'}`
          });
        }
      });
      
      // Set initial state from current context
      if (currentContext) {
        this.setState({
          pageId: currentContext.pageId || '',
          pageName: currentContext.pageName || '',
          pageRoute: currentContext.pageRoute || '',
          isServiceConnected: true,
          status: '✅ PageContext Service connected and ready',
          error: ''
        });
      } else {
        this.setState({
          isServiceConnected: true,
          status: '⚠️ PageContext Service connected but no context available',
          error: ''
        });
      }
      
      console.log('[PageContextDisplay] ✅ PageContext Service Bridge successfully initialized');
      console.log('[PageContextDisplay] 📚 LEARNING: All error handling checks passed');
      
    } catch (error) {
      console.error('[PageContextDisplay] ❌ Failed to initialize PageContext Service:', error);
      console.log('[PageContextDisplay] 📚 LEARNING: This error handling prevents component crashes');
      
      // BEST PRACTICE: Provide detailed error information for debugging
      let errorMessage = 'PageContext Service initialization failed';
      
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      this.setState({
        status: `❌ ${errorMessage}`,
        isServiceConnected: false,
        error: errorMessage
      });
      
      // BEST PRACTICE: Log detailed error for developers
      console.group('[PageContextDisplay] 🐛 Error Details');
      console.log('Error:', error);
      console.log('Services Available:', !!this.props.services);
      console.log('PageContext Service Available:', !!this.props.services?.pageContext);
      console.groupEnd();
    }
  };

  handleRefresh = () => {
    // BEST PRACTICE: Always validate state before performing operations
    if (!this.state.isServiceConnected) {
      const errorMsg = 'Cannot refresh - PageContext Service not connected';
      this.setState({
        status: `❌ ${errorMsg}`,
        error: errorMsg
      });
      console.log('[PageContextDisplay] 📚 LEARNING: Always check connection state before service calls');
      return;
    }

    // BEST PRACTICE: Validate service availability before calling methods
    if (!this.props.services?.pageContext) {
      const errorMsg = 'PageContext Service no longer available';
      this.setState({
        status: `❌ ${errorMsg}`,
        error: errorMsg
      });
      console.log('[PageContextDisplay] 📚 LEARNING: Services can become unavailable, always check');
      return;
    }

    try {
      console.log('[PageContextDisplay] 🔄 Refreshing page context information...');
      
      const currentContext = this.props.services.pageContext.getCurrentPageContext();
      
      // BEST PRACTICE: Validate returned data
      if (currentContext && typeof currentContext === 'object') {
        this.setState({
          pageId: currentContext.pageId || '',
          pageName: currentContext.pageName || '',
          pageRoute: currentContext.pageRoute || '',
          status: `✅ Page context refreshed - Current: ${currentContext.pageName || 'Unknown'}`,
          error: ''
        });
        
        console.log('[PageContextDisplay] ✅ Page context refresh successful:', currentContext);
        console.log('[PageContextDisplay] 📚 LEARNING: Always validate returned data from services');
      } else {
        this.setState({
          status: '⚠️ Page context refreshed but no context available',
          error: ''
        });
      }
      
    } catch (error) {
      console.error('[PageContextDisplay] ❌ Failed to refresh page context:', error);
      console.log('[PageContextDisplay] 📚 LEARNING: Proper error handling prevents UI crashes');
      
      // BEST PRACTICE: Provide user-friendly error messages
      let errorMessage = 'Failed to refresh page context';
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      this.setState({
        status: `❌ ${errorMessage}`,
        error: errorMessage
      });
    }
  };

  getStatusType = (status: string): string => {
    if (status.includes('❌')) return 'status-error';
    if (status.includes('✅')) return 'status-success';
    if (status.includes('⏳')) return 'status-warning';
    if (status.includes('⚠️')) return 'status-warning';
    return 'status-info';
  };

  render() {
    const { 
      pageId, 
      pageName, 
      pageRoute, 
      isServiceConnected, 
      error, 
      status 
    } = this.state;

    return (
      <div style={{ padding: '16px', maxWidth: '500px', border: '1px solid #ddd', borderRadius: '8px', margin: '8px' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <h3 style={{ margin: 0, fontSize: '16px' }}>
            📄 Page Context Display
          </h3>
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
                             status.includes('⏳') || status.includes('⚠️') ? '#fff3e0' : '#e3f2fd',
              border: `1px solid ${status.includes('❌') ? '#ffcdd2' : 
                                  status.includes('✅') ? '#c8e6c9' : 
                                  status.includes('⏳') || status.includes('⚠️') ? '#ffcc02' : '#bbdefb'}`
            }}
          >
            <strong>Status:</strong> {status}
          </div>
        </div>
        
        {/* Current Page Context Display */}
        {isServiceConnected && (
          <div style={{ 
            textAlign: 'center', 
            marginBottom: '12px',
            padding: '12px',
            border: '2px solid #2196f3',
            borderRadius: '8px',
            backgroundColor: '#f3f9ff'
          }}>
            <div style={{ marginBottom: '8px' }}>
              <span style={{ fontSize: '24px', marginRight: '8px' }}>
                📄
              </span>
              <span style={{
                fontSize: '18px',
                fontWeight: 'bold',
                color: '#2196f3'
              }}>
                {pageName || 'Unknown Page'}
              </span>
            </div>
            <div style={{ fontSize: '10px', color: '#666' }}>
              📚 Current page from BrainDrive's PageContext Service
            </div>
          </div>
        )}

        {/* Page Context Properties */}
        <div style={{ marginBottom: '12px', padding: '12px', backgroundColor: '#f9f9f9', borderRadius: '4px' }}>
          <h4 style={{ margin: '0 0 8px 0', fontSize: '14px' }}>
            Page Context Properties
          </h4>
          <div style={{ display: 'grid', gap: '4px', fontSize: '11px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Page ID:</span>
              <code style={{ fontSize: '10px', backgroundColor: '#e0e0e0', padding: '2px 4px', borderRadius: '2px' }}>
                {pageId || 'Not available'}
              </code>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Page Name:</span>
              <code style={{ fontSize: '10px', backgroundColor: '#e0e0e0', padding: '2px 4px', borderRadius: '2px' }}>
                {pageName || 'Not available'}
              </code>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Page Route:</span>
              <code style={{ fontSize: '10px', backgroundColor: '#e0e0e0', padding: '2px 4px', borderRadius: '2px' }}>
                {pageRoute || 'Not available'}
              </code>
            </div>
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

        {/* Refresh Button */}
        <div style={{ textAlign: 'center' }}>
          <button
            onClick={this.handleRefresh}
            disabled={!isServiceConnected}
            style={{ 
              fontSize: '12px', 
              padding: '6px 12px',
              backgroundColor: isServiceConnected ? '#2196f3' : '#ccc',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: isServiceConnected ? 'pointer' : 'not-allowed'
            }}
            title="Refresh page context information from the service"
          >
            🔄 Refresh Page Context
          </button>
        </div>

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
            title="This component demonstrates real-time page context monitoring using the PageContext Service Bridge. It automatically detects page changes and updates the display accordingly."
            style={{ cursor: 'help' }}
          >
            📚 PageContext Service Bridge Demo - Hover for details
          </span>
        </div>
      </div>
    );
  }
}

export default PageContextDisplay;