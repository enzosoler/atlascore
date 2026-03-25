/**
 * Shared error types for email system
 */

export class EmailError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly retryable: boolean = false
  ) {
    super(message);
    this.name = 'EmailError';
  }
}

export class ValidationError extends EmailError {
  constructor(message: string) {
    super(message, 'VALIDATION_ERROR', false);
    this.name = 'ValidationError';
  }
}

export class ResendError extends EmailError {
  constructor(message: string, statusCode: number) {
    super(
      message,
      'RESEND_ERROR',
      statusCode >= 500 || statusCode === 429 // Retry on server errors or rate limit
    );
    this.name = 'ResendError';
  }
}

export class UnauthorizedError extends EmailError {
  constructor(message: string = 'Unauthorized') {
    super(message, 'UNAUTHORIZED', false);
    this.name = 'UnauthorizedError';
  }
}

export class ConfigurationError extends EmailError {
  constructor(message: string) {
    super(message, 'CONFIG_ERROR', false);
    this.name = 'ConfigurationError';
  }
}
