import { eq, and, asc, ne } from 'drizzle-orm';
import { db } from './connection';
import { users, tasks, type User, type Task } from './schema';

/**
 * Get user profile by ID
 * Returns user data including maxTasks configuration
 */
export async function getUserProfile(userId: string, email?: string): Promise<User | null> {
  const byId = await db
    .select()
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  if (byId[0]) return byId[0];

  // Fallback: look up by email in case the user's OAuth ID changed
  if (email) {
    const byEmail = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);
    return byEmail[0] ?? null;
  }

  return null;
}

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
 * Get the count of active (non-completed) tasks for a user
 * Used for enforcing task limits
 * Note: Completed tasks are excluded from the count
 */
export async function getTaskCount(userId: string): Promise<number> {
  const results = await db
    .select()
    .from(tasks)
    .where(and(eq(tasks.userId, userId), ne(tasks.status, 'completed')));

  return results.length;
}
