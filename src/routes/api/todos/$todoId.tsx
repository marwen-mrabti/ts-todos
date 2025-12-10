import { todoIdSchema } from '@/db/schema/todos.schema';
import { authMiddleware } from '@/middleware/auth-middleware';
import { deleteTodo } from '@/serverFns/todos.actions';
import { createFileRoute } from '@tanstack/react-router';
import { z } from 'zod';

export const Route = createFileRoute('/api/todos/$todoId')({
  server: {
    middleware: [authMiddleware],
    handlers: ({ createHandlers }) =>
      createHandlers({
        DELETE: {
          middleware: [], // Runs after authMiddleware, only for DELETE
          handler: async ({ request, context, params }) => {
            const { todoId } = params;

            const parsed = todoIdSchema.safeParse(todoId);
            if (!parsed.success) {
              const error = z.prettifyError(parsed.error);
              return new Response(JSON.stringify({ error }), { status: 400 });
            }

            try {
              const result = await deleteTodo({ data: parsed.data });

              return new Response(JSON.stringify(result), { status: 200 });
            } catch (e: any) {
              return new Response(JSON.stringify({ error: e.message }), {
                status: 500,
              });
            }
          },
        },
      }),
  },
});
