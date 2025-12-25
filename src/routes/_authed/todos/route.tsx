import ErrorComponent from '@/components/app/error-component';
import {
  useQueryErrorResetBoundary,
  useSuspenseQuery,
} from '@tanstack/react-query';
import type { ErrorComponentProps } from '@tanstack/react-router';
import {
  createFileRoute,
  Link,
  Outlet,
  useNavigate,
} from '@tanstack/react-router';
import { useEffect } from 'react';

import NotFound from '@/components/app/not-found-component';
import TodoList from '@/components/todo-list';
import TodoListSkeleton from '@/components/todo-list-skeleton';

import { Button } from '@/components/ui/button';
import { Field, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import {
  directionOptions,
  orderByOptions,
  statusOptions,
  todosQueryOptions,
  todosQuerySchema,
  type TodosQuery,
} from '@/lib/query-options';
import { seo } from '@/lib/seo';
import { cn } from '@/lib/utils';
import { useEffectEvent, useState } from 'react';

export const Route = createFileRoute('/_authed/todos')({
  validateSearch: todosQuerySchema,
  beforeLoad: ({ search }) => {
    return {
      search,
    };
  },

  loader: async ({ context }) => {
    return context.queryClient.ensureQueryData({
      ...todosQueryOptions({ ...context.search }),
      revalidateIfStale: true,
    });
  },

  head: () => {
    return {
      meta: seo({
        title: 'Todos',
      }),
    };
  },

  component: RouteComponent,
  pendingComponent: TodosPendingComponent,
  errorComponent: TodosErrorComponent,
  notFoundComponent: NotFound,
});

function RouteComponent() {
  const searchParams = Route.useSearch();
  const navigate = useNavigate({ from: Route.fullPath });

  const [queryInput, setQueryInput] = useState(searchParams.query ?? '');
  const { data: todos } = useSuspenseQuery(todosQueryOptions(searchParams));

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    navigate({ search: (_prev) => ({ query: queryInput }), replace: true });
  };

  const onQueryClear = useEffectEvent(() => {
    if (queryInput.trim() === '') {
      setQueryInput('');
      return navigate({
        search: (prev) => ({ ...prev, query: undefined }),
        replace: true,
      });
    }
  });

  useEffect(() => {
    onQueryClear();
  }, [queryInput]);

  const updateFilters = (name: keyof TodosQuery, value: unknown) => {
    navigate({
      search: (prev) => ({ ...prev, [name]: value }),
      replace: true, // prevent adding a new entry to the browser history (can't go back to previous filter state with back button when true)
    });
  };

  //TODO : handle pagination

  return (
    <main className='h-full w-full'>
      <div className='mx-auto grid h-full max-w-7xl grid-cols-1 gap-6 p-6 lg:grid-cols-[380px_1fr]'>
        {/* Sidebar */}
        <aside className='h-fit rounded-xl border border-slate-200 bg-white p-6 shadow-sm lg:sticky lg:top-6 dark:border-slate-800 dark:bg-slate-900/50'>
          <div className='mb-6 flex items-center gap-3'>
            <div className='flex h-10 w-10 items-center justify-center rounded-lg bg-linear-to-br from-blue-500 to-purple-600'>
              <svg
                xmlns='http://www.w3.org/2000/svg'
                width='20'
                height='20'
                viewBox='0 0 24 24'
                fill='none'
                stroke='currentColor'
                strokeWidth='2'
                strokeLinecap='round'
                strokeLinejoin='round'
                className='text-white'
              >
                <path d='M9 11l3 3L22 4' />
                <path d='M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11' />
              </svg>
            </div>
            <h1 className='bg-linear-to-r from-blue-600 to-purple-600 bg-clip-text text-2xl font-bold text-transparent'>
              My Todos
            </h1>
          </div>

          {/* Filters */}
          <div className='mb-4 space-y-3'>
            <form onSubmit={handleSearch} className='flex items-center gap-2'>
              <Input
                placeholder='Search todos...'
                value={queryInput}
                onChange={(e) => setQueryInput(e.target.value)}
                className='flex-1'
              />
              <Button type='submit'>Search</Button>
            </form>

            <Field className='flex-1 '>
              <FieldLabel htmlFor='select-orderBy'>Select Status</FieldLabel>
              <Select
                items={statusOptions}
                value={
                  searchParams.status === 'all'
                    ? 'all'
                    : searchParams.status === 'completed'
                      ? 'completed'
                      : 'pending'
                }
                onValueChange={(value) => {
                  updateFilters('status', value as TodosQuery['status']);
                }}
              >
                <SelectTrigger className='w-full'>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className={cn('space-y-4')}>
                  {statusOptions.map((item) => (
                    <SelectItem key={item.label} value={item.value}>
                      {item.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            {/* Sorting */}
            <div className='flex gap-2'>
              <Field className='flex-1 '>
                <FieldLabel htmlFor='select-orderBy'>Order By</FieldLabel>
                <Select
                  items={orderByOptions}
                  value={searchParams.orderBy}
                  onValueChange={(value) =>
                    updateFilters('orderBy', value as TodosQuery['orderBy'])
                  }
                >
                  <SelectTrigger id='select-orderBy' className='w-full'>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className={cn('space-y-4')}>
                    {orderByOptions.map((item) => (
                      <SelectItem key={item.label} value={item.value}>
                        {item.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>

              <Field className='w-1/3'>
                <FieldLabel htmlFor='select-direction'>Direction</FieldLabel>
                <Select
                  items={directionOptions}
                  value={searchParams.direction}
                  onValueChange={(value) =>
                    updateFilters('direction', value as TodosQuery['direction'])
                  }
                >
                  <SelectTrigger className='w-full' id='select-direction'>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className={cn('space-y-4')}>
                    {directionOptions.map((item) => (
                      <SelectItem key={item.label} value={item.value}>
                        {item.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
            </div>
          </div>

          {todos.length === 0 ? (
            <div className='flex h-full flex-col items-center justify-center'>
              <p className='text-muted-foreground'>
                You have no todos yet. Create one!
              </p>
              <Link to='/' className='text-primary ml-2 hover:underline'>
                create your first todo
              </Link>
            </div>
          ) : (
            <div className='flex flex-col h-full w-full'>
              <TodoList todos={todos} />
            </div>
          )}
        </aside>

        {/* Main Content */}
        <div className='rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900/50'>
          <Outlet />
        </div>
      </div>
    </main>
  );
}

function TodosPendingComponent() {
  return (
    <main className='h-full w-full'>
      <div className='mx-auto grid h-full max-w-7xl grid-cols-1 gap-6 p-6 lg:grid-cols-[380px_1fr]'>
        {/* Sidebar Skeleton */}
        <aside className='h-fit rounded-xl border border-slate-200 bg-white p-6 shadow-sm lg:sticky lg:top-6 dark:border-slate-800 dark:bg-slate-900/50'>
          <div className='mb-6 flex items-center gap-3'>
            <div className='flex h-10 w-10 items-center justify-center rounded-lg bg-linear-to-br from-blue-500 to-purple-600'>
              <svg
                xmlns='http://www.w3.org/2000/svg'
                width='20'
                height='20'
                viewBox='0 0 24 24'
                fill='none'
                stroke='currentColor'
                strokeWidth='2'
                strokeLinecap='round'
                strokeLinejoin='round'
                className='text-white'
              >
                <path d='M9 11l3 3L22 4' />
                <path d='M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11' />
              </svg>
            </div>
            <h1 className='bg-linear-to-r from-blue-600 to-purple-600 bg-clip-text text-2xl font-bold text-transparent'>
              My Todos
            </h1>
          </div>

          {/* Filters Skeleton */}
          <div className='mb-4 space-y-3'>
            <div className='h-10 w-full animate-pulse rounded-md bg-slate-200 dark:bg-slate-800' />
            <div className='h-10 w-full animate-pulse rounded-md bg-slate-200 dark:bg-slate-800' />

            {/* Sorting Skeleton */}
            <div className='flex gap-2'>
              <div className='flex-1 space-y-2'>
                <div className='h-4 w-16 animate-pulse rounded bg-slate-200 dark:bg-slate-800' />
                <div className='h-10 w-full animate-pulse rounded-md bg-slate-200 dark:bg-slate-800' />
              </div>
              <div className='w-1/3 space-y-2'>
                <div className='h-4 w-16 animate-pulse rounded bg-slate-200 dark:bg-slate-800' />
                <div className='h-10 w-full animate-pulse rounded-md bg-slate-200 dark:bg-slate-800' />
              </div>
            </div>
          </div>

          <TodoListSkeleton />
        </aside>

        {/* Main Content Skeleton */}
        <Skeleton className='rounded-xl border border-slate-200  shadow-sm dark:border-slate-800  ' />
      </div>
    </main>
  );
}

function TodosErrorComponent({ error, reset }: ErrorComponentProps) {
  const queryErrorResetBoundary = useQueryErrorResetBoundary();

  useEffect(() => {
    queryErrorResetBoundary.reset();
  }, [queryErrorResetBoundary]);

  return (
    <div className='flex h-full items-center justify-center'>
      <ErrorComponent error={error} reset={reset} />
    </div>
  );
}
