/**
 * @jest-environment node
 */
import { GET } from '@/app/api/user/route';
import { getCurrentUser } from '@/lib/auth';
import { getUserProfile } from '@/lib/db/queries';
import type { User } from '@/lib/db/schema';

jest.mock('@/lib/auth');
jest.mock('@/lib/db/queries');

const mockGetCurrentUser = getCurrentUser as jest.MockedFunction<typeof getCurrentUser>;
const mockGetUserProfile = getUserProfile as jest.MockedFunction<typeof getUserProfile>;

const mockUser: User = {
  id: 'user-1',
  email: 'test@example.com',
  name: 'Test User',
  image: null,
  displayName: 'Test',
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
    expect(mockGetUserProfile).toHaveBeenCalledWith('user-1');
  });

  it('returns 401 when not authenticated', async () => {
    mockGetCurrentUser.mockResolvedValue(null);

    const response = await GET();

    expect(response.status).toBe(401);
    const data = await response.json();
    expect(data).toEqual({ error: 'Unauthorized' });
  });

  it('returns 404 when user not found in database', async () => {
    mockGetCurrentUser.mockResolvedValue({ id: 'ghost', email: 'ghost@example.com' });
    mockGetUserProfile.mockResolvedValue(null);

    const response = await GET();

    expect(response.status).toBe(404);
    const data = await response.json();
    expect(data).toEqual({ error: 'User not found' });
  });

  it('returns 500 on unexpected error', async () => {
    mockGetCurrentUser.mockRejectedValue(new Error('Database connection failed'));

    const response = await GET();

    expect(response.status).toBe(500);
    const data = await response.json();
    expect(data).toEqual({ error: 'Internal server error' });
  });
});
