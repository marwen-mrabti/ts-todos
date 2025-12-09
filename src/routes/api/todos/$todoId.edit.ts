import { updateTodoSchema } from '@/db/schema/todos.schema';
import { authMiddleware } from '@/middleware/auth-middleware';
import { updateTodo } from '@/serverFns/todos.queries';
import { createFileRoute } from '@tanstack/react-router';
import { z } from 'zod';

export const Route = createFileRoute('/api/todos/$todoId/edit')({
  server: {
    middleware: [authMiddleware],
    handlers: ({ createHandlers }) =>
      createHandlers({
        PATCH: {
          middleware: [], // Runs after authMiddleware, only for DELETE
          handler: async ({ request, context, params }) => {
            const { todoId } = params;
            const body = await request.json();

            const parsed = updateTodoSchema.safeParse({
              id: todoId,
              ...body,
            });
            if (!parsed.success) {
              const error = z.prettifyError(parsed.error);
              return new Response(JSON.stringify({ error }), { status: 400 });
            }

            try {
              const result = await updateTodo({ data: parsed.data });

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
