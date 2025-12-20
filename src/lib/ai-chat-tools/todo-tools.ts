import { todosQuerySchema } from '@/lib/query-options';
import { TodoSchema } from '@/server/db/schema/todos.schema';
import { fetchTodos, getTodosCount } from '@/server/todos.queries';
import { toolDefinition } from '@tanstack/ai';
import { z } from 'zod';

export const getTodosCountDef = toolDefinition({
  name: 'get_todos_count',
  description: 'Get the number of todos',
  inputSchema: z.object({ }),
  outputSchema: z.number(),
});
export const getTodosCountTool = getTodosCountDef.server(async ({ }) => {
  return await getTodosCount();
});

export const showTodosDef = toolDefinition({
  name: 'show_todos',
  description: 'list the user todos',
  inputSchema: todosQuerySchema,
  outputSchema: z.array(
   TodoSchema.omit({
    createdAt: true,
    updatedAt: true,
   })
  ),
  needsApproval: false,
});
export const showTodosTool = showTodosDef.server(async ( data ) => {
  const todos = await fetchTodos({ data })
  return todos
});


export const saveToLocalStorageDef = toolDefinition({
  name: 'save_to_local_storage',
  description: 'Save data to browser local storage',
  inputSchema: z.object({
    key: z.string().describe('Storage key'),
    value: z.string().describe('Value to store'),
  }),
  outputSchema: z.object({
    saved: z.boolean(),
  }),
});
export const saveToLocalStorage = saveToLocalStorageDef.client((input) => {
  localStorage.setItem(input.key, input.value);
  return { saved: true };
});
