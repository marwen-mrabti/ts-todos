import { todosQuerySchema } from '@/lib/query-options';
import { insertTodoSchema, TodoSchema } from '@/server/db/schema/todos.schema';
import { createTodo } from '@/server/todos.actions';
import { fetchTodos, getTodosCount } from '@/server/todos.queries';
import { toolDefinition } from '@tanstack/ai';
import { z } from 'zod';

// server tools
export const getTodosCountDef = toolDefinition({
  name: 'get_todos_count',
  description: 'Get the number of todos',
  inputSchema: z.object({}),
  outputSchema: z.number().catch(0),
});
export const getTodosCountTool = getTodosCountDef.server(async () => {
  return await getTodosCount();
});

export const getTodosDef = toolDefinition({
  name: 'get_todos',
  description: 'Get the todos list.',
  inputSchema: todosQuerySchema,
  outputSchema: z.array(
    TodoSchema.omit({
      createdAt: true,
      updatedAt: true,
    })
  ),
  needsApproval: false,
});
export const getTodosTool = getTodosDef.server(async (data) => {
  const todos = await fetchTodos({ data });
  return todos;
});

export const addTodoDef = toolDefinition({
  name: 'add_todo',
  description: 'Add a new todo',
  inputSchema: insertTodoSchema,
  outputSchema: z.object({
    message: z.string(),
  }),
});
export const addTodoTool = addTodoDef.server(async (data) => {
  return await createTodo({ data });
});

//client tools
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
