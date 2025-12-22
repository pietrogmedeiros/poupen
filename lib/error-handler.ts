import { ApiResponse } from './types';
import { ERROR_MESSAGES } from './constants';

export class AppError extends Error {
  constructor(
    public message: string,
    public statusCode: number = 500,
    public details?: unknown
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export function handleError(error: unknown): { message: string; details?: unknown } {
  if (error instanceof AppError) {
    return {
      message: error.message,
      details: error.details,
    };
  }

  if (error instanceof Error) {
    return {
      message: error.message,
    };
  }

  return {
    message: ERROR_MESSAGES.INTERNAL_SERVER_ERROR,
  };
}

export function createErrorResponse(error: unknown): ApiResponse<unknown> {
  const { message, details } = handleError(error);
  const response: ApiResponse<unknown> = {
    success: false,
    error: message,
  };
  if (details && typeof details === 'object' && 'errors' in details) {
    response.errors = (details as { errors: Record<string, string[]> }).errors;
  }
  return response;
}

export function createSuccessResponse<T>(data: T): ApiResponse<T> {
  return {
    success: true,
    data,
  };
}

export async function withErrorHandling<T>(
  fn: () => Promise<T>
): Promise<ApiResponse<T>> {
  try {
    const data = await fn();
    return createSuccessResponse(data);
  } catch (error) {
    const errorResponse = createErrorResponse(error);
    return errorResponse as ApiResponse<T>;
  }
}

// Type guard for API errors
export function isApiError(error: unknown): error is AppError {
  return error instanceof AppError;
}

// Validation error helper
export function createValidationError(
  errors: Record<string, string[]>
): AppError {
  return new AppError(
    ERROR_MESSAGES.VALIDATION_ERROR,
    400,
    { errors }
  );
}
