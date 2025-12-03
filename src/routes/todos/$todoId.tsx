import {
  useMutation,
  useQueryErrorResetBoundary,
  useSuspenseQuery,
} from '@tanstack/react-query';
import type { ErrorComponentProps } from '@tanstack/react-router';
import { createFileRoute, useNavigate, useRouteContext } from '@tanstack/react-router';
import { Trash2 } from 'lucide-react';
import { useEffect } from 'react';

import ErrorComponent from '@/components/error-component';
import NotFound from '@/components/not-found-component';
import { Button } from '@/components/ui/button';
import { deleteTodo } from "@/db/queries/todos";
import { todoQueryOptions } from '@/lib/query-options';
import { seo } from '@/lib/seo';
import { toast } from 'sonner';

export const Route = createFileRoute('/todos/$todoId')({
  loader: async ({ params: { todoId }, context: { queryClient } }) => {
    return queryClient.ensureQueryData(todoQueryOptions({ todoId }));
  },

  head: ({ loaderData }) => {
    return ({
      meta: seo({
        title: loaderData?.title || 'Todo Details',
      }),
    })
  },

  component: TodoPage,
  pendingComponent: TodoPendingComponent,
  notFoundComponent: NotFound,
  errorComponent: TodoErrorComponent,
});

// -----------------------------
// MAIN PAGE COMPONENT
// -----------------------------
function TodoPage() {
  const navigate = useNavigate({ from: "/todos/$todoId" });
  const context = useRouteContext({ from: '/todos/$todoId' });
  const { todoId } = Route.useParams();

  const { data: todo } = useSuspenseQuery(todoQueryOptions({ todoId }));

  // DELETE MUTATION
  const mutation = useMutation({
    mutationFn: () => deleteTodo({ data: todoId }),
    onSuccess: () => {
      toast('Todo Deleted', {
        description: (
          <pre className="bg-green-400/50 text-secondary-foreground mt-2 w-xs overflow-x-auto rounded-md p-4 text-pretty">
            Todo has been removed.
          </pre>
        ),
        position: 'top-right',
        classNames: {
          content: 'w-md flex flex-col gap-2',
        },
        style: {
          '--border-radius': 'calc(var(--radius)  + 4px)',
        } as React.CSSProperties,
      });
      navigate({ to: '/todos' });
    },
    onError: (error: any) => {
      const errorMessage =
        error?.data?.message || error.message || 'Failed to delete todo';

      toast('Failed to delete todo', {
        description: (
          <pre className="bg-destructive text-destructive-foreground mt-2 w-xs overflow-x-auto rounded-md p-4 text-pretty">
            {errorMessage}
          </pre>
        ),
        position: 'top-right',
        classNames: {
          content: 'w-sm flex flex-col gap-2',
        },
        style: {
          '--border-radius': 'calc(var(--radius)  + 4px)',
        } as React.CSSProperties,
      });
    },
    onSettled: () => {
      context.queryClient.invalidateQueries({
        queryKey: ['todos'],
      });
    },
  });

  return (
    <div className="w-full p-6">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-primary text-3xl font-semibold tracking-tight">Todo Details</h2>

        <Button
          variant="destructive"
          size="sm"
          className="flex gap-2"
          disabled={mutation.isPending}
          onClick={() => mutation.mutate()}
        >
          <Trash2 className="h-4 w-4" />
          Delete
        </Button>
      </div>

      <div className="rounded-xl border p-5 shadow-sm dark:border-slate-700">
        <p className="mb-3 text-sm text-muted-foreground">
          Here are the details of your selected todo.
        </p>

        <div className="space-y-3">
          <p>
            <strong className="text-slate-700 dark:text-slate-300">ID:</strong>{' '}
            {todo.id}
          </p>
          <p>
            <strong className="text-slate-700 dark:text-slate-300">
              Title:
            </strong>{' '}
            {todo.title}
          </p>
          <p>
            <strong className="text-slate-700 dark:text-slate-300">
              Completed:
            </strong>{' '}
            {todo.isCompleted ? 'Yes' : 'No'}
          </p>
        </div>
      </div>
    </div>
  );
}

// -----------------------------
// LOADING SKELETON
// -----------------------------
export function TodoPendingComponent() {
  return (
    <div className="w-full p-6">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-primary text-3xl font-semibold tracking-tight">Todo Details</h2>

        <Button
          variant="destructive"
          size="sm"
          className="flex gap-2"
          disabled
        >
          <Trash2 className="h-4 w-4" />
          Delete
        </Button>
      </div>

      <div className="rounded-xl border p-5 shadow-sm dark:border-slate-700">
        <p className="mb-3 text-sm text-muted-foreground">
          Here are the details of your selected todo.
        </p>

        <div className="space-y-3">
          <div className="mb-4 h-8 w-48 animate-pulse rounded bg-slate-200 dark:bg-slate-700"></div>
          <div className="mb-6 h-4 w-1/2 animate-pulse rounded bg-slate-200 dark:bg-slate-700"></div>
          <div className="mb-4 h-4 w-32 animate-pulse rounded bg-slate-200 dark:bg-slate-700"></div>
          <div className="h-4 w-1/3 animate-pulse rounded bg-slate-200 dark:bg-slate-700"></div>
        </div>
      </div>
    </div>

  );
}

// -----------------------------
// ERROR HANDLER
// -----------------------------
function TodoErrorComponent({ error, reset }: ErrorComponentProps) {
  const { reset: resetBoundary } = useQueryErrorResetBoundary();

  useEffect(() => {
    resetBoundary();
  }, [resetBoundary]);

  return (
    <div className="p-6">
      <ErrorComponent error={error} reset={reset} />
    </div>
  );
}
