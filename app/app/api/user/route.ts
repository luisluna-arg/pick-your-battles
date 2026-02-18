import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { updateUserProfile } from '@/lib/db/mutations';
import { getUserProfile } from '@/lib/db/queries';

/**
 * GET /api/user
 * Returns the authenticated user's profile including maxTasks
 */
export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const profile = await getUserProfile(user.id!);
    if (!profile) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json(profile, { status: 200 });
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/user
 *
 * Update the authenticated user's profile settings.
 *
 * Request Body:
 * {
 *   maxTasks?: number      // Maximum concurrent tasks (integer, range 1-10)
 * }
 *
 * Responses:
 * - 200: Success - returns updated user object
 * - 400: Bad Request - invalid input (type error, out of range, too long)
 * - 401: Unauthorized - user not authenticated
 * - 404: Not Found - user doesn't exist in database
 * - 500: Internal Server Error - unexpected error
 *
 * Security:
 * - Requires authentication (session-based via Auth.js)
 * - Users can only update their own profile
 * - Input validation prevents SQL injection and XSS
 * - Rate limiting handled by Vercel infrastructure
 */
export async function PATCH(request: Request) {
  try {
    // Get authenticated user
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse request body
    const body = await request.json();
    const { maxTasks } = body;

    // Validate input
    if (maxTasks !== undefined) {
      if (typeof maxTasks !== 'number' || !Number.isInteger(maxTasks)) {
        return NextResponse.json(
          { error: 'Max tasks must be an integer' },
          { status: 400 }
        );
      }
      if (maxTasks < 1 || maxTasks > 10) {
        return NextResponse.json(
          { error: 'Max tasks must be between 1 and 10' },
          { status: 400 }
        );
      }
    }

    // Update user profile
    const updatedUser = await updateUserProfile(user.id!, {
      maxTasks,
    });

    if (!updatedUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json(updatedUser, { status: 200 });
  } catch (error) {
    console.error('Error updating user profile:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
