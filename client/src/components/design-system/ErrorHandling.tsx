import React from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  AlertTriangle, 
  RefreshCw, 
  Home, 
  AlertCircle, 
  CheckCircle, 
  Info,
  XCircle
} from 'lucide-react';
import { useLanguage } from '@/components/providers/LanguageProvider';

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: React.ErrorInfo;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<{ error: Error; reset: () => void }>;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    this.setState({ errorInfo });
    console.error('Error caught by boundary:', error, errorInfo);
  }

  reset = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  render() {
    if (this.state.hasError) {
      const FallbackComponent = this.props.fallback || DefaultErrorFallback;
      return <FallbackComponent error={this.state.error!} reset={this.reset} />;
    }

    return this.props.children;
  }
}

interface DefaultErrorFallbackProps {
  error: Error;
  reset: () => void;
}

function DefaultErrorFallback({ error, reset }: DefaultErrorFallbackProps) {
  const { t } = useLanguage();
  
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-destructive/10 flex items-center justify-center">
            <AlertTriangle className="h-6 w-6 text-destructive" />
          </div>
          <CardTitle className="text-destructive">Something went wrong</CardTitle>
          <CardDescription>
            An unexpected error occurred. Please try again or contact support if the problem persists.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <details className="rounded-lg border p-4">
            <summary className="cursor-pointer text-sm font-medium">
              Error details
            </summary>
            <pre className="mt-2 text-xs text-muted-foreground overflow-auto">
              {error.message}
            </pre>
          </details>
          
          <div className="flex flex-col sm:flex-row gap-2">
            <Button onClick={reset} className="flex-1">
              <RefreshCw className="h-4 w-4 mr-2" />
              Try again
            </Button>
            <Button variant="outline" onClick={() => window.location.href = '/'} className="flex-1">
              <Home className="h-4 w-4 mr-2" />
              Go home
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Error message component
interface ErrorMessageProps {
  title?: string;
  message: string;
  variant?: 'error' | 'warning' | 'info' | 'success';
  onRetry?: () => void;
  onDismiss?: () => void;
  className?: string;
  showIcon?: boolean;
}

export function ErrorMessage({
  title,
  message,
  variant = 'error',
  onRetry,
  onDismiss,
  className,
  showIcon = true,
}: ErrorMessageProps) {
  const { t } = useLanguage();
  
  const icons = {
    error: XCircle,
    warning: AlertTriangle,
    info: Info,
    success: CheckCircle,
  };

  const Icon = icons[variant];
  
  const variantStyles = {
    error: 'border-destructive/50 text-destructive',
    warning: 'border-yellow-500/50 text-yellow-600 dark:text-yellow-400',
    info: 'border-blue-500/50 text-blue-600 dark:text-blue-400',
    success: 'border-green-500/50 text-green-600 dark:text-green-400',
  };

  return (
    <Alert className={cn(variantStyles[variant], className)}>
      {showIcon && <Icon className="h-4 w-4" />}
      <AlertDescription>
        <div className="flex items-start justify-between">
          <div>
            {title && <div className="font-medium mb-1">{title}</div>}
            <div className="text-sm">{message}</div>
          </div>
          
          <div className="flex items-center space-x-2 ml-4">
            {onRetry && (
              <Button size="sm" variant="outline" onClick={onRetry}>
                <RefreshCw className="h-3 w-3 mr-1" />
                {t('retry')}
              </Button>
            )}
            {onDismiss && (
              <Button size="sm" variant="ghost" onClick={onDismiss}>
                <XCircle className="h-3 w-3" />
              </Button>
            )}
          </div>
        </div>
      </AlertDescription>
    </Alert>
  );
}

// API error handler
interface ApiErrorProps {
  error: Error;
  onRetry?: () => void;
  className?: string;
}

export function ApiError({ error, onRetry, className }: ApiErrorProps) {
  const { t } = useLanguage();
  
  const getErrorMessage = (error: Error) => {
    if (error.message.includes('401')) {
      return {
        title: 'Authentication Required',
        message: 'Please log in to access this content.',
        variant: 'warning' as const,
      };
    }
    
    if (error.message.includes('403')) {
      return {
        title: 'Access Denied',
        message: 'You do not have permission to access this resource.',
        variant: 'error' as const,
      };
    }
    
    if (error.message.includes('404')) {
      return {
        title: 'Not Found',
        message: 'The requested resource could not be found.',
        variant: 'warning' as const,
      };
    }
    
    if (error.message.includes('500')) {
      return {
        title: 'Server Error',
        message: 'An internal server error occurred. Please try again later.',
        variant: 'error' as const,
      };
    }
    
    return {
      title: 'Error',
      message: 'An unexpected error occurred. Please try again.',
      variant: 'error' as const,
    };
  };

  const errorDetails = getErrorMessage(error);

  return (
    <ErrorMessage
      title={errorDetails.title}
      message={errorDetails.message}
      variant={errorDetails.variant}
      onRetry={onRetry}
      className={className}
    />
  );
}

// Form error handler
interface FormErrorProps {
  errors: Record<string, string>;
  className?: string;
}

export function FormError({ errors, className }: FormErrorProps) {
  if (Object.keys(errors).length === 0) return null;
  
  return (
    <Alert variant="destructive" className={className}>
      <AlertCircle className="h-4 w-4" />
      <AlertDescription>
        <div className="font-medium mb-2">Please fix the following errors:</div>
        <ul className="list-disc list-inside space-y-1">
          {Object.entries(errors).map(([field, error]) => (
            <li key={field} className="text-sm">
              {error}
            </li>
          ))}
        </ul>
      </AlertDescription>
    </Alert>
  );
}

// Empty state component
interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div className={cn(
      'flex flex-col items-center justify-center text-center p-8 min-h-[300px]',
      className
    )}>
      {icon && (
        <div className="mb-4 text-muted-foreground">
          {icon}
        </div>
      )}
      
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-muted-foreground mb-6 max-w-md">{description}</p>
      
      {action && (
        <Button onClick={action.onClick}>
          {action.label}
        </Button>
      )}
    </div>
  );
}

// Network error handler
interface NetworkErrorProps {
  onRetry?: () => void;
  className?: string;
}

export function NetworkError({ onRetry, className }: NetworkErrorProps) {
  const { t } = useLanguage();
  
  return (
    <ErrorMessage
      title="Connection Error"
      message="Unable to connect to the server. Please check your internet connection and try again."
      variant="warning"
      onRetry={onRetry}
      className={className}
    />
  );
}

// Timeout error handler
interface TimeoutErrorProps {
  onRetry?: () => void;
  className?: string;
}

export function TimeoutError({ onRetry, className }: TimeoutErrorProps) {
  const { t } = useLanguage();
  
  return (
    <ErrorMessage
      title="Request Timeout"
      message="The request is taking longer than expected. Please try again."
      variant="warning"
      onRetry={onRetry}
      className={className}
    />
  );
}

// Error handler hook
export function useErrorHandler() {
  const { t } = useLanguage();
  
  const handleError = (error: Error, context?: string) => {
    console.error(`Error in ${context}:`, error);
    
    // Log to external service in production
    if (process.env.NODE_ENV === 'production') {
      // External error logging service
    }
    
    return {
      title: getErrorTitle(error),
      message: getErrorMessage(error),
      canRetry: isRetryableError(error),
    };
  };
  
  return { handleError };
}

function getErrorTitle(error: Error): string {
  if (error.message.includes('401')) return 'Authentication Required';
  if (error.message.includes('403')) return 'Access Denied';
  if (error.message.includes('404')) return 'Not Found';
  if (error.message.includes('500')) return 'Server Error';
  return 'Error';
}

function getErrorMessage(error: Error): string {
  if (error.message.includes('401')) return 'Please log in to continue.';
  if (error.message.includes('403')) return 'You do not have permission to perform this action.';
  if (error.message.includes('404')) return 'The requested resource could not be found.';
  if (error.message.includes('500')) return 'An internal server error occurred.';
  return 'An unexpected error occurred.';
}

function isRetryableError(error: Error): boolean {
  return !error.message.includes('401') && !error.message.includes('403');
}