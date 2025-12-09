import { Link, useRouter } from '@tanstack/react-router';

export default function NotFound() {
  const router = useRouter();

  return (
    <div className="bg-background text-foreground flex min-h-screen flex-col items-center justify-center px-4">
      <h1 className="text-primary text-6xl font-bold sm:text-8xl">404</h1>
      <p className="mt-4 text-xl font-semibold sm:text-2xl">Page Not Found</p>
      <p className="text-muted-foreground mt-2 max-w-md text-center">
        Sorry, the page you're looking for doesn't exist or has been moved.
      </p>

      <div className="flex items-center gap-4">
        <button
          onClick={() => router.history.back()}
          className="bg-primary text-primary-foreground mt-6 rounded-xl px-6 py-3 text-sm font-medium shadow-md transition hover:shadow-lg sm:text-base"
        >
          Go Back
        </button>

        <Link
          to="/"
          className="bg-primary text-primary-foreground mt-6 rounded-xl px-6 py-3 text-sm font-medium shadow-md transition hover:shadow-lg sm:text-base"
        >
          Go Home
        </Link>
      </div>
    </div>
  );
}
