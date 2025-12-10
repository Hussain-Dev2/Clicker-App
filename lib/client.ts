'use client';

/**
 * API Client Utility
 * 
 * This module provides a centralized API fetch utility for making authenticated
 * HTTP requests to the backend. It handles:
 * - Automatic token injection from localStorage
 * - Consistent error handling
 * - JSON serialization/deserialization
 * - TypeScript type safety
 */

// Base API URL - defaults to /api for same-origin requests
const API_BASE = process.env.NEXT_PUBLIC_API_BASE || '/api';

/**
 * Extended fetch options interface that allows passing custom headers
 */
export interface FetchOptions extends RequestInit {
  headers?: Record<string, string>;
}

/**
 * Custom error class for API errors with additional context
 */
export class ApiError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public response?: unknown
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

/**
 * Generic API fetch utility with automatic authentication
 * 
 * @template T - The expected response type
 * @param endpoint - API endpoint path (e.g., '/auth/me')
 * @param options - Fetch options including method, body, headers, etc.
 * @returns Promise resolving to typed response data
 * @throws {ApiError} When the API returns an error response
 * 
 * @example
 * ```typescript
 * // Fetch user data
 * const user = await apiFetch<User>('/auth/me');
 * 
 * // Post data
 * const result = await apiFetch<Result>('/points/click', {
 *   method: 'POST',
 *   body: JSON.stringify({ activityId: 'daily_bonus' })
 * });
 * ```
 */
export async function apiFetch<T>(
  endpoint: string,
  options: FetchOptions = {}
): Promise<T> {
  // Construct full URL
  const url = `${API_BASE}${endpoint}`;
  
  // Merge default headers with custom ones
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  // Add JWT authentication token if available (for non-NextAuth requests)
  // Note: NextAuth handles its own authentication via cookies
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    // Make the fetch request
    const response = await fetch(url, {
      ...options,
      headers,
      // Ensure credentials are included for cookie-based auth (NextAuth)
      credentials: 'include',
    });

    // Handle error responses
    if (!response.ok) {
      let errorMessage = `API error: ${response.status}`;
      let errorData: unknown;

      // Try to extract error message from response body
      try {
        errorData = await response.json();
        if (errorData && typeof errorData === 'object' && 'message' in errorData) {
          errorMessage = (errorData as { message: string }).message;
        } else if (errorData && typeof errorData === 'object' && 'error' in errorData) {
          errorMessage = (errorData as { error: string }).error;
        }
      } catch {
        // If JSON parsing fails, use status text
        errorMessage = response.statusText || errorMessage;
      }

      throw new ApiError(errorMessage, response.status, errorData);
    }

    // Parse and return successful response
    return await response.json();
  } catch (error) {
    // Re-throw ApiError as-is
    if (error instanceof ApiError) {
      throw error;
    }
    
    // Handle network errors or other fetch failures
    if (error instanceof Error) {
      throw new ApiError(
        `Network error: ${error.message}`,
        0,
        error
      );
    }
    
    // Handle unknown errors
    throw new ApiError('Unknown error occurred', 0, error);
  }
}

/**
 * Store JWT authentication token in localStorage
 * 
 * @param token - JWT token string to store
 * 
 * @example
 * ```typescript
 * setToken('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...');
 * ```
 */
export function setToken(token: string): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem('token', token);
  }
}

/**
 * Retrieve JWT authentication token from localStorage
 * 
 * @returns JWT token string or null if not found
 * 
 * @example
 * ```typescript
 * const token = getToken();
 * if (token) {
 *   // Use token for authentication
 * }
 * ```
 */
export function getToken(): string | null {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('token');
  }
  return null;
}

/**
 * Remove JWT token from localStorage (logout)
 * 
 * @example
 * ```typescript
 * clearToken(); // User logged out
 * ```
 */
export function clearToken(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('token');
  }
}

export function removeToken(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('token');
  }
}