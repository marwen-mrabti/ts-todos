import { useMemo } from 'react';

interface ErrorDisplay {
  code: string;
  message: string;
}

interface UseErrorDisplayOptions {
  simplifyQuotaErrors?: boolean;
}

export function useAIErrorDisplay(
  error: { message?: string; code?: string | number } | null | undefined,
  options: UseErrorDisplayOptions = {}
): ErrorDisplay | null {
  const { simplifyQuotaErrors = true } = options;

  return useMemo(() => {
    if (!error) return null;

    let errorMessage = error.message || 'An unknown error occurred';
    let errorCode = error.code?.toString() || 'UNKNOWN_ERROR';

    // Try to parse nested JSON error (like Gemini's error format)
    try {
      const parsed = JSON.parse(errorMessage);
      if (parsed.error) {
        errorMessage = parsed.error.message || errorMessage;
        errorCode =
          parsed.error.code?.toString() || parsed.error.status || errorCode;
      }
    } catch {
      // Not JSON, use as-is
    }

    // Simplify quota error messages if enabled
    if (
      simplifyQuotaErrors &&
      (errorMessage.includes('quota') ||
        errorMessage.includes('RESOURCE_EXHAUSTED'))
    ) {
      // Extract retry time if available
      if (errorMessage.includes('retry')) {
        const retryMatch = errorMessage.match(/retry in ([\d.]+)s/i);
        if (retryMatch) {
          const seconds = Math.ceil(parseFloat(retryMatch[1]));
          return {
            code: 'QUOTA_EXCEEDED',
            message: `API quota exceeded. Please retry in ${seconds} second${seconds !== 1 ? 's' : ''}.`,
          };
        }
      }

      return {
        code: 'QUOTA_EXCEEDED',
        message:
          'API quota exceeded. Please check your plan and billing details, or try again later.',
      };
    }

    return { code: errorCode, message: errorMessage };
  }, [error, simplifyQuotaErrors]);
}
