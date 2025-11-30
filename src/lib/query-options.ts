import { queryOptions } from '@tanstack/react-query';

import { fetchTodoById, fetchTodos } from '@/db/queries/todos';
import type { TodoId } from '@/db/schema/todos';

export const todosQueryOptions = () =>
  queryOptions({
    queryKey: ['todos'],
    queryFn: () => fetchTodos(),
  });

export const todoQueryOptions = ({ todoId }: { todoId: TodoId }) =>
  queryOptions({
    queryKey: ['todo', { todoId }],
    queryFn: () => fetchTodoById({ data: todoId }),
    enabled: Boolean(todoId),
  });
