import { TodoSchema } from '@/db/schema/todos.schema';
import { fetchTodos, getTodosCount } from '@/serverFns/todos.queries';
import { toolDefinition } from '@tanstack/ai';
import { z } from 'zod';

export const getTodosCountDef = toolDefinition({
  name: 'get_todos_count',
  description: 'Get the number of todos',
  inputSchema: z.object({ query: z.string() }),
  outputSchema: z.number(),
});

export const getTodosCountTool = getTodosCountDef.server(async ({ query }) => {
  return await getTodosCount();
});

export const showTodosDef = toolDefinition({
  name: 'show_todos',
  description: 'list the user todos',
  inputSchema: z.object({ query: z.string() }),
  outputSchema: TodoSchema.array(),
  needsApproval: true,
});

export const showTodosTool = showTodosDef.server(async ({ query }) => {
  return await fetchTodos();
});
