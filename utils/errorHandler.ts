/**
 * API Error Handler Utility
 * Detects and handles error messages from API responses
 */

import { deleteCookie } from 'cookies-next/client';

export interface ApiError {
  status: number;
  message: string;
  originalError?: any;
  errorType: 'rate_limit' | 'not_found' | 'bad_request' | 'server_error' | 'network_error' | 'unknown' | 'unauthorized';
  retryAfter?: number; // minutes
}

/**
 * Detect error type and extract useful information
 */
export function detectApiError(error: any): ApiError {
  const status = error?.response?.status || error?.status || 0;
  console.log("status", status, error);
  const errorMessage = 
    error?.response?.data?.message || 
    error?.response?.data?.error || 
    error?.message || 
    'Unknown error';

  let errorType: ApiError['errorType'] = 'unknown';
  let retryAfter: number | undefined;

  // Detect error type based on status code
  switch (status) {
    case 400:
      errorType = 'bad_request';
      // localStorage.clear();
      // sessionStorage.clear();
      // deleteCookie("accessToken");
      // deleteCookie("refreshToken");
      break;
    case 401:
      errorType = 'unauthorized';
      localStorage.clear();
      sessionStorage.clear();
      deleteCookie("accessToken");
      deleteCookie("refreshToken");
      break;
    case 404:
      errorType = 'not_found';
      break;
    case 429:
      errorType = 'rate_limit';
      // Extract retry time from message
      retryAfter = extractRetryTime(errorMessage);
      break;
    case 500:
      // localStorage.clear();
      // sessionStorage.clear();
      // deleteCookie("accessToken");
      // deleteCookie("refreshToken");
      break
    case 502:
    case 503:
      errorType = 'server_error';
      break;
    default:
      if (status === 0) {
        errorType = 'network_error';
      }
  }

  // Detect rate limit from message
  if (errorMessage.toLowerCase().includes('too many requests')) {
    errorType = 'rate_limit';
    retryAfter = extractRetryTime(errorMessage);
  }

  return {
    status,
    message: errorMessage,
    originalError: error,
    errorType,
    retryAfter,
  };
}

/**
 * Extract retry time from error message
 * Example: "Too many requests from IP: 203.150.21.97, please try again after 15 minutes"
 */
function extractRetryTime(message: string): number | undefined {
  const patterns = [
    /after (\d+) minutes?/i,
    /in (\d+) minutes?/i,
    /(\d+) minutes?/i,
  ];

  for (const pattern of patterns) {
    const match = message.match(pattern);
    if (match && match[1]) {
      return parseInt(match[1], 10);
    }
  }

  return undefined;
}

/**
 * Get user-friendly error message in Thai
 */
export function getErrorMessage(apiError: ApiError): string {
  switch (apiError.errorType) {
    case 'rate_limit':
      if (apiError.retryAfter) {
        return `คุณส่งคำขอมากเกินไป กรุณาลองใหม่อีกครั้งใน ${apiError.retryAfter} นาที`;
      }
      return 'คุณส่งคำขอมากเกินไป กรุณาลองใหม่ภายหลัง';

    case 'not_found':
      return 'ไม่พบข้อมูลที่ต้องการ';

    case 'bad_request':
      return 'ข้อมูลที่ส่งไม่ถูกต้อง กรุณาตรวจสอบและลองใหม่';

    case 'server_error':
      return 'เกิดข้อผิดพลาดจากเซิร์ฟเวอร์ กรุณาลองใหม่ภายหลัง';

    case 'network_error':
      return 'ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ กรุณาตรวจสอบการเชื่อมต่ออินเทอร์เน็ต';

    default:
      return apiError.message || 'เกิดข้อผิดพลาดที่ไม่ทราบสาเหตุ';
  }
}

/**
 * Check if error should trigger a retry
 */
export function shouldRetry(apiError: ApiError, currentRetry: number = 0, maxRetries: number = 3): boolean {
  // Don't retry rate limit errors
  if (apiError.errorType === 'rate_limit') {
    return false;
  }

  // Don't retry client errors (4xx)
  if (apiError.status >= 400 && apiError.status < 500) {
    return false;
  }

  // Retry server errors and network errors
  if (apiError.errorType === 'server_error' || apiError.errorType === 'network_error') {
    return currentRetry < maxRetries;
  }

  return false;
}

/**
 * Get retry delay in milliseconds (exponential backoff)
 */
export function getRetryDelay(retryCount: number): number {
  return Math.min(1000 * Math.pow(2, retryCount), 30000); // Max 30 seconds
}

/**
 * Format error for logging
 */
export function formatErrorForLogging(apiError: ApiError): string {
  return `[${apiError.status}] ${apiError.errorType}: ${apiError.message}${
    apiError.retryAfter ? ` (retry after ${apiError.retryAfter} min)` : ''
  }`;
}

/**
 * Main error handler function
 */
export async function handleApiError(
  error: any,
  options?: {
    showNotification?: boolean;
    customMessage?: string;
    onRetry?: () => Promise<any>;
    maxRetries?: number;
  }
): Promise<ApiError> {
  const apiError = detectApiError(error);
  const errorMessage = options?.customMessage || getErrorMessage(apiError);

  // Log error
  console.error(formatErrorForLogging(apiError));

  // Show notification if enabled
  if (options?.showNotification && typeof window !== 'undefined') {
    const { enqueueSnackbar } = await import('notistack');
    enqueueSnackbar(errorMessage, { 
      variant: apiError.errorType === 'rate_limit' ? 'warning' : 'error',
      autoHideDuration: 5000,
    });
  }

  // Auto-retry if applicable
  if (options?.onRetry && shouldRetry(apiError, 0, options.maxRetries)) {
    const delay = getRetryDelay(0);
    console.log(`Retrying after ${delay}ms...`);
    
    await new Promise(resolve => setTimeout(resolve, delay));
    
    try {
      return await options.onRetry();
    } catch (retryError) {
      return detectApiError(retryError);
    }
  }

  return apiError;
}

/**
 * Parse error response from various API formats
 */
export function parseErrorResponse(error: any): {
  status: number;
  message: string;
  data?: any;
} {
  // Axios error
  if (error?.response) {
    return {
      status: error.response.status,
      message: error.response.data?.message || error.response.statusText,
      data: error.response.data,
    };
  }

  // Fetch error
  if (error?.status) {
    return {
      status: error.status,
      message: error.message || 'Request failed',
      data: error.data,
    };
  }

  // Network error
  if (error?.message === 'Network Error' || error?.code === 'ECONNABORTED') {
    return {
      status: 0,
      message: 'Network error',
    };
  }

  // Unknown error
  return {
    status: 0,
    message: error?.message || 'Unknown error',
  };
}
