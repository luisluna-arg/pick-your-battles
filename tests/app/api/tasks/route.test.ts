/**
 * @jest-environment node
 */
import { GET, POST } from '@/app/api/tasks/route';
import { resolveUserProfile } from '@/lib/auth';
import { getUserTasks } from '@/lib/db/queries';
import { createTask } from '@/lib/db/mutations';
import type { Task, User } from '@/lib/db/schema';

jest.mock('@/lib/auth');
jest.mock('@/lib/db/queries');
jest.mock('@/lib/db/mutations');

const mockResolveUserProfile = resolveUserProfile as jest.MockedFunction<typeof resolveUserProfile>;
const mockGetUserTasks = getUserTasks as jest.MockedFunction<typeof getUserTasks>;
const mockCreateTask = createTask as jest.MockedFunction<typeof createTask>;

const mockProfile: User = {
  id: 'user-123',
  email: 'test@example.com',
  name: 'Test User',
  image: null,
  maxTasks: 3,
  createdAt: new Date(),
};

const mockTask: Task = {
  id: 1,
  userId: 'user-123',
  title: 'Test Task',
  description: null,
  status: 'pending',
  position: 1,
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe('GET /api/tasks', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns 401 when not authenticated', async () => {
    mockResolveUserProfile.mockResolvedValue(null);

    const response = await GET();

    expect(response.status).toBe(401);
    const data = await response.json();
    expect(data).toEqual({ error: 'Unauthorized' });
    expect(mockGetUserTasks).not.toHaveBeenCalled();
  });

  it('returns 200 with tasks for authenticated user', async () => {
    const mockTasks: Task[] = [mockTask];

    mockResolveUserProfile.mockResolvedValue(mockProfile);
    mockGetUserTasks.mockResolvedValue(mockTasks);

    const response = await GET();

    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data).toEqual(
      mockTasks.map((t) => ({
        ...t,
        createdAt: t.createdAt.toISOString(),
        updatedAt: t.updatedAt.toISOString(),
      }))
    );
    expect(mockGetUserTasks).toHaveBeenCalledWith('user-123');
  });

  it('uses canonical DB user ID for task lookup', async () => {
    const profileWithDifferentId: User = { ...mockProfile, id: 'db-canonical-id' };
    mockResolveUserProfile.mockResolvedValue(profileWithDifferentId);
    mockGetUserTasks.mockResolvedValue([]);

    await GET();

    expect(mockGetUserTasks).toHaveBeenCalledWith('db-canonical-id');
  });

  it('returns 200 with empty array when user has no tasks', async () => {
    mockResolveUserProfile.mockResolvedValue(mockProfile);
    mockGetUserTasks.mockResolvedValue([]);

    const response = await GET();

    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data).toEqual([]);
  });
});

describe('POST /api/tasks', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const makeRequest = (body: object) =>
    new Request('http://localhost/api/tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    }) as any;

  it('returns 401 when not authenticated', async () => {
    mockResolveUserProfile.mockResolvedValue(null);

    const response = await POST(makeRequest({ title: 'Test', position: 1 }));

    expect(response.status).toBe(401);
    expect(mockCreateTask).not.toHaveBeenCalled();
  });

  it('returns 400 when title is missing', async () => {
    mockResolveUserProfile.mockResolvedValue(mockProfile);

    const response = await POST(makeRequest({ position: 1 }));

    expect(response.status).toBe(400);
    const data = await response.json();
    expect(data.error).toContain('Title is required');
  });

  it('returns 400 when position is missing', async () => {
    mockResolveUserProfile.mockResolvedValue(mockProfile);

    const response = await POST(makeRequest({ title: 'Test' }));

    expect(response.status).toBe(400);
    const data = await response.json();
    expect(data.error).toContain('Position is required');
  });

  it('creates task with canonical DB user ID', async () => {
    const profileWithDifferentId: User = { ...mockProfile, id: 'db-canonical-id' };
    mockResolveUserProfile.mockResolvedValue(profileWithDifferentId);
    mockCreateTask.mockResolvedValue({ ...mockTask, userId: 'db-canonical-id' });

    const response = await POST(makeRequest({ title: 'New Task', position: 1 }));

    expect(response.status).toBe(201);
    expect(mockCreateTask).toHaveBeenCalledWith('db-canonical-id', expect.objectContaining({
      title: 'New Task',
      position: 1,
    }));
  });

  it('returns 400 when task limit is reached', async () => {
    mockResolveUserProfile.mockResolvedValue(mockProfile);
    mockCreateTask.mockRejectedValue(new Error('Task limit reached. You can only have 3 tasks at a time.'));

    const response = await POST(makeRequest({ title: 'Test', position: 1 }));

    expect(response.status).toBe(400);
    const data = await response.json();
    expect(data.error).toContain('Task limit reached');
  });
});
