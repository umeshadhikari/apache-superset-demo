import { ErrorHandler, Injectable } from '@angular/core';

/**
 * Global Angular ErrorHandler that catches uncaught errors — including those thrown
 * by the Superset Embedded SDK — and logs them without crashing the application.
 */
@Injectable()
export class SupersetErrorHandler implements ErrorHandler {
  handleError(error: unknown): void {
    // Log to the console so developers can see the full stack trace.
    // In production this could be forwarded to a monitoring service.
    console.error('[SupersetErrorHandler] Uncaught error:', error);
  }
}
