/**
 * @jest-environment node
 */
import { GET } from '@/app/api/user/route';
import { getCurrentUser } from '@/lib/auth';
import { getUserProfile } from '@/lib/db/queries';
import { upsertUser } from '@/lib/db/mutations';
import type { User } from '@/lib/db/schema';

jest.mock('@/lib/auth');
jest.mock('@/lib/db/queries');
jest.mock('@/lib/db/mutations');

const mockGetCurrentUser = getCurrentUser as jest.MockedFunction<typeof getCurrentUser>;
const mockGetUserProfile = getUserProfile as jest.MockedFunction<typeof getUserProfile>;
const mockUpsertUser = upsertUser as jest.MockedFunction<typeof upsertUser>;

const mockUser: User = {
  id: 'user-1',
  email: 'test@example.com',
  name: 'Test User',
  image: null,
  maxTasks: 5,
  createdAt: new Date('2024-01-01'),
};

describe('GET /api/user', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns user profile with maxTasks when authenticated', async () => {
    mockGetCurrentUser.mockResolvedValue({ id: 'user-1', email: 'test@example.com', name: 'Test User' });
    mockGetUserProfile.mockResolvedValue(mockUser);

    const response = await GET();

    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.maxTasks).toBe(5);
    expect(data.id).toBe('user-1');
    expect(mockGetUserProfile).toHaveBeenCalledWith('user-1', 'test@example.com');
  });

  it('returns 401 when not authenticated', async () => {
    mockGetCurrentUser.mockResolvedValue(null);

    const response = await GET();

    expect(response.status).toBe(401);
    const data = await response.json();
    expect(data).toEqual({ error: 'Unauthorized' });
  });

  it('auto-creates user via upsert when not found in database', async () => {
    mockGetCurrentUser.mockResolvedValue({ id: 'new-id', email: 'new@example.com', name: 'New User' });
    mockGetUserProfile.mockResolvedValue(null);
    mockUpsertUser.mockResolvedValue({ ...mockUser, id: 'new-id', email: 'new@example.com' });

    const response = await GET();

    expect(response.status).toBe(200);
    expect(mockUpsertUser).toHaveBeenCalledWith({
      id: 'new-id',
      email: 'new@example.com',
      name: 'New User',
      image: null,
    });
  });

  it('returns 500 on unexpected error', async () => {
    mockGetCurrentUser.mockRejectedValue(new Error('Database connection failed'));

    const response = await GET();

    expect(response.status).toBe(500);
    const data = await response.json();
    expect(data).toEqual({ error: 'Internal server error' });
  });
});
