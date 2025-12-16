import { createServerFn } from '@tanstack/react-start';
import { count, eq } from 'drizzle-orm';

import { db } from '@/db';
import { todoIdSchema, todos } from '@/db/schema/todos.schema';
import { validateWithPretty } from '@/lib/helpers';
import { serverFnAuthMiddleware } from '@/middleware/auth-middleware';
import { notFound } from '@tanstack/react-router';

export const fetchTodos = createServerFn({ method: 'GET' })
  .middleware([serverFnAuthMiddleware])
  .handler(async () => {
    const allTodos = await db.query.todos.findMany({});

    return allTodos;
  });

export const getTodosCount = createServerFn({ method: 'GET' })
  .middleware([serverFnAuthMiddleware])
  .handler(async () => {
    const todosCount = await db
      .select({ todosCount: count(todos.id) })
      .from(todos);
    return todosCount[0]?.todosCount ?? 0;
  });

export const fetchTodoById = createServerFn({ method: 'GET' })
  .middleware([serverFnAuthMiddleware])
  .inputValidator((data) => validateWithPretty(todoIdSchema, data))
  .handler(async ({ data: todoId }) => {
    const todo = await db.query.todos.findFirst({
      where: eq(todos.id, todoId),
    });

    if (!todo) {
      throw notFound();
    }

    return todo;
  });
