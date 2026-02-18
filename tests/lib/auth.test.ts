import { getCurrentUser, requireAuth, resolveUserProfile } from '@/lib/auth'
import { auth } from '@/auth'
import { getUserProfile } from '@/lib/db/queries'
import { upsertUser } from '@/lib/db/mutations'

// Mock the auth module
jest.mock('@/auth')
jest.mock('@/lib/db/connection', () => ({ db: {} }))
jest.mock('@/lib/db/queries')
jest.mock('@/lib/db/mutations')

const mockedAuth = auth as jest.MockedFunction<typeof auth>
const mockGetUserProfile = getUserProfile as jest.MockedFunction<typeof getUserProfile>
const mockUpsertUser = upsertUser as jest.MockedFunction<typeof upsertUser>

describe('Auth Utility Functions', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('getCurrentUser', () => {
    it('returns user when authenticated', async () => {
      const mockUser = {
        name: 'Test User',
        email: 'test@example.com',
        image: 'https://example.com/avatar.jpg',
      }

      mockedAuth.mockResolvedValue({
        user: mockUser,
        expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      })

      const user = await getCurrentUser()

      expect(user).toEqual(mockUser)
      expect(mockedAuth).toHaveBeenCalledTimes(1)
    })

    it('returns null when not authenticated', async () => {
      mockedAuth.mockResolvedValue(null)

      const user = await getCurrentUser()

      expect(user).toBeNull()
      expect(mockedAuth).toHaveBeenCalledTimes(1)
    })

    it('returns null when session has no user', async () => {
      mockedAuth.mockResolvedValue({
        expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      } as any)

      const user = await getCurrentUser()

      expect(user).toBeNull()
    })
  })

  describe('requireAuth', () => {
    it('returns session when authenticated with user ID', async () => {
      const mockSession = {
        user: {
          id: 'user-123',
          name: 'Test User',
          email: 'test@example.com',
        },
        expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      }

      mockedAuth.mockResolvedValue(mockSession)

      const session = await requireAuth()

      expect(session).toEqual(mockSession)
      expect(mockedAuth).toHaveBeenCalledTimes(1)
    })

    it('throws error when not authenticated', async () => {
      mockedAuth.mockResolvedValue(null)

      await expect(requireAuth()).rejects.toThrow(
        'Unauthorized: User must be authenticated'
      )
      expect(mockedAuth).toHaveBeenCalledTimes(1)
    })

    it('throws error when session has no user ID', async () => {
      mockedAuth.mockResolvedValue({
        user: {
          email: 'test@example.com',
        },
        expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      } as any)

      await expect(requireAuth()).rejects.toThrow(
        'Unauthorized: User must be authenticated'
      )
    })
  })

  describe('resolveUserProfile', () => {
    const mockDbUser = {
      id: 'db-user-id',
      email: 'test@example.com',
      name: 'Test User',
      image: null,
      maxTasks: 3,
      createdAt: new Date(),
    }

    it('returns null when not authenticated', async () => {
      mockedAuth.mockResolvedValue(null)

      const result = await resolveUserProfile()

      expect(result).toBeNull()
      expect(mockGetUserProfile).not.toHaveBeenCalled()
    })

    it('returns user profile found by ID', async () => {
      mockedAuth.mockResolvedValue({
        user: { id: 'db-user-id', email: 'test@example.com', name: 'Test User' },
        expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      })
      mockGetUserProfile.mockResolvedValue(mockDbUser)

      const result = await resolveUserProfile()

      expect(result).toEqual(mockDbUser)
      expect(mockGetUserProfile).toHaveBeenCalledWith('db-user-id', 'test@example.com')
    })

    it('returns user profile found by email when OAuth ID changed', async () => {
      mockedAuth.mockResolvedValue({
        user: { id: 'new-oauth-id', email: 'test@example.com', name: 'Test User' },
        expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      })
      // getUserProfile falls back to email and finds the user
      mockGetUserProfile.mockResolvedValue({ ...mockDbUser, id: 'old-db-id' })

      const result = await resolveUserProfile()

      expect(result).not.toBeNull()
      expect(result?.id).toBe('old-db-id')
      expect(mockUpsertUser).not.toHaveBeenCalled()
    })

    it('creates user via upsert when profile not found', async () => {
      mockedAuth.mockResolvedValue({
        user: { id: 'new-user-id', email: 'new@example.com', name: 'New User' },
        expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      })
      mockGetUserProfile.mockResolvedValue(null)
      mockUpsertUser.mockResolvedValue({ ...mockDbUser, id: 'new-user-id', email: 'new@example.com' })

      const result = await resolveUserProfile()

      expect(result).not.toBeNull()
      expect(mockUpsertUser).toHaveBeenCalledWith({
        id: 'new-user-id',
        email: 'new@example.com',
        name: 'New User',
        image: null,
      })
    })
  })
})
