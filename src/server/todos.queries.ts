import { createServerFn } from '@tanstack/react-start';
import { and, asc, count, desc, eq, ilike } from 'drizzle-orm';

import { validateWithPretty } from '@/lib/helpers';
import { todosQuerySchema } from '@/lib/query-options';
import { serverFnAuthMiddleware } from '@/middleware/auth-middleware';
import { db } from '@/server/db';
import { todoIdSchema, todos } from '@/server/db/schema/todos.schema';
import { notFound } from '@tanstack/react-router';

export const fetchTodos = createServerFn({ method: 'GET' })
  .middleware([serverFnAuthMiddleware])
  .inputValidator((data) => validateWithPretty(todosQuerySchema, data))
  .handler(async ({ data }) => {
    // build where conditions
    const conditions = [];
    if (data.query) {
      conditions.push(ilike(todos.title, `%${data.query}%`));
    }

    if (data.status === 'completed') {
      conditions.push(eq(todos.isCompleted, true));
    } else if (data.status === 'pending') {
      conditions.push(eq(todos.isCompleted, false));
    }

    // build order by
    const orderByMap = {
      createdAt: todos.createdAt,
      updatedAt: todos.updatedAt,
      title: todos.title,
    } as const;
    const orderBy = data.orderBy
      ? data.direction === 'desc'
        ? desc(orderByMap[data.orderBy])
        : asc(orderByMap[data.orderBy])
      : undefined;

    // build pagination
    const limit = data.page ? 10 : undefined;
    const offset = data.page && limit ? (data.page - 1) * limit : 0;

    const allTodos = await db.query.todos.findMany({
      where: conditions.length > 0 ? and(...conditions) : undefined,
      orderBy,
      offset,
      limit,
    });

    return allTodos;
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

export const getTodosCount = createServerFn({ method: 'GET' })
  .middleware([serverFnAuthMiddleware])
  .handler(async () => {
    const todosCount = await db.select({ count: count() }).from(todos);
    return todosCount[0].count;
  });
