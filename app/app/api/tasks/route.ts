import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { getUserTasks } from '@/lib/db/queries';
import { createTask } from '@/lib/db/mutations';

/**
 * GET /api/tasks
 * List all tasks for the authenticated user
 */
export async function GET() {
  try {
    const session = await requireAuth();
    const tasks = await getUserTasks(session.user.id);

    return NextResponse.json(tasks, { status: 200 });
  } catch (error) {
    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

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
    const session = await requireAuth();
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

    // Create task
    const task = await createTask(session.user.id, {
      title: body.title,
      description: body.description || null,
      position: body.position,
      status: body.status || 'pending',
    }, session.user.email ?? undefined);

    return NextResponse.json(task, { status: 201 });
  } catch (error) {
    if (error instanceof Error) {
      if (error.message.includes('Unauthorized')) {
        return NextResponse.json(
          { error: 'Unauthorized' },
          { status: 401 }
        );
      }

      if (error.message.includes('Task limit reached')) {
        return NextResponse.json(
          { error: error.message },
          { status: 400 }
        );
      }
    }

    console.error('Error creating task:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
