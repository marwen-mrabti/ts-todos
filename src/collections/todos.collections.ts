import { createTodo, fetchTodos } from '@/db/queries/todos.queries';
import { TodoSchema } from '@/db/schema/todos.schema';
import { queryCollectionOptions } from '@tanstack/query-db-collection';
import { createCollection } from '@tanstack/react-db';
import { QueryClient } from '@tanstack/react-query';

const queryClient = new QueryClient();

// Define a collection that loads data using TanStack Query
export const todosCollection = createCollection(
  queryCollectionOptions({
    queryClient,
    queryKey: ['todos'],
    queryFn: async () => await fetchTodos(),

    getKey: (item) => item.id,
    schema: TodoSchema,

    // Handle mutations
    onInsert: async ({ transaction }) => {
      const { changes: newTodo } = transaction.mutations[0];

      const response = await createTodo({ data: newTodo });
      return response;
    },

    onUpdate: async ({ transaction }) => {
      const { original, changes } = transaction.mutations[0];

      const response = await fetch(`/api/todos/${original.id}/edit`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(changes),
      });

      return response.json();
    },

    onDelete: async ({ transaction }) => {
      const { original } = transaction.mutations[0];
      console.log(original);
      await fetch(`/api/todos/${original.id}`, {
        method: 'DELETE',
      });
    },

    syncMode: 'on-demand',
  })
);
