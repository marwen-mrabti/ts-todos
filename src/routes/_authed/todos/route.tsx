import {
  useQueryErrorResetBoundary,
  useSuspenseQuery,
} from '@tanstack/react-query';
import type { ErrorComponentProps } from '@tanstack/react-router';
import { createFileRoute, Link, Outlet } from '@tanstack/react-router';
import { useEffect } from 'react';

import ErrorComponent from '@/components/app/error-component';
import NotFound from '@/components/app/not-found-component';
import TodoList from '@/components/todo-list';
import TodoListSkeleton from '@/components/todo-list-skeleton';

import { todosQueryOptions } from '@/lib/query-options';
import { seo } from '@/lib/seo';
import { TodoPendingComponent } from '@/routes/_authed/todos/$todoId';

export const Route = createFileRoute('/_authed/todos')({
  loader: async ({ context }) => {
    return context.queryClient.ensureQueryData({
      ...todosQueryOptions(),
      revalidateIfStale: true
    });
  },

  head: ({ }) => {
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
  const { data: todos } = useSuspenseQuery(todosQueryOptions());

  return (
    <main className="h-full w-full">
      <div className="mx-auto grid h-full max-w-7xl grid-cols-1 gap-6 p-6 lg:grid-cols-[380px_1fr]">
        {/* Sidebar */}
        <aside className="h-fit rounded-xl border border-slate-200 bg-white p-6 shadow-sm lg:sticky lg:top-6 dark:border-slate-800 dark:bg-slate-900/50">
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-linear-to-br from-blue-500 to-purple-600">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-white"
              >
                <path d="M9 11l3 3L22 4" />
                <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
              </svg>
            </div>
            <h1 className="bg-linear-to-r from-blue-600 to-purple-600 bg-clip-text text-2xl font-bold text-transparent">
              My Todos
            </h1>
          </div>

          {todos.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center">
              <p className="text-muted-foreground">
                You have no todos yet. Create one!
              </p>
              <Link to="/" className="text-primary ml-2 hover:underline">
                create your first todo
              </Link>
            </div>
          ) : (
            <TodoList todos={todos} />
          )}
        </aside>

        {/* Main Content */}
        <div className="rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900/50">
          <Outlet />
        </div>
      </div>
    </main>
  );
}

function TodosPendingComponent() {
  return (
    <main className="h-full w-full">
      <div className="mx-auto grid h-full max-w-7xl grid-cols-1 gap-6 p-6 lg:grid-cols-[380px_1fr]">
        {/* Sidebar Skeleton */}
        <aside className="h-fit rounded-xl border border-slate-200 bg-white p-6 shadow-sm lg:sticky lg:top-6 dark:border-slate-800 dark:bg-slate-900/50">
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-linear-to-br from-blue-500 to-purple-600">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-white"
              >
                <path d="M9 11l3 3L22 4" />
                <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
              </svg>
            </div>
            <h1 className="bg-linear-to-r from-blue-600 to-purple-600 bg-clip-text text-2xl font-bold text-transparent">
              My Todos
            </h1>
          </div>

          <TodoListSkeleton />
        </aside>

        {/* Main Content Skeleton */}
        <div className="rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900/50">
          <TodoPendingComponent />
        </div>
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
    <div className="flex h-full items-center justify-center">
      <ErrorComponent error={error} reset={reset} />
    </div>
  );
}
