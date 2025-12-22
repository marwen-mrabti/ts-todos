import { TodoSchema } from "@/server/db/schema/todos.schema";
import { createTodo, deleteTodo, updateTodo } from "@/server/todos.actions";
import { fetchTodos } from "@/server/todos.queries";
import {
  parseLoadSubsetOptions,
  queryCollectionOptions,
} from "@tanstack/query-db-collection";
import { createCollection } from "@tanstack/react-db";
import { QueryClient } from "@tanstack/react-query";

const queryClient = new QueryClient();

// Define a collection that loads data using TanStack Query
export const todosCollection = createCollection(
  queryCollectionOptions({
    queryKey: ["todos"],
    syncMode: "eager",
    queryClient,
    schema: TodoSchema,

    queryFn: async (ctx) => {
      const _options = parseLoadSubsetOptions(ctx.meta?.loadSubsetOptions);
      // console.log(_options);
      return await fetchTodos({ data: {} });
    },
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
  }),
);
