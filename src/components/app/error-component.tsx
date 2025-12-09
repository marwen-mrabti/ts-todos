import { useRouter } from '@tanstack/react-router';
import { OctagonAlert } from 'lucide-react';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';

export default function ErrorComponent({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  const router = useRouter();

  return (
    <div className="mx-4 my-4 flex flex-col items-center gap-4">
      <Alert className="bg-destructive text-destructive-foreground rounded-md p-2">
        <OctagonAlert size={100} />
        <AlertTitle className="text-xl">Something went wrong!</AlertTitle>
        <AlertDescription className="text-lg">{error.message}</AlertDescription>
      </Alert>
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          className="bg-green-500! text-lg font-medium uppercase"
          onClick={() => {
            // Reset the router error boundary
            reset();
          }}
        >
          retry
        </Button>
        <Button
          variant="secondary"
          className="bg-blue-500 text-lg font-medium uppercase"
          onClick={() => {
            // Invalidate the route to reload the loader, which will also reset the error boundary
            router.invalidate();
          }}
        >
          reload
        </Button>
      </div>
    </div>
  );
}
