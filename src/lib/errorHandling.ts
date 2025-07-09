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

/**
 * Standardized error logger with consistent formatting
 */
export class ErrorLogger {
  private static formatError(error: Error, context?: Record<string, any>): string {
    const timestamp = new Date().toISOString();
    const contextStr = context ? ` Context: ${JSON.stringify(context)}` : '';
    
    if (error instanceof ApplicationError) {
      return `[${timestamp}] [${error.severity.toUpperCase()}] ${error.code}: ${error.message}${contextStr}`;
    }
    
    return `[${timestamp}] [ERROR] ${error.name}: ${error.message}${contextStr}`;
  }

  static logError(error: Error, context?: Record<string, any>): void {
    const formatted = this.formatError(error, context);
    
    if (error instanceof ApplicationError) {
      switch (error.severity) {
        case ErrorSeverity.INFO:
          console.info(formatted);
          break;
        case ErrorSeverity.WARN:
          console.warn(formatted);
          break;
        case ErrorSeverity.ERROR:
          console.error(formatted);
          break;
        case ErrorSeverity.FATAL:
          console.error(formatted);
          break;
      }
    } else {
      console.error(formatted);
    }
  }

  static logWarning(message: string, context?: Record<string, any>): void {
    const warning = new ApplicationError({
      message,
      code: 'WARNING',
      severity: ErrorSeverity.WARN,
      context
    });
    this.logError(warning, context);
  }

  static logInfo(message: string, context?: Record<string, any>): void {
    const info = new ApplicationError({
      message,
      code: 'INFO',
      severity: ErrorSeverity.INFO,
      context
    });
    this.logError(info, context);
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