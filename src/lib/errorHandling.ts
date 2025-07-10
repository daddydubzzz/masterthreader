/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-empty-object-type */
import React from 'react';

export enum ErrorSeverity {
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error',
  FATAL = 'fatal'
}

export interface ErrorDetails {
  message: string;
  code?: string;
  severity: ErrorSeverity;
  context?: Record<string, any>;
  cause?: Error;
}

export class ApplicationError extends Error {
  public readonly code: string;
  public readonly severity: ErrorSeverity;
  public readonly context: Record<string, any>;
  public readonly cause?: Error;

  constructor(details: ErrorDetails) {
    super(details.message);
    this.name = 'ApplicationError';
    this.code = details.code || 'UNKNOWN_ERROR';
    this.severity = details.severity;
    this.context = details.context || {};
    this.cause = details.cause;
  }
}

export class DatabaseError extends ApplicationError {
  constructor(message: string, context?: Record<string, any>, cause?: Error) {
    super({
      message,
      code: 'DATABASE_ERROR',
      severity: ErrorSeverity.ERROR,
      context,
      cause
    });
    this.name = 'DatabaseError';
  }
}

export class LLMError extends ApplicationError {
  constructor(message: string, context?: Record<string, any>, cause?: Error) {
    super({
      message,
      code: 'LLM_ERROR',
      severity: ErrorSeverity.ERROR,
      context,
      cause
    });
    this.name = 'LLMError';
  }
}

export class ValidationError extends ApplicationError {
  constructor(message: string, context?: Record<string, any>) {
    super({
      message,
      code: 'VALIDATION_ERROR',
      severity: ErrorSeverity.WARN,
      context
    });
    this.name = 'ValidationError';
  }
}

export class ConfigurationError extends ApplicationError {
  constructor(message: string, context?: Record<string, any>) {
    super({
      message,
      code: 'CONFIGURATION_ERROR',
      severity: ErrorSeverity.FATAL,
      context
    });
    this.name = 'ConfigurationError';
  }
}

export class VectorDBError extends ApplicationError {
  constructor(message: string, operation?: string, originalError?: Error) {
    super({
      message,
      code: 'VECTOR_DB_ERROR',
      severity: ErrorSeverity.ERROR,
      context: { operation },
      cause: originalError
    });
    this.name = 'VectorDBError';
  }
}

// Error logging utility
export class ErrorLogger {
  static logError(error: Error, context?: Record<string, any>): void {
    const errorInfo = {
      name: error.name,
      message: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString(),
      context: context || {}
    };

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Error logged:', errorInfo);
    }

    // In production, you might want to:
    // - Send to error tracking service (Sentry, LogRocket, etc.)
    // - Store in database for analysis
    // - Send alerts for critical errors
    // - Generate error reports

    // Example: Send to external service
    // await sendToErrorTrackingService(errorInfo);
  }

  static logWarning(message: string, context?: Record<string, any>): void {
    const warningInfo = {
      level: 'warning',
      message,
      timestamp: new Date().toISOString(),
      context: context || {}
    };

    if (process.env.NODE_ENV === 'development') {
      console.warn('Warning logged:', warningInfo);
    }
  }

  static logInfo(message: string, context?: Record<string, any>): void {
    const infoLog = {
      level: 'info',
      message,
      timestamp: new Date().toISOString(),
      context: context || {}
    };

    if (process.env.NODE_ENV === 'development') {
      console.info('Info logged:', infoLog);
    }
  }
}

// Error handling middleware for API routes
export function handleApiError(error: Error, operation: string): Response {
  ErrorLogger.logError(error, { operation });

  if (error instanceof ValidationError) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }

  if (error instanceof DatabaseError) {
    return new Response(
      JSON.stringify({ error: 'Database operation failed' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }

  if (error instanceof LLMError) {
    return new Response(
      JSON.stringify({ error: 'AI service unavailable' }),
      { status: 503, headers: { 'Content-Type': 'application/json' } }
    );
  }

  if (error instanceof VectorDBError) {
    return new Response(
      JSON.stringify({ error: 'Vector database operation failed' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }

  // Generic error
  return new Response(
    JSON.stringify({ error: 'Internal server error' }),
    { status: 500, headers: { 'Content-Type': 'application/json' } }
  );
}

// Retry utility for transient errors
export async function retryOperation<T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<T> {
  let lastError: Error;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      
      if (attempt === maxRetries) {
        throw lastError;
      }

      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, delay * attempt));
    }
  }

  throw lastError!;
}

// Safe async wrapper
export async function safeAsync<T>(
  operation: () => Promise<T>,
  fallback?: T
): Promise<T | undefined> {
  try {
    return await operation();
  } catch (error) {
    ErrorLogger.logError(
      error instanceof Error ? error : new Error(String(error)),
      { operation: 'safeAsync' }
    );
    return fallback;
  }
}

/**
 * Utility for handling async operations with consistent error handling
 */
export class AsyncHandler {
  static async handle<T>(
    operation: () => Promise<T>,
    fallbackValue?: T,
    context?: Record<string, any>
  ): Promise<T | typeof fallbackValue> {
    try {
      return await operation();
    } catch (error) {
      ErrorLogger.logError(error instanceof Error ? error : new Error(String(error)), context);
      
      if (fallbackValue !== undefined) {
        return fallbackValue;
      }
      
      throw error;
    }
  }

  static async handleWithFallback<T>(
    operation: () => Promise<T>,
    fallbackValue: T,
    context?: Record<string, any>
  ): Promise<T> {
    try {
      return await operation();
    } catch (error) {
      ErrorLogger.logError(error instanceof Error ? error : new Error(String(error)), context);
      return fallbackValue;
    }
  }

  static async handleWithCallback<T>(
    operation: () => Promise<T>,
    onError: (error: Error) => void,
    context?: Record<string, any>
  ): Promise<T | undefined> {
    try {
      return await operation();
    } catch (error) {
      const appError = error instanceof Error ? error : new Error(String(error));
      ErrorLogger.logError(appError, context);
      onError(appError);
      return undefined;
    }
  }
}

/**
 * Error boundary for React components
 */
export interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: any;
}

export const createErrorBoundary = (fallbackComponent: React.ComponentType<{ error: Error }>) => {
  return class ErrorBoundary extends React.Component<
    React.PropsWithChildren<{}>,
    ErrorBoundaryState
  > {
    constructor(props: React.PropsWithChildren<{}>) {
      super(props);
      this.state = { hasError: false };
    }

    static getDerivedStateFromError(error: Error): ErrorBoundaryState {
      return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: any) {
      ErrorLogger.logError(error, { errorInfo });
      this.setState({ errorInfo });
    }

    render() {
      if (this.state.hasError && this.state.error) {
        return React.createElement(fallbackComponent, { error: this.state.error });
      }

      return this.props.children;
    }
  };
};

/**
 * Validation helpers
 */
export const validateRequired = (value: any, fieldName: string): void => {
  if (!value || (typeof value === 'string' && !value.trim())) {
    throw new ValidationError(`${fieldName} is required`);
  }
};

export const validateStringLength = (value: string, fieldName: string, maxLength: number): void => {
  if (value.length > maxLength) {
    throw new ValidationError(`${fieldName} exceeds maximum length of ${maxLength} characters`);
  }
};

export const validateArray = (value: any, fieldName: string): void => {
  if (!Array.isArray(value)) {
    throw new ValidationError(`${fieldName} must be an array`);
  }
};

export const validatePositiveNumber = (value: number, fieldName: string): void => {
  if (typeof value !== 'number' || value <= 0) {
    throw new ValidationError(`${fieldName} must be a positive number`);
  }
}; 