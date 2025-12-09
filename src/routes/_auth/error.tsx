import { ResendMagicLinkButton } from '@/components/auth/resend-magic-link'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { createFileRoute, useNavigate, useSearch } from '@tanstack/react-router'
import { AlertCircle, Home, RefreshCw } from 'lucide-react'

export const Route = createFileRoute('/_auth/error')({
  component: RouteComponent,
})

function RouteComponent() {
  const navigate = useNavigate()
  const searchParams = useSearch({ from: '/_auth/error' })

  // Extract error from URL params and normalize to uppercase
  const errorCode = ((searchParams as any)?.error || 'UNKNOWN_ERROR').toUpperCase()

  // Map error codes to user-friendly messages
  const getErrorDetails = (code: string) => {
    const errors: Record<string, { title: string; message: string; suggestion: string }> = {
      INVALID_TOKEN: {
        title: 'Invalid or Expired Link',
        message: 'This magic link is no longer valid.',
        suggestion: 'Magic links expire after 30 minutes or can only be used once. Please request a new one to sign in.',
      },
      EXPIRED_TOKEN: {
        title: 'Link Expired',
        message: 'This magic link has expired.',
        suggestion: 'Magic links expire after 30 minutes for security. Please request a new one.',
      },
      VERIFICATION_FAILED: {
        title: 'Verification Failed',
        message: 'We couldn\'t verify your email address.',
        suggestion: 'Please try requesting a new magic link.',
      },
      UNKNOWN_ERROR: {
        title: 'Something Went Wrong',
        message: 'An unexpected error occurred during sign in.',
        suggestion: 'Please try again or contact support if the problem persists.',
      },
    }

    return errors[code] || errors.UNKNOWN_ERROR
  }

  const errorDetails = getErrorDetails(errorCode)

  return (
    <div className="w-full h-full bg-linear-to-br from-background to-muted flex items-center justify-center p-4">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center pb-4">
          <div className="mb-4 flex justify-center">
            <div className="w-20 h-20 bg-destructive/10 rounded-full flex items-center justify-center">
              <AlertCircle className="w-10 h-10 text-destructive" />
            </div>
          </div>

          <CardTitle className="text-3xl mb-2">
            {errorDetails.title}
          </CardTitle>

          <CardDescription className="text-base">
            {errorDetails.message}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          <Alert>
            <AlertDescription>
              <p className="font-medium mb-2">What happened?</p>
              <p className="text-sm text-muted-foreground">
                {errorDetails.suggestion}
              </p>
            </AlertDescription>
          </Alert>

          <div className="space-y-3">

            <ResendMagicLinkButton />

            <div className="grid grid-cols-2 gap-2">
              <Button
                variant="outline"
                onClick={() => navigate({ to: '/' })}
              >
                <Home className="w-4 h-4 mr-2" />
                Go Home
              </Button>
              <Button
                variant="outline"
                onClick={() => window.location.reload()}
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Retry
              </Button>
            </div>
          </div>

          <div className="text-center">
            <p className="text-xs text-muted-foreground">
              Need help?{' '}
              <a
                href="/support"
                className="text-primary hover:underline"
              >
                Contact support
              </a>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}