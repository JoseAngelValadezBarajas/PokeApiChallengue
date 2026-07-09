/**
 * AppError represents a controlled, application-level error.
 *
 * Features:
 * - HTTP status code (default 500 for unhandled errors).
 * - Error code for programmatic handling (e.g., 'POKEAPI_UNAVAILABLE').
 * - Optional details object for debugging or error context.
 * - Extends native Error for stack traces and logging.
 *
 * Usage in Server:
 * - The global error handler in server.ts catches AppError instances
 *   and converts them to HTTP responses with statusCode and code.
 * - All other errors are treated as 500 Internal Server Error.
 * - Keeps error handling logic centralized and consistent.
 */
export class AppError extends Error {
  public readonly statusCode: number;
  public readonly code: string;
  public readonly details?: unknown;

  /**
   * Create an application error.
   *
   * @param message User-facing error message.
   * @param statusCode HTTP status code (default: 500).
   * @param code Machine-readable error code (default: 'INTERNAL_SERVER_ERROR').
   * @param details Optional object with additional error context (e.g., validation errors).
   */
  constructor(
    message: string,
    statusCode = 500,
    code = 'INTERNAL_SERVER_ERROR',
    details?: unknown,
  ) {
    super(message);
    this.name = 'AppError';
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
  }
}
