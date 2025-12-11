import { queryOptions, type QueryClient } from '@tanstack/react-query';

import type { TODO, TodoId } from '@/db/schema/todos.schema';
import { fetchTodoById, fetchTodos } from '@/serverFns/todos.queries';

export const todosQueryOptions = () =>
  queryOptions({
    queryKey: ['todos'],
    queryFn: () => fetchTodos(),
  });

export const todoQueryOptions = ({
  todoId,
  queryClient,
}: {
  todoId: TodoId;
  queryClient: QueryClient;
}) => {
  return queryOptions({
    queryKey: ['todo', { todoId }],
    queryFn: () => fetchTodoById({ data: todoId }),
    enabled: Boolean(todoId),
    initialData: () => {
      const todos = queryClient.getQueryData(['todos']) as TODO[] | undefined;
      return todos?.find((t) => t.id === todoId);
    },
    initialDataUpdatedAt: () => {
      const todosState = queryClient.getQueryState(['todos']);
      return todosState?.dataUpdatedAt;
    },
    staleTime: 0,
  });
};
