import { boolean, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';
import {
  createInsertSchema,
  createSelectSchema,
  createUpdateSchema,
} from 'drizzle-zod';
import { z } from 'zod';

export const todos = pgTable('todos', {
  id: uuid('id')
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  title: text('title').notNull(),
  isCompleted: boolean().notNull().default(false),
  createdAt: timestamp('created_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdateFn(() => new Date()),
});

export const TodoSchema = createSelectSchema(todos);
export const insertTodoSchema = createInsertSchema(todos, {
  title: z.string().min(5, 'post title must be at least 5 characters'),
  isCompleted: z.boolean().catch(false),
}).omit({ id: true, createdAt: true, updatedAt: true, isCompleted: true });
export const updateTodoSchema = createUpdateSchema(todos, {
  id: z.uuid('Invalid UUID format for todo ID'),
  title: z
    .string()
    .min(5, 'post title must be at least 5 characters')
    .optional(),
  isCompleted: z.boolean().catch(false).optional(),
}).omit({ createdAt: true, updatedAt: true });

export const todoIdSchema = z.uuid('Invalid UUID format for todo ID');

export const todoCollectionSchema = z.object({
  id: z.string().uuid(),
  title: z.string(),
  isCompleted: z.boolean(),
  // Simple transform - no union needed
  createdAt: z.string().transform((val) => new Date(val)),
  updatedAt: z.string().transform((val) => new Date(val)),
});

export type TODO = z.infer<typeof TodoSchema>;
export type InsertTodo = z.infer<typeof insertTodoSchema>;
export type UpdateTodo = z.infer<typeof updateTodoSchema>;
export type TodoId = z.infer<typeof todoIdSchema>;
export type TodoCollection = z.infer<typeof todoCollectionSchema>;
