import { boolean, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
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

export const todoIdSchema = z.uuid('Invalid UUID format for todo ID');

export type TODO = z.infer<typeof TodoSchema>;
export type InsertTodo = z.infer<typeof insertTodoSchema>;
export type TodoId = z.infer<typeof todoIdSchema>;
