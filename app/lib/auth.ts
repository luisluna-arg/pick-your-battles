import { auth } from "@/auth"
import type { Session } from "next-auth"
import { getUserProfile } from '@/lib/db/queries';
import { upsertUser } from '@/lib/db/mutations';
import type { User } from '@/lib/db/schema';

/**
 * Get the current session on the server-side
 */
export async function getSession() {
  return await auth()
}

/**
 * Session with guaranteed user and user ID
 */
export type AuthenticatedSession = Session & {
  user: NonNullable<Session['user']> & { id: string }
}

/**
 * Get the current user or throw an error if not authenticated
 * Returns a session with guaranteed user object and user ID
 */
export async function requireAuth(): Promise<AuthenticatedSession> {
  const session = await getSession()

  if (!session?.user?.id) {
    throw new Error("Unauthorized: User must be authenticated")
  }

  return session as AuthenticatedSession
}

/**
 * Get the current user object
 */
export async function getCurrentUser() {
  const session = await getSession()
  return session?.user ?? null
}

/**
 * Resolve the canonical user profile from the current session.
 * Handles OAuth ID rotation by falling back to email lookup.
 * Creates a new user record if none exists yet.
 * Returns null if the user is not authenticated.
 */
export async function resolveUserProfile(): Promise<User | null> {
  const user = await getCurrentUser();
  if (!user?.id || !user?.email) return null;

  let profile = await getUserProfile(user.id, user.email);
  if (!profile) {
    profile = await upsertUser({
      id: user.id,
      email: user.email,
      name: user.name ?? null,
      image: user.image ?? null,
    });
  }
  return profile;
}
