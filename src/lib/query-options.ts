import {
  keepPreviousData,
  queryOptions,
  type QueryClient,
} from '@tanstack/react-query';

import type { TODO, TodoId } from '@/server/db/schema/todos.schema';
import { fetchTodoById, fetchTodos } from '@/server/todos.queries';
import { z } from 'zod';

export const todosQueryOptions = (searchParams: TodosQuery) =>
  queryOptions({
    queryKey: ['todos', { ...searchParams }],
    queryFn: () => fetchTodos({ data: searchParams }),
    placeholderData: keepPreviousData,
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

// Define options
export const orderByOptions = [
  { value: 'title', label: 'Title' },
  { value: 'createdAt', label: 'Created' },
  { value: 'updatedAt', label: 'Updated' },
] as const;

export const directionOptions = [
  { value: 'asc', label: '↑' },
  { value: 'desc', label: '↓' },
] as const;

export const statusOptions = [
  { value: 'all', label: 'All' },
  { value: 'completed', label: 'Completed' },
  { value: 'pending', label: 'Pending' },
] as const;

// Derive schema from options
export const todosQuerySchema = z.object({
  query: z.string().optional(),
  status: z
    .enum([
      statusOptions[0].value,
      statusOptions[1].value,
      statusOptions[2].value,
    ])
    .optional(),
  orderBy: z
    .enum([
      orderByOptions[0].value,
      orderByOptions[1].value,
      orderByOptions[2].value,
    ])
    .optional()
    .default('createdAt'),
  direction: z
    .enum([directionOptions[0].value, directionOptions[1].value])
    .optional()
    .default('desc'),
  page: z.coerce.number().optional().default(1),
});

export type TodosQuery = z.infer<typeof todosQuerySchema>;
