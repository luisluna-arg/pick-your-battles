import { auth } from "@/auth"
import type { Session } from "next-auth"

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
