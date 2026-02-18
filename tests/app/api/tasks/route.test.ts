/**
 * @jest-environment node
 */
import { GET } from '@/app/api/tasks/route';
import { requireAuth } from '@/lib/auth';
import { getUserTasks } from '@/lib/db/queries';
import type { Task } from '@/lib/db/schema';

jest.mock('@/lib/auth');
jest.mock('@/lib/db/queries');

const mockRequireAuth = requireAuth as jest.MockedFunction<typeof requireAuth>;
const mockGetUserTasks = getUserTasks as jest.MockedFunction<typeof getUserTasks>;

describe('GET /api/tasks', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns 401 when session has no user ID', async () => {
    // This reproduces the bug: requireAuth throws because session.user.id is undefined
    mockRequireAuth.mockRejectedValue(
      new Error('Unauthorized: User must be authenticated')
    );

    const response = await GET();

    expect(response.status).toBe(401);
    const data = await response.json();
    expect(data).toEqual({ error: 'Unauthorized' });
    expect(mockGetUserTasks).not.toHaveBeenCalled();
  });

  it('returns 200 with tasks for authenticated user', async () => {
    const mockSession = {
      user: { id: 'user-123', name: 'Test User', email: 'test@example.com' },
      expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    };
    const mockTasks: Task[] = [
      {
        id: 1,
        userId: 'user-123',
        title: 'Test Task',
        description: null,
        status: 'pending',
        position: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    mockRequireAuth.mockResolvedValue(mockSession as any);
    mockGetUserTasks.mockResolvedValue(mockTasks);

    const response = await GET();

    expect(response.status).toBe(200);
    const data = await response.json();
    // Dates are serialized to ISO strings by NextResponse.json
    expect(data).toEqual(
      mockTasks.map((t) => ({
        ...t,
        createdAt: t.createdAt.toISOString(),
        updatedAt: t.updatedAt.toISOString(),
      }))
    );
    expect(mockGetUserTasks).toHaveBeenCalledWith('user-123');
  });

  it('returns 200 with empty array when authenticated user has no tasks', async () => {
    const mockSession = {
      user: { id: 'user-123', name: 'Test User', email: 'test@example.com' },
      expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    };

    mockRequireAuth.mockResolvedValue(mockSession as any);
    mockGetUserTasks.mockResolvedValue([]);

    const response = await GET();

    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data).toEqual([]);
    expect(mockGetUserTasks).toHaveBeenCalledWith('user-123');
  });
});
