import { createTask, updateTask, deleteTask, upsertUser } from '@/lib/db/mutations';
import { db } from '@/lib/db/connection';
import * as queries from '@/lib/db/queries';

// Mock the database connection
jest.mock('@/lib/db/connection', () => ({
  db: {
    insert: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
}));

// Mock queries module
jest.mock('@/lib/db/queries');

const mockDb = db as jest.Mocked<typeof db>;
const mockGetTaskCount = queries.getTaskCount as jest.MockedFunction<typeof queries.getTaskCount>;
const mockGetUserProfile = queries.getUserProfile as jest.MockedFunction<typeof queries.getUserProfile>;

describe('Database Mutations', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('upsertUser', () => {
    it('creates user with displayName defaulting to email', async () => {
      const mockUser = {
        id: 'user-1',
        email: 'test@example.com',
        name: 'Test User',
        image: 'https://example.com/avatar.jpg',
        displayName: 'test@example.com',
        maxTasks: 3,
        createdAt: new Date(),
      };

      const mockValues = jest.fn().mockReturnThis();
      const mockQuery = {
        values: mockValues,
        onConflictDoUpdate: jest.fn().mockReturnThis(),
        returning: jest.fn().mockResolvedValue([mockUser]),
      };

      mockDb.insert.mockReturnValue(mockQuery as any);

      const result = await upsertUser({
        id: 'user-1',
        email: 'test@example.com',
        name: 'Test User',
        image: 'https://example.com/avatar.jpg',
      });

      expect(result).toEqual(mockUser);
      expect(mockValues).toHaveBeenCalledWith(expect.objectContaining({
        email: 'test@example.com',
        displayName: 'test@example.com', // Should default to email
        maxTasks: 3, // Should default to 3
      }));
    });

    it('preserves provided displayName and maxTasks', async () => {
      const mockUser = {
        id: 'user-1',
        email: 'test@example.com',
        name: 'Test User',
        image: 'https://example.com/avatar.jpg',
        displayName: 'Custom Name',
        maxTasks: 5,
        createdAt: new Date(),
      };

      const mockValues = jest.fn().mockReturnThis();
      const mockQuery = {
        values: mockValues,
        onConflictDoUpdate: jest.fn().mockReturnThis(),
        returning: jest.fn().mockResolvedValue([mockUser]),
      };

      mockDb.insert.mockReturnValue(mockQuery as any);

      const result = await upsertUser({
        id: 'user-1',
        email: 'test@example.com',
        name: 'Test User',
        image: 'https://example.com/avatar.jpg',
        displayName: 'Custom Name',
        maxTasks: 5,
      });

      expect(result).toEqual(mockUser);
      expect(mockValues).toHaveBeenCalledWith(expect.objectContaining({
        displayName: 'Custom Name', // Should preserve provided value
        maxTasks: 5, // Should preserve provided value
      }));
    });

    it('does not update displayName and maxTasks on conflict', async () => {
      const mockUser = {
        id: 'user-1',
        email: 'updated@example.com',
        name: 'Updated Name',
        image: 'https://example.com/new-avatar.jpg',
        displayName: 'Original Display Name',
        maxTasks: 3,
        createdAt: new Date(),
      };

      const mockOnConflict = jest.fn().mockReturnThis();
      const mockQuery = {
        values: jest.fn().mockReturnThis(),
        onConflictDoUpdate: mockOnConflict,
        returning: jest.fn().mockResolvedValue([mockUser]),
      };

      mockDb.insert.mockReturnValue(mockQuery as any);

      await upsertUser({
        id: 'user-1',
        email: 'updated@example.com',
        name: 'Updated Name',
        image: 'https://example.com/new-avatar.jpg',
      });

      expect(mockOnConflict).toHaveBeenCalledWith(expect.objectContaining({
        set: expect.not.objectContaining({
          displayName: expect.anything(),
          maxTasks: expect.anything(),
        }),
      }));
    });
  });

  describe('createTask', () => {
    it('creates task successfully when under user limit', async () => {
      mockGetUserProfile.mockResolvedValue({
        id: 'user-1',
        email: 'test@example.com',
        name: 'Test User',
        image: null,
        displayName: 'test@example.com',
        maxTasks: 3,
        createdAt: new Date(),
      });
      mockGetTaskCount.mockResolvedValue(2); // User has 2 tasks

      const mockTask = {
        id: 1,
        userId: 'user-1',
        title: 'New Task',
        description: 'Task description',
        status: 'pending',
        position: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const mockQuery = {
        values: jest.fn().mockReturnThis(),
        returning: jest.fn().mockResolvedValue([mockTask]),
      };

      mockDb.insert.mockReturnValue(mockQuery as any);

      const result = await createTask('user-1', {
        title: 'New Task',
        description: 'Task description',
        position: 1,
      });

      expect(result).toEqual(mockTask);
      expect(mockGetUserProfile).toHaveBeenCalledWith('user-1');
      expect(mockGetTaskCount).toHaveBeenCalledWith('user-1');
    });

    it('throws error when user task limit is reached', async () => {
      mockGetUserProfile.mockResolvedValue({
        id: 'user-1',
        email: 'test@example.com',
        name: 'Test User',
        image: null,
        displayName: 'test@example.com',
        maxTasks: 3,
        createdAt: new Date(),
      });
      mockGetTaskCount.mockResolvedValue(3); // User already has 3 tasks

      await expect(
        createTask('user-1', {
          title: 'New Task',
          position: 1,
        })
      ).rejects.toThrow('Task limit reached. You can only have 3 tasks at a time.');

      expect(mockDb.insert).not.toHaveBeenCalled();
    });

    it('enforces custom user task limit', async () => {
      mockGetUserProfile.mockResolvedValue({
        id: 'user-1',
        email: 'test@example.com',
        name: 'Test User',
        image: null,
        displayName: 'test@example.com',
        maxTasks: 5, // Custom limit
        createdAt: new Date(),
      });
      mockGetTaskCount.mockResolvedValue(5); // User already has 5 tasks

      await expect(
        createTask('user-1', {
          title: 'New Task',
          position: 1,
        })
      ).rejects.toThrow('Task limit reached. You can only have 5 tasks at a time.');
    });

    it('throws error when user not found', async () => {
      mockGetUserProfile.mockResolvedValue(null);

      await expect(
        createTask('user-1', {
          title: 'New Task',
          position: 1,
        })
      ).rejects.toThrow('User not found');

      expect(mockDb.insert).not.toHaveBeenCalled();
    });
  });

  describe('updateTask', () => {
    it('updates task when user owns it', async () => {
      const mockTask = {
        id: 1,
        userId: 'user-1',
        title: 'Updated Task',
        description: 'Updated description',
        status: 'in-progress',
        position: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const mockQuery = {
        set: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        returning: jest.fn().mockResolvedValue([mockTask]),
      };

      mockDb.update.mockReturnValue(mockQuery as any);

      const result = await updateTask(1, 'user-1', {
        title: 'Updated Task',
        description: 'Updated description',
        status: 'in-progress',
      });

      expect(result).toEqual(mockTask);
    });

    it('returns null when task does not belong to user', async () => {
      const mockQuery = {
        set: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        returning: jest.fn().mockResolvedValue([]),
      };

      mockDb.update.mockReturnValue(mockQuery as any);

      const result = await updateTask(1, 'wrong-user', {
        title: 'Updated Task',
      });

      expect(result).toBeNull();
    });
  });

  describe('deleteTask', () => {
    it('deletes task when user owns it', async () => {
      const mockQuery = {
        where: jest.fn().mockReturnThis(),
        returning: jest.fn().mockResolvedValue([{ id: 1 }]),
      };

      mockDb.delete.mockReturnValue(mockQuery as any);

      const result = await deleteTask(1, 'user-1');

      expect(result).toBe(true);
    });

    it('returns false when task does not belong to user', async () => {
      const mockQuery = {
        where: jest.fn().mockReturnThis(),
        returning: jest.fn().mockResolvedValue([]),
      };

      mockDb.delete.mockReturnValue(mockQuery as any);

      const result = await deleteTask(1, 'wrong-user');

      expect(result).toBe(false);
    });
  });
});
