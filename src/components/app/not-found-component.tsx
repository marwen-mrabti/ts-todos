import { Link, useRouter } from '@tanstack/react-router';
import { ArrowLeft, Home, Search } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export default function NotFound() {
  const router = useRouter();

  return (
    <div className='flex min-h-screen items-center justify-center bg-linear-to-br from-slate-50 to-slate-100 p-4 dark:from-slate-950 dark:to-slate-900'>
      <Card className='w-full max-w-lg border-slate-200 shadow-xl dark:border-slate-800'>
        <CardContent className='flex flex-col items-center p-8 text-center sm:p-12'>
          {/* 404 Icon/Number */}
          <div className='relative mb-6'>
            <div className='bg-primary/20 absolute inset-0 animate-pulse rounded-full blur-2xl'></div>
            <div className='relative flex h-32 w-32 items-center justify-center rounded-full bg-linear-to-br from-blue-500 to-purple-600 shadow-lg'>
              <Search className='h-16 w-16 text-white' strokeWidth={2.5} />
            </div>
          </div>

          {/* 404 Text */}
          <h1 className='mb-2 bg-linear-to-r from-blue-600 to-purple-600 bg-clip-text text-7xl font-bold text-transparent sm:text-8xl'>
            404
          </h1>

          <h2 className='mb-3 text-2xl font-semibold sm:text-3xl'>
            Page Not Found
          </h2>

          <p className='text-muted-foreground mb-8 max-w-md text-sm sm:text-base'>
            Oops! The page you're looking for doesn't exist or has been moved.
            Let's get you back on track.
          </p>

          {/* Action Buttons */}
          <div className='flex w-full flex-col gap-3 sm:flex-row sm:justify-center'>
            <Button
              variant='default'
              size='lg'
              onClick={() => router.history.back()}
              className='w-full sm:w-auto'
            >
              <ArrowLeft className='mr-2 h-4 w-4' />
              Go Back
            </Button>

            <Button variant='outline' size='lg' className='w-full sm:w-auto'>
              <Link to='/'>
                <Home className='mr-2 h-4 w-4' />
                Go Home
              </Link>
            </Button>
          </div>

          {/* Optional: Add helpful links */}
          <div className='mt-8 border-t pt-6 dark:border-slate-800'>
            <p className='text-muted-foreground mb-3 text-sm'>
              Quick links to help you navigate:
            </p>
            <div className='flex flex-wrap justify-center gap-2 text-sm'>
              <Link to='/' className='text-primary hover:underline'>
                Home
              </Link>
              <span className='text-muted-foreground'>•</span>
              <Link to='/todos' className='text-primary hover:underline'>
                Todos
              </Link>
              <span className='text-muted-foreground'>•</span>
              <Link to='/login' className='text-primary hover:underline'>
                Login
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
