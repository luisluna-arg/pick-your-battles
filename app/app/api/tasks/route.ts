import { NextRequest, NextResponse } from 'next/server';
import { resolveUserProfile } from '@/lib/auth';
import { getUserTasks } from '@/lib/db/queries';
import { createTask } from '@/lib/db/mutations';

/**
 * GET /api/tasks
 * List all tasks for the authenticated user
 */
export async function GET() {
  try {
    const profile = await resolveUserProfile();
    if (!profile) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const tasks = await getUserTasks(profile.id);
    return NextResponse.json(tasks, { status: 200 });
  } catch (error) {
    console.error('Error fetching tasks:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/tasks
 * Create a new task for the authenticated user
 */
export async function POST(request: NextRequest) {
  try {
    const profile = await resolveUserProfile();
    if (!profile) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();

    // Validate required fields
    if (!body.title || typeof body.title !== 'string') {
      return NextResponse.json(
        { error: 'Title is required and must be a string' },
        { status: 400 }
      );
    }

    if (body.position === undefined || typeof body.position !== 'number') {
      return NextResponse.json(
        { error: 'Position is required and must be a number' },
        { status: 400 }
      );
    }

    // Create task using canonical DB user ID
    const task = await createTask(profile.id, {
      title: body.title,
      description: body.description || null,
      position: body.position,
      status: body.status || 'pending',
    });

    return NextResponse.json(task, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.message.includes('Task limit reached')) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    console.error('Error creating task:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
