import { Button } from '@/components/ui/button';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import React, { Component, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | undefined;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: undefined };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  override componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Enhanced error logging
    console.error('Error boundary caught an error:', {
      error: {
        message: error.message,
        stack: error.stack,
        name: error.name,
      },
      errorInfo,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
    });

    // Send to monitoring service in production
    if (process.env.NODE_ENV === 'production') {
      // Analytics.track('error_boundary_triggered', { error: error.message });
    }
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined });
    window.location.reload();
  };

  override render() {
    if (this.state.hasError) {
      return (
        <div className='min-h-screen flex items-center justify-center bg-gray-50'>
          <div className='max-w-md w-full bg-white shadow-lg rounded-lg p-6'>
            <div className='flex items-center space-x-3 mb-4'>
              <AlertTriangle className='h-6 w-6 text-red-500' />
              <h1 className='text-lg font-semibold text-gray-900'>
                Something went wrong
              </h1>
            </div>

            <p className='text-gray-600 mb-6'>
              We're sorry, but something unexpected happened. Please try
              refreshing the page.
            </p>

            {process.env.NODE_ENV === 'development' && this.state.error && (
              <div className='mb-6 p-3 bg-red-50 border border-red-200 rounded text-sm text-red-700'>
                <strong>Error:</strong> {this.state.error.message}
              </div>
            )}

            <div className='flex space-x-3'>
              <Button onClick={this.handleRetry} className='flex-1'>
                <RefreshCw className='h-4 w-4 mr-2' />
                Try Again
              </Button>
              <Button
                variant='outline'
                onClick={() => (window.location.href = '/')}
              >
                Go Home
              </Button>
            </div>

            <div className='mt-6 text-center text-sm text-gray-500'>
              If this problem persists, please contact support:
              <br />
              <span className='font-medium text-blue-600'>
                +44 161 123 4568
              </span>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
