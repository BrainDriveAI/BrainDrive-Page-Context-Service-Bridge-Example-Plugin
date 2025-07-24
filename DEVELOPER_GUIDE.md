# ServiceExample_PageContext - Developer Guide

## 📚 Complete Guide to BrainDrive PageContext Service Bridge

This guide provides comprehensive documentation for developers learning to use BrainDrive's PageContext Service Bridge. The ServiceExample_PageContext plugin serves as a working demonstration of all key concepts and patterns.

## 🎯 Learning Objectives

After studying this plugin and guide, you will understand:

1. **PageContext Service Bridge Architecture** - How BrainDrive's page context system works
2. **Service Integration Patterns** - Proper ways to connect to BrainDrive services
3. **Real-time Page Information** - How to get current page context data
4. **Page Context Change Monitoring** - How to listen for page context changes
5. **Error Handling** - Robust error handling for page context operations
6. **Best Practices** - Production-ready patterns and techniques
7. **Common Pitfalls** - What to avoid and how to debug issues

## 🏗️ Architecture Overview

### PageContext Service Bridge Flow

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Your Plugin   │    │  PageContext    │    │  BrainDrive     │
│                 │    │    Service      │    │    Core         │
│ 1. Request      │───▶│ 2. Retrieve     │───▶│ 3. Current      │
│    Page Info    │    │    Context      │    │    Page Data    │
│                 │    │                 │    │                 │
│ 4. Receive      │◀───│ 5. Deliver      │◀───│ 6. Page         │
│    Context      │    │    Data         │    │    Changes      │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Key Components

1. **PageContext Service Bridge** - Provided by BrainDrive through `props.services.pageContext`
2. **Plugin PageContext Service** - Your wrapper around the bridge (see `pageContextService.ts`)
3. **Page Context Data** - Standardized format for page information
4. **Change Listeners** - Real-time notifications for page context changes

## 🔧 Implementation Guide

### Step 1: Service Integration

```typescript
// In your component constructor (from PageContextDisplay.tsx)
constructor(props: PageContextDisplayProps) {
  super(props);
  this.state = {
    currentContext: null,
    isServiceConnected: false,
    error: '',
    status: 'Initializing PageContext Service...',
    lastUpdateTime: ''
  };
}

// In componentDidMount (from PageContextDisplay.tsx)
componentDidMount() {
  console.log('[PageContextDisplay] 📚 LEARNING: Component mounted, checking for PageContext Service...');
  this.initializePageContextService();
}

// Handle service availability changes (from PageContextDisplay.tsx)
componentDidUpdate(prevProps: PageContextDisplayProps) {
  if (prevProps.services?.pageContext !== this.props.services?.pageContext) {
    console.log('[PageContextDisplay] 📚 LEARNING: PageContext Service availability changed, reinitializing...');
    this.initializePageContextService();
  }
}

// Initialize PageContext Service (from PageContextDisplay.tsx)
initializePageContextService = () => {
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
    
    // Get initial page context
    const currentContext = this.props.services.pageContext.getCurrentPageContext();
    console.log('[PageContextDisplay] 📚 LEARNING: Successfully retrieved page context:', currentContext);
    
    this.setState({
      currentContext,
      isServiceConnected: true,
      status: '✅ PageContext Service connected and displaying current page information',
      error: '',
      lastUpdateTime: new Date().toISOString()
    });
    
    console.log('[PageContextDisplay] ✅ PageContext Service successfully initialized');
    
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
  }
};
```

### Step 2: Getting Current Page Context

```typescript
// Get current page context (from PageContextDisplay.tsx)
handleRefreshContext = () => {
  if (!this.state.isServiceConnected || !this.props.services?.pageContext) {
    this.setState({
      status: '❌ Cannot refresh - PageContext Service not connected',
      error: 'PageContext Service not available'
    });
    return;
  }

  try {
    console.log('[PageContextDisplay] 🔄 Refreshing page context...');
    console.log('[PageContextDisplay] 📚 LEARNING: Manually requesting current page context');
    
    const currentContext = this.props.services.pageContext.getCurrentPageContext();
    
    this.setState({
      currentContext,
      status: '✅ Page context refreshed successfully',
      error: '',
      lastUpdateTime: new Date().toISOString()
    });
    
    console.log('[PageContextDisplay] ✅ Page context refreshed:', currentContext);
    console.log('[PageContextDisplay] 📚 LEARNING: Context data includes pageId, pageName, and pageRoute');
    
  } catch (error) {
    console.error('[PageContextDisplay] ❌ Failed to refresh page context:', error);
    
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
```

### Step 3: Listening for Page Context Changes

```typescript
// Subscribe to page context changes (from PageContextListener.tsx)
componentDidMount() {
  this.initializePageContextListener();
}

componentDidUpdate(prevProps: PageContextListenerProps) {
  if (prevProps.services?.pageContext !== this.props.services?.pageContext) {
    this.initializePageContextListener();
  }
}

// Set up page context change listener (from PageContextListener.tsx)
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
          console.warn('[PageContextListener] ⚠️ Invalid context data received:', newContext);
          return;
        }
        
        // Determine change type for educational purposes
        let changeType = 'Context Update';
        if (!previousContext) {
          changeType = 'Initial Load';
        } else if (previousContext.pageId !== newContext.pageId) {
          changeType = 'Page Change';
        } else if (previousContext.pageRoute !== newContext.pageRoute) {
          changeType = 'Route Change';
        } else if (previousContext.pageName !== newContext.pageName) {
          changeType = 'Name Change';
        }
        
        // Create change record
        const changeRecord: PageContextChange = {
          timestamp,
          previousContext,
          newContext,
          changeType
        };
        
        // Update state with new context and add to history
        this.setState(prevState => ({
          currentContext: newContext,
          changeHistory: [changeRecord, ...prevState.changeHistory.slice(0, 9)], // Keep last 10 changes
          status: `🔄 Page context changed: ${changeType}`,
          error: ''
        }));
        
        console.log('[PageContextListener] 📚 LEARNING: Change type detected:', changeType);
        console.log('[PageContextListener] 📚 LEARNING: Change history updated with new entry');
        
      } catch (error) {
        console.error('[PageContextListener] ❌ Error processing page context change:', error);
        this.setState({
          status: '❌ Error processing page context change',
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
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
  }
};

// Clean up subscriptions (from PageContextListener.tsx)
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

componentWillUnmount() {
  this.cleanup();
}
```

## 📋 Page Context Data Structure

### Standard Page Context Format (from pageContextService.ts)

```typescript
interface PageContextData {
  pageId: string;     // Unique identifier for the current page
  pageName: string;   // Human-readable name of the page
  pageRoute: string;  // URL route/path of the current page
}

// Example page context data
const exampleContext: PageContextData = {
  pageId: "dashboard-main-20250124",
  pageName: "Dashboard",
  pageRoute: "/dashboard"
};
```

### Page Context Change Record (from PageContextListener.tsx)

```typescript
interface PageContextChange {
  timestamp: string;           // ISO timestamp when change occurred
  previousContext: any | null; // Previous page context (null for initial load)
  newContext: any;            // New page context data
  changeType: string;         // Type of change: 'Initial Load', 'Page Change', 'Route Change', 'Name Change', 'Context Update'
}

// Example change record
const exampleChange: PageContextChange = {
  timestamp: "2025-01-24T14:30:00.000Z",
  previousContext: {
    pageId: "dashboard-main-20250124",
    pageName: "Dashboard",
    pageRoute: "/dashboard"
  },
  newContext: {
    pageId: "settings-main-20250124",
    pageName: "Settings",
    pageRoute: "/settings"
  },
  changeType: "Page Change"
};
```

### Service Interface (from types.ts)

```typescript
export interface PageContextService {
  /**
   * Get the current page context information
   * @returns Current page context or null if not available
   */
  getCurrentPageContext(): {
    pageId: string;
    pageName: string;
    pageRoute: string;
  } | null;
  
  /**
   * Subscribe to page context changes
   * @param callback Function to call when page context changes
   * @returns Unsubscribe function to clean up the listener
   */
  onPageContextChange(callback: (context: any) => void): () => void;
}
```

## 🎨 UI Patterns

### Connection Status Indicator

```typescript
// Visual indicator for service connection (from PageContextDisplay.tsx)
<div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
  <div style={{
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    backgroundColor: isServiceConnected ? '#4caf50' : '#f44336'
  }} />
  <span style={{ fontSize: '10px', color: '#666' }}>
    {isServiceConnected ? 'Connected' : 'Disconnected'}
  </span>
</div>
```

### Status Messages with Color Coding

```typescript
// Dynamic status styling based on message type (from PageContextDisplay.tsx)
const getStatusStyle = (status: string) => ({
  fontSize: '11px',
  padding: '6px 8px',
  borderRadius: '4px',
  backgroundColor: status.includes('❌') ? '#ffebee' : 
                  status.includes('✅') ? '#e8f5e8' : 
                  status.includes('⏳') ? '#fff3e0' : '#e3f2fd',
  border: `1px solid ${status.includes('❌') ? '#ffcdd2' : 
                      status.includes('✅') ? '#c8e6c9' : 
                      status.includes('⏳') ? '#ffcc02' : '#bbdefb'}`
});
```

### Page Context Information Display

```typescript
// Structured display of page context data (from PageContextDisplay.tsx)
const renderPageContext = (context: any) => (
  <div style={{ 
    padding: '12px', 
    backgroundColor: '#f8f9fa', 
    borderRadius: '6px',
    border: '1px solid #dee2e6'
  }}>
    <div style={{ marginBottom: '8px' }}>
      <strong>Page ID:</strong> 
      <code style={{ marginLeft: '8px', padding: '2px 4px', backgroundColor: '#e9ecef', borderRadius: '3px' }}>
        {context.pageId || 'Not available'}
      </code>
    </div>
    <div style={{ marginBottom: '8px' }}>
      <strong>Page Name:</strong> 
      <span style={{ marginLeft: '8px', fontWeight: '500' }}>
        {context.pageName || 'Not available'}
      </span>
    </div>
    <div>
      <strong>Page Route:</strong> 
      <code style={{ marginLeft: '8px', padding: '2px 4px', backgroundColor: '#e9ecef', borderRadius: '3px' }}>
        {context.pageRoute || 'Not available'}
      </code>
    </div>
  </div>
);
```

## 🚨 Error Handling

### Custom Error Types (from pageContextService.ts)

```typescript
/**
 * Custom error types for PageContext Service operations
 */
export class PageContextServiceError extends Error {
  constructor(message: string, public code: string) {
    super(message);
    this.name = 'PageContextServiceError';
  }
}
```

### Context Data Validation (from pageContextService.ts)

```typescript
/**
 * Validation utilities for page context data
 */
export class PageContextValidator {
  /**
   * Validate that page context has required fields
   */
  static validateContext(context: any): boolean {
    if (!context || typeof context !== 'object') {
      console.warn('[PageContextService] Invalid context: not an object');
      return false;
    }
    
    const requiredFields = ['pageId', 'pageName', 'pageRoute'];
    for (const field of requiredFields) {
      if (!context[field] || typeof context[field] !== 'string') {
        console.warn(`[PageContextService] Invalid context: missing or invalid ${field}`);
        return false;
      }
    }
    
    return true;
  }
}
```

### Error Handling Patterns (from components)

```typescript
// Service availability check (from PageContextDisplay.tsx)
if (!this.state.isServiceConnected || !this.props.services?.pageContext) {
  this.setState({
    status: '❌ Cannot refresh - PageContext Service not connected',
    error: 'PageContext Service not available'
  });
  return;
}

// Method validation (from PageContextListener.tsx)
if (typeof this.props.services.pageContext.onPageContextChange !== 'function') {
  throw new Error('PageContext Service missing onPageContextChange method');
}

// Try-catch for context retrieval (from PageContextDisplay.tsx)
try {
  const currentContext = this.props.services.pageContext.getCurrentPageContext();
  this.setState({
    currentContext,
    status: '✅ Page context refreshed successfully',
    error: '',
    lastUpdateTime: new Date().toISOString()
  });
} catch (error) {
  let errorMessage = 'Failed to refresh page context';
  if (error instanceof Error) {
    errorMessage = error.message;
  }
  
  this.setState({
    status: `❌ ${errorMessage}`,
    error: errorMessage
  });
}
```

### Error Recovery Patterns

```typescript
// Retry mechanism for failed context retrieval (example pattern)
const getContextWithRetry = async (maxRetries = 3) => {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const context = this.props.services.pageContext.getCurrentPageContext();
      return context; // Success
    } catch (error) {
      console.warn(`Context retrieval attempt ${attempt} failed:`, error);
      if (attempt === maxRetries) {
        throw error; // Final attempt failed
      }
      // Wait before retry
      await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
    }
  }
};
```

## 🔍 Debugging and Monitoring

### Educational Logging

The plugin includes comprehensive logging for learning purposes:

```typescript
// Service initialization logging (from PageContextDisplay.tsx)
console.log('[PageContextDisplay] 📚 LEARNING: Component mounted, checking for PageContext Service...');
console.log('[PageContextDisplay] 📚 LEARNING: PageContext Service availability changed, reinitializing...');
console.log('[PageContextDisplay] 📚 LEARNING: Successfully retrieved page context:', currentContext);

// Change detection logging (from PageContextListener.tsx)
console.group('[PageContextListener] 🔄 Page Context Change Detected');
console.log('Timestamp:', timestamp);
console.log('Previous Context:', previousContext);
console.log('New Context:', newContext);
console.log('📚 LEARNING: Page context change received through listener');
console.groupEnd();
```

### Service Statistics

```typescript
// Track service usage statistics (example pattern)
interface ServiceStats {
  contextRetrievals: number;
  changeNotifications: number;
  errors: number;
  lastActivity: string;
}

const updateStats = (type: 'retrieval' | 'change' | 'error') => {
  const stats = getServiceStats();
  switch (type) {
    case 'retrieval':
      stats.contextRetrievals++;
      break;
    case 'change':
      stats.changeNotifications++;
      break;
    case 'error':
      stats.errors++;
      break;
  }
  stats.lastActivity = new Date().toISOString();
  saveServiceStats(stats);
};
```

## 💡 Best Practices

### 1. Service Lifecycle Management

```typescript
// Always check service availability before use
if (!this.props.services?.pageContext) {
  // Handle service not available case
  return;
}

// Validate service methods exist
if (typeof this.props.services.pageContext.getCurrentPageContext !== 'function') {
  throw new Error('PageContext Service missing required method');
}
```

### 2. Memory Management

```typescript
// Always clean up listeners in componentWillUnmount
componentWillUnmount() {
  if (this.pageContextUnsubscribe) {
    this.pageContextUnsubscribe();
    this.pageContextUnsubscribe = null;
  }
}
```

### 3. Context Data Validation

```typescript
// Validate received context data
if (!newContext || typeof newContext !== 'object') {
  console.warn('[PageContextListener] ⚠️ Invalid context data received:', newContext);
  return;
}

// Check for required fields
const requiredFields = ['pageId', 'pageName', 'pageRoute'];
for (const field of requiredFields) {
  if (!newContext[field]) {
    console.warn(`Missing required field: ${field}`);
    return;
  }
}
```

### 4. Error Handling

```typescript
// Comprehensive error handling with user feedback
try {
  const context = this.props.services.pageContext.getCurrentPageContext();
  // Handle success
} catch (error) {
  // Log for developers
  console.error('[PageContextDisplay] ❌ Failed to get page context:', error);
  
  // User-friendly error message
  const userMessage = error instanceof Error ? error.message : 'Unknown error occurred';
  this.setState({
    status: `❌ ${userMessage}`,
    error: userMessage
  });
}
```

## ⚠️ Common Pitfalls

### 1. Forgetting to Unsubscribe

```typescript
// ❌ BAD: Memory leak - listener never cleaned up
componentDidMount() {
  this.props.services.pageContext.onPageContextChange(this.handleChange);
}

// ✅ GOOD: Proper cleanup
componentDidMount() {
  this.unsubscribe = this.props.services.pageContext.onPageContextChange(this.handleChange);
}

componentWillUnmount() {
  if (this.unsubscribe) {
    this.unsubscribe();
  }
}
```

### 2. Not Checking Service Availability

```typescript
// ❌ BAD: Assumes service is always available
const context = this.props.services.pageContext.getCurrentPageContext();

// ✅ GOOD: Check availability first
if (this.props.services?.pageContext) {
  const context = this.props.services.pageContext.getCurrentPageContext();
} else {
  // Handle service not available
}
```

### 3. Ignoring Context Validation

```typescript
// ❌ BAD: Assumes context data is always valid
const pageId = newContext.pageId;

// ✅ GOOD: Validate context data
if (newContext && typeof newContext === 'object' && newContext.pageId) {
  const pageId = newContext.pageId;
} else {
  console.warn('Invalid context data received');
}
```

## 🧪 Testing Patterns

### 1. Component Testing

```typescript
// Test service integration
describe('PageContextDisplay', () => {
  it('should handle service not available', () => {
    const wrapper = mount(<PageContextDisplay services={{}} />);
    expect(wrapper.find('.status').text()).toContain('Waiting for PageContext Service');
  });
  
  it('should display page context when available', () => {
    const mockServices = {
      pageContext: {
        getCurrentPageContext: () => ({
          pageId: 'test-page',
          pageName: 'Test Page',
          pageRoute: '/test'
        })
      }
    };
    const wrapper = mount(<PageContextDisplay services={mockServices} />);
    expect(wrapper.find('.page-id').text()).toContain('test-page');
  });
});
```

### 2. Integration Testing

```typescript
// Test page context changes
describe('PageContextListener', () => {
  it('should track page context changes', async () => {
    let changeCallback: (context: any) => void;
    const mockServices = {
      pageContext: {
        getCurrentPageContext: () => ({ pageId: 'initial', pageName: 'Initial', pageRoute: '/initial' }),
        onPageContextChange: (callback: (context: any) => void) => {
          changeCallback = callback;
          return () => {}; // unsubscribe function
        }
      }
    };
    
    const wrapper = mount(<PageContextListener services={mockServices} />);
    
    // Simulate page context change
    changeCallback({ pageId: 'new-page', pageName: 'New Page', pageRoute: '/new' });
    
    await wrapper.update();
    expect(wrapper.find('.change-history').children()).toHaveLength(2); // Initial + change
  });
});
```

## 📖 Reference

### Code Examples

- **PageContextDisplay.tsx** - Shows how to get and display current page context
- **PageContextListener.tsx** - Demonstrates listening for page context changes
- **pageContextService.ts** - Service wrapper with validation and error handling
- **types.ts** - TypeScript interfaces for type safety

### Educational Features

- **Comprehensive Logging** - Every operation is logged for learning
- **Error Handling Examples** - Shows proper error handling patterns
- **Status Indicators** - Visual feedback for service connection status
- **Change History** - Tracks and displays page context changes over time
- **Validation Examples** - Shows how to validate service data

### Development Tools

- **Real-time Updates** - See page context changes as they happen
- **Manual Refresh** - Test context retrieval on demand
- **Error Recovery** - Examples of handling and recovering from errors
- **Service Statistics** - Track service usage and performance

## 🎓 Next Steps

After mastering the PageContext Service Bridge:

1. **Explore Other Services** - Learn about Event, Theme, Settings, and API services
2. **Build Complex Integrations** - Combine multiple services in your plugins
3. **Implement Custom Logic** - Use page context data to drive plugin behavior
4. **Optimize Performance** - Learn advanced patterns for efficient service usage
5. **Contribute Examples** - Share your own service integration patterns

## 💡 Tips for Success

1. **Start Simple** - Begin with basic context retrieval before adding listeners
2. **Use the Console** - Educational logging helps understand service behavior
3. **Handle Errors Gracefully** - Always provide fallbacks for service failures
4. **Test Edge Cases** - What happens when services aren't available?
5. **Follow Patterns** - Use the established patterns from this example
6. **Clean Up Resources** - Always unsubscribe from listeners
7. **Validate Data** - Never assume service data is in the expected format
8. **Provide User Feedback** - Show connection status and operation results
9. **Log for Learning** - Use console logging to understand service interactions
10. **Study the Code** - The source code contains detailed comments and examples

---

**Happy coding! 🚀**

*This guide is part of the BrainDrive Service Examples collection. For more examples and documentation, visit the BrainDrive developer resources.*