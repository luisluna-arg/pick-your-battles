import { eq, and } from 'drizzle-orm';
import { db } from './connection';
import { users, tasks, type User, type Task, type InsertUser, type InsertTask } from './schema';
import { getTaskCount } from './queries';

// Default task limit (can be made configurable per user in future)
const DEFAULT_TASK_LIMIT = 3;

/**
 * Insert or update user on login
 * Called from Auth.js callbacks
 */
export async function upsertUser(data: InsertUser): Promise<User> {
  const results = await db
    .insert(users)
    .values(data)
    .onConflictDoUpdate({
      target: users.id,
      set: {
        email: data.email,
        name: data.name,
        image: data.image,
      },
    })
    .returning();

  return results[0];
}

/**
 * Create a new task for a user
 * Enforces task limit
 */
export async function createTask(
  userId: string,
  data: Omit<InsertTask, 'userId'>
): Promise<Task> {
  // Check task limit
  const currentCount = await getTaskCount(userId);
  if (currentCount >= DEFAULT_TASK_LIMIT) {
    throw new Error(
      `Task limit reached. You can only have ${DEFAULT_TASK_LIMIT} tasks at a time.`
    );
  }

  const results = await db
    .insert(tasks)
    .values({
      ...data,
      userId,
    })
    .returning();

  return results[0];
}

/**
 * Update a task
 * Verifies task ownership before updating
 */
export async function updateTask(
  taskId: number,
  userId: string,
  data: Partial<Omit<InsertTask, 'userId'>>
): Promise<Task | null> {
  const results = await db
    .update(tasks)
    .set({
      ...data,
      updatedAt: new Date(),
    })
    .where(and(eq(tasks.id, taskId), eq(tasks.userId, userId)))
    .returning();

  return results[0] ?? null;
}

/**
 * Delete a task
 * Verifies task ownership before deleting
 */
export async function deleteTask(
  taskId: number,
  userId: string
): Promise<boolean> {
  const results = await db
    .delete(tasks)
    .where(and(eq(tasks.id, taskId), eq(tasks.userId, userId)))
    .returning();

  return results.length > 0;
}
