import { TodoSchema } from '@/db/schema/todos.schema';
import {
  createTodo,
  deleteTodo,
  fetchTodos,
  updateTodo,
} from '@/serverFns/todos.queries';
import { queryCollectionOptions } from '@tanstack/query-db-collection';
import { createCollection } from '@tanstack/react-db';
import { QueryClient } from '@tanstack/react-query';

const queryClient = new QueryClient();

// Define a collection that loads data using TanStack Query
export const todosCollection = createCollection(
  queryCollectionOptions({
    queryKey: ['todos'],
    syncMode: 'on-demand',
    queryClient,
    schema: TodoSchema,

    queryFn: async () => await fetchTodos(),
    getKey: (item) => item.id,

    // Handle mutations
    onInsert: async ({ transaction }) => {
      const { changes: newTodo } = transaction.mutations[0];
      return await createTodo({ data: newTodo });
    },

    onUpdate: async ({ transaction }) => {
      const updates = transaction.mutations.map((m) => ({
        id: m.key,
        changes: m.changes,
      }));
      return await updateTodo({
        data: { id: updates[0].id, ...updates[0].changes },
      });
    },

    onDelete: async ({ transaction }) => {
      const { original } = transaction.mutations[0];
      return await deleteTodo({ data: original.id });
    },
  })
);
