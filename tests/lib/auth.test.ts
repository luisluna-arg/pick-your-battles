import { getCurrentUser, requireAuth } from '@/lib/auth'
import { auth } from '@/auth'

// Mock the auth module
jest.mock('@/auth')

const mockedAuth = auth as jest.MockedFunction<typeof auth>

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
})
