import { pgTable, text, serial, integer, timestamp } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Users table - stores Auth.js user data
export const users = pgTable('users', {
  id: text('id').primaryKey(), // Matches Auth.js session user ID
  email: text('email').notNull().unique(),
  name: text('name'),
  image: text('image'), // Profile picture URL
  maxTasks: integer('max_tasks').notNull().default(3), // User's personal task limit
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Tasks table - stores user tasks
export const tasks = pgTable('tasks', {
  id: serial('id').primaryKey(),
  userId: text('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  description: text('description'),
  status: text('status').notNull().default('pending'), // 'pending', 'in-progress', 'completed'
  position: integer('position').notNull(), // For ordering tasks (1, 2, 3)
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Define relations
export const usersRelations = relations(users, ({ many }) => ({
  tasks: many(tasks),
}));

export const tasksRelations = relations(tasks, ({ one }) => ({
  user: one(users, {
    fields: [tasks.userId],
    references: [users.id],
  }),
}));

// Export types
export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
export type Task = typeof tasks.$inferSelect;
export type InsertTask = typeof tasks.$inferInsert;
