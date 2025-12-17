import { toolDefinition } from '@tanstack/ai';
import { z } from 'zod';

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
