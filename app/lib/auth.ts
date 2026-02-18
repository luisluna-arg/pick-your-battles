import { auth } from "@/auth"

/**
 * Get the current session on the server-side
 */
export async function getSession() {
  return await auth()
}

/**
 * Get the current user or throw an error if not authenticated
 */
export async function requireAuth() {
  const session = await getSession()

  if (!session?.user) {
    throw new Error("Unauthorized: User must be authenticated")
  }

  return session
}

/**
 * Get the current user object
 */
export async function getCurrentUser() {
  const session = await getSession()
  return session?.user ?? null
}
