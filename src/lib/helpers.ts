import { createIsomorphicFn } from '@tanstack/react-start';
import { z } from 'zod';
export function validateWithPretty<T>(schema: z.ZodType<T>, value: unknown): T {
  const result = schema.safeParse(value);

  if (!result.success) {
    // Prettify the error
    const error = z.prettifyError(result.error);

    throw new Error(error);
  }

  return result.data;
}

export class TodoNotFoundError extends Error {
  readonly code = 'TODO_NOT_FOUND';

  constructor(message: string) {
    super(message);
    this.name = 'TodoNotFoundError';
    Object.setPrototypeOf(this, TodoNotFoundError.prototype);
  }
}

export const removeDataFromLocalStorage = createIsomorphicFn().client(
  (keys: string[]) => {
    for (const key of keys) {
      localStorage.removeItem(key);
    }
  }
);
