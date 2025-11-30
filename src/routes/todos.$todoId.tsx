import {
  useQueryErrorResetBoundary,
  useSuspenseQuery,
} from '@tanstack/react-query';
import type { ErrorComponentProps } from '@tanstack/react-router';
import { createFileRoute, notFound } from '@tanstack/react-router';
import { useEffect } from 'react';

import ErrorComponent from '@/components/error-component';
import { TodoNotFoundError } from '@/db/queries/todos';
import { todoQueryOptions } from '@/lib/query-options';

export const Route = createFileRoute('/todos/$todoId')({
  loader: async ({ params: { todoId }, context: { queryClient } }) => {
    return queryClient.ensureQueryData(todoQueryOptions({ todoId }));
  },
  component: RouteComponent,
  pendingComponent: TodoPendingComponent,
  errorComponent: TodoErrorComponent,
});

function RouteComponent() {
  const { todoId } = Route.useParams();
  const { data: todo } = useSuspenseQuery(todoQueryOptions({ todoId }));

  return (
    <div className="w-full">
      <div className="p-4">
        <h2 className="mb-4 text-2xl font-bold">Todo Details</h2>
        <p>
          <strong>ID:</strong> {todo.id}
        </p>
        <p>
          <strong>Title:</strong> {todo.title}
        </p>
        <p>
          <strong>Completed:</strong> {todo.isCompleted ? 'Yes' : 'No'}
        </p>
      </div>
    </div>
  );
}

function TodoPendingComponent() {
  return (
    <div className="flex w-full items-center justify-center">
      <p className="text-primary text-xl">Loading...</p>
    </div>
  );
}

function TodoErrorComponent({ error, reset }: ErrorComponentProps) {
  if (error instanceof TodoNotFoundError) {
    return notFound();
  }
  const queryErrorResetBoundary = useQueryErrorResetBoundary();

  useEffect(() => {
    queryErrorResetBoundary.reset();
  }, [queryErrorResetBoundary]);

  return (
    <div>
      <ErrorComponent error={error} reset={reset} />
    </div>
  );
}
