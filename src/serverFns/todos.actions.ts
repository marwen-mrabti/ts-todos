import { createServerFn } from '@tanstack/react-start';
import { eq } from 'drizzle-orm';

import { db } from '@/db';
import {
  insertTodoSchema,
  todoIdSchema,
  todos,
  updateTodoSchema,
} from '@/db/schema/todos.schema';
import { TodoNotFoundError, validateWithPretty } from '@/lib/helpers';
import { serverFnAuthMiddleware } from '@/middleware/auth-middleware';

export const createTodo = createServerFn({ method: 'POST' })
  .middleware([serverFnAuthMiddleware])
  .inputValidator((data) => validateWithPretty(insertTodoSchema, data))
  .handler(async ({ data }) => {
    const { title } = data;
    const result = await db
      .insert(todos)
      .values({ title })
      .returning({ id: todos.id, title: todos.title });
    const todo = result[0];
    if (!todo.id) {
      throw new Error('Failed to create todo');
    }
    return { message: `Created todo with title: ${todo.title}` };
  });

export const updateTodo = createServerFn({ method: 'POST' })
  .middleware([serverFnAuthMiddleware])
  .inputValidator((data) => validateWithPretty(updateTodoSchema, data))
  .handler(async ({ data }) => {
    const { id, ...todoData } = data; // data is fully typed and validated here

    const isTodoInDb = await db.query.todos.findFirst({
      where: eq(todos.id, id),
    });

    if (!isTodoInDb) {
      throw new TodoNotFoundError(`todo with id "${id}" not found!`); // when using it via an api route => this will return a 404 with the message
      // throw notFound(); // when using it as a mutationFn for useMutation => this will navigate to the 404 page
    }

    const result = await db
      .update(todos)
      .set(todoData)
      .where(eq(todos.id, id))
      .returning({ id: todos.id });
    const todo = result[0];
    if (!todo.id) {
      throw new Error('Failed to update todo');
    }
    return { message: `Updated todo with id: ${id}` };
  });

export const deleteTodo = createServerFn({ method: 'POST' })
  .middleware([serverFnAuthMiddleware])
  .inputValidator((data) => validateWithPretty(todoIdSchema, data))
  .handler(async ({ data }) => {
    const id = data; // data is fully typed and validated here

    const todo = await db.query.todos.findFirst({
      where: eq(todos.id, id),
    });

    if (!todo) {
      throw new TodoNotFoundError(`todo with id "${id}" not found!`);
    }

    await db.delete(todos).where(eq(todos.id, id));
    // return { message: `Deleted todo with id: ${id}` };
    await new Promise((resolve) => setTimeout(resolve, 5000));
    throw new Error('Failed to delete todo');
  });
