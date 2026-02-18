import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { updateUserProfile } from '@/lib/db/mutations';

export async function PATCH(request: Request) {
  try {
    // Get authenticated user
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse request body
    const body = await request.json();
    const { displayName, maxTasks } = body;

    // Validate input
    if (displayName !== undefined) {
      if (typeof displayName !== 'string') {
        return NextResponse.json(
          { error: 'Display name must be a string' },
          { status: 400 }
        );
      }
      if (displayName.length > 50) {
        return NextResponse.json(
          { error: 'Display name must be 50 characters or less' },
          { status: 400 }
        );
      }
    }

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
      displayName,
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
