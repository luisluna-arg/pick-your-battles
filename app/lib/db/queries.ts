import { eq, and, asc } from 'drizzle-orm';
import { db } from './connection';
import { tasks, type Task } from './schema';

/**
 * Get all tasks for a specific user, ordered by position
 */
export async function getUserTasks(userId: string): Promise<Task[]> {
  return await db
    .select()
    .from(tasks)
    .where(eq(tasks.userId, userId))
    .orderBy(asc(tasks.position));
}

/**
 * Get a specific task by ID, ensuring it belongs to the user
 */
export async function getTaskById(
  taskId: number,
  userId: string
): Promise<Task | null> {
  const results = await db
    .select()
    .from(tasks)
    .where(and(eq(tasks.id, taskId), eq(tasks.userId, userId)))
    .limit(1);

  return results[0] ?? null;
}

/**
 * Get the count of tasks for a user
 * Used for enforcing task limits
 */
export async function getTaskCount(userId: string): Promise<number> {
  const results = await db
    .select()
    .from(tasks)
    .where(eq(tasks.userId, userId));

  return results.length;
}
