import { db } from '@/db';
import { authMiddleware } from '@/middleware/auth-middleware';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/api/todos/')({
  server: {
    middleware: [authMiddleware],
    handlers: ({ createHandlers }) =>
      createHandlers({
        GET: {
          handler: async () => {
            const allTodos = await db.query.todos.findMany({});
            return new Response(JSON.stringify(allTodos));
          },
        },

        POST: {
          handler: async ({}) => {
            return new Response(
              JSON.stringify({ message: 'Create todo not implemented' })
            );
          },
        },
      }),
  },
});
