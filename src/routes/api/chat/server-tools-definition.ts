import { TodoSchema } from '@/db/schema/todos.schema';
import { fetchTodos, getTodosCount } from '@/serverFns/todos.queries';
import { toolDefinition } from '@tanstack/ai';
import { z } from 'zod';

export const getTodosCountDef = toolDefinition({
  name: 'get_todos_count',
  inputSchema: z.object({ query: z.string() }),
  outputSchema: z.number(),
  description: 'Get the number of todos',
});

export const getTodosCountTool = getTodosCountDef.server(async ({ query }) => {
  return await getTodosCount();
});

export const showTodosDef = toolDefinition({
  name: 'show_todos',
  inputSchema: z.object({ query: z.string() }),
  outputSchema: TodoSchema.array(),
  description: 'list the user todos',
});

export const showTodosTool = showTodosDef.server(async ({ query }) => {
  return await fetchTodos();
});
