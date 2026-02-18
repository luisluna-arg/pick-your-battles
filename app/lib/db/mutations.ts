import { eq, and } from 'drizzle-orm';
import { db } from './connection';
import { users, tasks, type User, type Task, type InsertUser, type InsertTask } from './schema';
import { getTaskCount, getUserProfile } from './queries';

/**
 * Insert or update user on login
 * Called from Auth.js callbacks
 */
export async function upsertUser(data: InsertUser): Promise<User> {
  const results = await db
    .insert(users)
    .values({
      ...data,
      maxTasks: data.maxTasks ?? 3,
    })
    .onConflictDoUpdate({
      target: users.id,
      set: {
        email: data.email,
        name: data.name,
        image: data.image,
        // Do NOT update maxTasks on subsequent logins
      },
    })
    .returning();

  return results[0];
}

/**
 * Create a new task for a user
 * Enforces user's personal task limit
 */
export async function createTask(
  userId: string,
  data: Omit<InsertTask, 'userId'>,
  email?: string
): Promise<Task> {
  // Get user profile to check their personal task limit
  const user = await getUserProfile(userId, email);
  if (!user) {
    throw new Error('User not found');
  }

  // Check user's personal task limit
  const currentCount = await getTaskCount(userId);
  if (currentCount >= user.maxTasks) {
    throw new Error(
      `Task limit reached. You can only have ${user.maxTasks} tasks at a time.`
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

/**
 * Update user profile settings
 * Allows updating maxTasks
 */
export async function updateUserProfile(
  userId: string,
  data: { maxTasks?: number }
): Promise<User | null> {
  // Validate maxTasks if provided (must be >= 1 and <= 10)
  if (data.maxTasks !== undefined && (data.maxTasks < 1 || data.maxTasks > 10)) {
    throw new Error('Max tasks must be between 1 and 10');
  }

  const updateData: Partial<User> = {};
  if (data.maxTasks !== undefined) {
    updateData.maxTasks = data.maxTasks;
  }

  const results = await db
    .update(users)
    .set(updateData)
    .where(eq(users.id, userId))
    .returning();

  return results[0] ?? null;
}
