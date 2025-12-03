import { createServerFn } from '@tanstack/react-start';
import { eq } from 'drizzle-orm';

import { db } from '@/db';
import { insertTodoSchema, todoIdSchema, todos } from '@/db/schema/todos';
import { TodoNotFoundError, validateWithPretty } from '@/lib/helpers';
import { authMiddleware } from '@/middleware/auth-middleware';
import { notFound } from '@tanstack/react-router';

export const fetchTodos = createServerFn({ method: 'GET' })
  .middleware([authMiddleware])
  .handler(async () => {
    const allTodos = await db.query.todos.findMany({});

    return allTodos;
  });

export const fetchTodoById = createServerFn({ method: 'GET' })
  .middleware([authMiddleware])
  .inputValidator(todoIdSchema)
  .handler(async ({ data }) => {
    const id = data; // data is fully typed and validated here

    const todo = await db.query.todos.findFirst({
      where: eq(todos.id, id),
    });

    if (!todo) {
      throw notFound();
    }

    await new Promise((resolve) => setTimeout(resolve, 5000));

    return todo;
  });

export const createTodo = createServerFn({ method: 'POST' })
  .middleware([authMiddleware])
  .inputValidator((data) => validateWithPretty(insertTodoSchema, data))
  .handler(async ({ data }) => {
    const { title } = data; // data is fully typed and validated here
    const result = await db
      .insert(todos)
      .values({ title })
      .returning({ id: todos.id });
    const todo = result[0];
    if (!todo.id) {
      throw new Error('Failed to create todo');
    }
    return { message: `Created todo with title: ${title}` };
  });

export const deleteTodo = createServerFn({ method: 'POST' })
  .middleware([authMiddleware])
  .inputValidator((data) => validateWithPretty(todoIdSchema, data))
  .handler(async ({ data, context }) => {
    const id = data; // data is fully typed and validated here

    const todo = await db.query.todos.findFirst({
      where: eq(todos.id, id),
    });

    if (!todo) {
      throw new TodoNotFoundError(`todo with id "${id}" not found!`);
    }

    await db.delete(todos).where(eq(todos.id, id));
    return { message: `Deleted todo with id: ${id}` };
  });
