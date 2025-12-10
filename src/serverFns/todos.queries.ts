import { createServerFn } from '@tanstack/react-start';
import { eq } from 'drizzle-orm';

import { db } from '@/db';
import { todoIdSchema, todos } from '@/db/schema/todos.schema';
import { serverFnAuthMiddleware } from '@/middleware/auth-middleware';
import { notFound } from '@tanstack/react-router';

export const fetchTodos = createServerFn({ method: 'GET' })
  .middleware([serverFnAuthMiddleware])
  .handler(async () => {
    const allTodos = await db.query.todos.findMany({});

    return allTodos;
  });

export const fetchTodoById = createServerFn({ method: 'GET' })
  .middleware([serverFnAuthMiddleware])
  .inputValidator(todoIdSchema)
  .handler(async ({ data }) => {
    const id = data;

    const todo = await db.query.todos.findFirst({
      where: eq(todos.id, id),
    });

    if (!todo) {
      throw notFound();
    }

    return todo;
  });
