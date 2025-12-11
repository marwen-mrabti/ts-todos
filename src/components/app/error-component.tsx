import { useRouter } from '@tanstack/react-router';
import { Home, OctagonAlert, RefreshCw } from 'lucide-react';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';

export default function ErrorComponent({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  const router = useRouter();

  return (
    <div className="flex min-h-[400px] items-center justify-center p-4">
      <Card className="w-full max-w-md border-destructive/50 shadow-lg">
        <CardHeader className="space-y-4 text-center">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-destructive/10">
            <OctagonAlert className="h-10 w-10 text-destructive" />
          </div>
          <div>
            <AlertTitle className="text-2xl font-bold">
              Oops! Something went wrong
            </AlertTitle>
            <p className="mt-2 text-sm text-muted-foreground">
              We encountered an unexpected error
            </p>
          </div>
        </CardHeader>

        <CardContent>
          <Alert variant="destructive" className="border-destructive/50">
            <AlertDescription className="text-sm font-mono">
              {error.message || 'An unexpected error occurred'}
            </AlertDescription>
          </Alert>
        </CardContent>

        <CardFooter className="flex flex-col gap-3 sm:flex-row">
          <Button
            variant="default"
            className="w-full sm:w-auto"
            onClick={() => {
              reset();
            }}
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Try Again
          </Button>
          <Button
            variant="outline"
            className="w-full sm:w-auto"
            onClick={() => {
              router.invalidate();
            }}
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Reload Page
          </Button>
          <Button
            variant="ghost"
            className="w-full sm:w-auto"
            onClick={() => {
              router.navigate({ to: '/' });
            }}
          >
            <Home className="mr-2 h-4 w-4" />
            Go Home
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}