import { ResendMagicLinkButton } from '@/components/auth/resend-magic-link';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import type { MagicLinkCredentials } from '@/lib/utils';
import { getMagicLinkData } from '@/server/auth.actions';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { zodValidator } from '@tanstack/zod-adapter';
import { AlertCircle, Home, RefreshCw } from 'lucide-react';
import { z } from 'zod';

export const searchSchema = z.object({
  error: z.string().optional(),
  type: z.enum(['magic-link', 'social']).optional(),
});

type ErrorType = 'magic-link' | 'social';

type ErrorDetails = {
  title: string;
  message: string;
  suggestion: string;
};

export const Route = createFileRoute('/_auth/error')({
  validateSearch: zodValidator(searchSchema),

  loader: async () => {
    const cookie = await getMagicLinkData();
    return (
      cookie ? JSON.parse(cookie) : { email: '', name: '' }
    ) as MagicLinkCredentials;
  },

  component: RouteComponent,
});

/* ---------------------------------------------
 * Error catalogs
 * -------------------------------------------- */

const SHARED_ERRORS: Record<string, ErrorDetails> = {
  RATE_LIMIT_EXCEEDED: {
    title: 'Too Many Attempts',
    message: 'You have made too many sign-in attempts.',
    suggestion:
      'Please wait a few minutes before trying again. This helps protect your account security.',
  },
  PLEASE_RESTART_THE_PROCESS: {
    title: 'Session Interrupted',
    message: 'The sign-in process was interrupted.',
    suggestion: 'Please start over and try again.',
  },
};

const SOCIAL_ERRORS: Record<string, ErrorDetails> = {
  ACCESS_DENIED: {
    title: 'Access Denied',
    message: 'You cancelled the sign-in process.',
    suggestion:
      'If you want to sign in, please try again and grant the necessary permissions.',
  },
  ACCOUNT_NOT_LINKED: {
    title: 'Account Not Linked',
    message: 'This social account is not linked to any user.',
    suggestion:
      'Please sign in with your original method first, then link your social account in settings.',
  },
  EMAIL_CONFLICT: {
    title: 'Email Already in Use',
    message: 'An account with this email already exists.',
    suggestion:
      'Please sign in with your existing account or use a different social provider.',
  },
  PROVIDER_ERROR: {
    title: 'Provider Error',
    message: 'The authentication provider encountered an error.',
    suggestion:
      'This might be a temporary issue. Please try again in a few moments.',
  },
  ...SHARED_ERRORS,
};

const MAGIC_LINK_ERRORS: Record<string, ErrorDetails> = {
  INVALID_TOKEN: {
    title: 'Invalid or Expired Link',
    message: 'This magic link is no longer valid.',
    suggestion:
      'Magic links expire after 30 minutes or can only be used once. Please request a new one.',
  },
  EXPIRED_TOKEN: {
    title: 'Link Expired',
    message: 'This magic link has expired.',
    suggestion:
      'Magic links expire after 30 minutes for security. Please request a new one.',
  },
  VERIFICATION_FAILED: {
    title: 'Verification Failed',
    message: "We couldn't verify your email address.",
    suggestion: 'Please try requesting a new magic link.',
  },
  ...SHARED_ERRORS,
};

const DEFAULT_ERROR: ErrorDetails = {
  title: 'Something Went Wrong',
  message: 'An unexpected error occurred during sign in.',
  suggestion: 'Please try again or contact support if the problem persists.',
};

/* ---------------------------------------------
 * Helpers
 * -------------------------------------------- */

function normalizeErrorCode(error?: string): string {
  return (error || 'UNKNOWN_ERROR').toUpperCase();
}

function resolveErrorType(
  paramsType: ErrorType | undefined,
  errorCode: string,
  hasEmail: boolean
): ErrorType {
  if (paramsType) return paramsType;

  if (errorCode in SOCIAL_ERRORS) return 'social';
  if (errorCode in MAGIC_LINK_ERRORS) return 'magic-link';

  // fallback heuristic
  return hasEmail ? 'magic-link' : 'social';
}

function getErrorDetails(
  errorType: ErrorType,
  errorCode: string
): ErrorDetails {
  const source = errorType === 'social' ? SOCIAL_ERRORS : MAGIC_LINK_ERRORS;

  return source[errorCode] ?? DEFAULT_ERROR;
}

/* ---------------------------------------------
 * Component
 * -------------------------------------------- */

function RouteComponent() {
  const navigate = useNavigate();
  const { email, name } = Route.useLoaderData();
  const search = Route.useSearch();

  const errorCode = normalizeErrorCode(search.error);
  const errorType = resolveErrorType(search.type, errorCode, Boolean(email));
  const errorDetails = getErrorDetails(errorType, errorCode);

  const showResendButton = errorType === 'magic-link' && Boolean(email);

  return (
    <div className='from-background to-muted flex h-full w-full items-center justify-center bg-linear-to-br p-4'>
      <Card className='w-full max-w-md'>
        <CardHeader className='pb-4 text-center'>
          <div className='mb-4 flex justify-center'>
            <div className='bg-destructive/10 flex h-20 w-20 items-center justify-center rounded-full'>
              <AlertCircle className='text-destructive h-10 w-10' />
            </div>
          </div>

          <CardTitle className='mb-2 text-3xl'>{errorDetails.title}</CardTitle>

          <CardDescription className='text-base'>
            {errorDetails.message}
          </CardDescription>
        </CardHeader>

        <CardContent className='space-y-6'>
          <Alert>
            <AlertDescription>
              <p className='mb-2 font-medium'>What happened?</p>
              <p className='text-muted-foreground text-sm'>
                {errorDetails.suggestion}
              </p>
            </AlertDescription>
          </Alert>

          <div className='space-y-3'>
            {showResendButton && (
              <ResendMagicLinkButton email={email} name={name} />
            )}

            <div className='grid grid-cols-2 gap-2'>
              <Button variant='outline' onClick={() => navigate({ to: '/' })}>
                <Home className='mr-2 h-4 w-4' />
                Go Home
              </Button>

              <Button
                variant='outline'
                onClick={() => navigate({ to: '/login' })}
              >
                <RefreshCw className='mr-2 h-4 w-4' />
                Try Again
              </Button>
            </div>
          </div>

          <div className='text-center'>
            <p className='text-muted-foreground text-xs'>
              Need help?{' '}
              <a href='/support' className='text-primary hover:underline'>
                Contact support
              </a>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
