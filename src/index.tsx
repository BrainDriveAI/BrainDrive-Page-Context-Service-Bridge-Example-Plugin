import React from 'react';
import ServiceExamplePageContext from './ServiceExamplePageContext';
import { PageContextDisplay, PageContextListener } from './components';

// Main entry point for ServiceExample_PageContext plugin

// Export the main component
export default ServiceExamplePageContext;

// Export individual modules for BrainDrive to load
export { PageContextDisplay, PageContextListener };

// Version information
export const version = '1.0.0';

// Plugin metadata
export const metadata = {
  name: 'ServiceExample_PageContext',
  description: 'Demonstrates how to use BrainDrive\'s PageContext Service Bridge',
  version: '1.0.0',
  author: 'BrainDrive',
  serviceExample: 'PageContext'
};

// Note: This plugin is designed to work with real BrainDrive services
// When loaded via Module Federation, BrainDrive will provide the actual service implementations
// No mock services are included - this is a production-ready plugin example