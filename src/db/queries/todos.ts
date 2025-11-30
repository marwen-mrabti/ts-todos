import { createServerFn } from '@tanstack/react-start';
import { eq } from 'drizzle-orm';

import { db } from '@/db';
import { insertTodoSchema, todoIdSchema, todos } from '@/db/schema/todos';

export class TodoNotFoundError extends Error {}

export const fetchTodos = createServerFn({ method: 'GET' }).handler(
  async () => {
    const allTodos = await db.query.todos.findMany({});
    return allTodos;
  }
);

export const fetchTodoById = createServerFn({ method: 'GET' })
  .inputValidator(todoIdSchema)
  .handler(async ({ data }) => {
    const id = data; // data is fully typed and validated here

    const todo = await db.query.todos.findFirst({
      where: eq(todos.id, id),
    });

    if (!todo) {
      throw new TodoNotFoundError(`todo with id "${id}" not found!`);
    }

    return todo;
  });

export const createTodo = createServerFn({ method: 'POST' })
  .inputValidator(insertTodoSchema)
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

export const deleteTodo = createServerFn()
  .inputValidator(todoIdSchema)
  .handler(async ({ data }) => {
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
