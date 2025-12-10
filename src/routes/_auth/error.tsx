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
import { getMagicLinkData } from '@/serverFns/auth.queries';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { zodValidator } from '@tanstack/zod-adapter';
import { AlertCircle, Home, RefreshCw } from 'lucide-react';
import { z } from 'zod';

export const searchSchema = z.object({
  error: z.string().optional(),
});

export const Route = createFileRoute('/_auth/error')({
  validateSearch: zodValidator(searchSchema),

  loader: async () => {
    const cookie = await getMagicLinkData();
    const data = (
      cookie ? JSON.parse(cookie) : { email: '', name: '' }
    ) as MagicLinkCredentials;
    return data;
  },
  component: RouteComponent,
});

function RouteComponent() {
  const navigate = useNavigate();
  const { email, name } = Route.useLoaderData();
  const searchParams = Route.useSearch();

  // Extract error from URL params and normalize to uppercase
  const errorCode = (
    (searchParams as any)?.error || 'UNKNOWN_ERROR'
  ).toUpperCase();

  // Map error codes to user-friendly messages
  const getErrorDetails = (code: string) => {
    const errors: Record<
      string,
      { title: string; message: string; suggestion: string }
    > = {
      INVALID_TOKEN: {
        title: 'Invalid or Expired Link',
        message: 'This magic link is no longer valid.',
        suggestion:
          'Magic links expire after 30 minutes or can only be used once. Please request a new one to sign in.',
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
      UNKNOWN_ERROR: {
        title: 'Something Went Wrong',
        message: 'An unexpected error occurred during sign in.',
        suggestion:
          'Please try again or contact support if the problem persists.',
      },
    };

    return errors[code] || errors.UNKNOWN_ERROR;
  };

  const errorDetails = getErrorDetails(errorCode);

  return (
    <div className="from-background to-muted flex h-full w-full items-center justify-center bg-linear-to-br p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="pb-4 text-center">
          <div className="mb-4 flex justify-center">
            <div className="bg-destructive/10 flex h-20 w-20 items-center justify-center rounded-full">
              <AlertCircle className="text-destructive h-10 w-10" />
            </div>
          </div>

          <CardTitle className="mb-2 text-3xl">{errorDetails.title}</CardTitle>

          <CardDescription className="text-base">
            {errorDetails.message}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          <Alert>
            <AlertDescription>
              <p className="mb-2 font-medium">What happened?</p>
              <p className="text-muted-foreground text-sm">
                {errorDetails.suggestion}
              </p>
            </AlertDescription>
          </Alert>

          <div className="space-y-3">
            <ResendMagicLinkButton email={email} name={name} />

            <div className="grid grid-cols-2 gap-2">
              <Button variant="outline" onClick={() => navigate({ to: '/' })}>
                <Home className="mr-2 h-4 w-4" />
                Go Home
              </Button>
              <Button
                variant="outline"
                onClick={() => window.location.reload()}
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Retry
              </Button>
            </div>
          </div>

          <div className="text-center">
            <p className="text-muted-foreground text-xs">
              Need help?{' '}
              <a href="/support" className="text-primary hover:underline">
                Contact support
              </a>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
