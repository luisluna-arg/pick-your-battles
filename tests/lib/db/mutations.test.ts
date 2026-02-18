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

describe('Database Mutations', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('upsertUser', () => {
    it('creates or updates user successfully', async () => {
      const mockUser = {
        id: 'user-1',
        email: 'test@example.com',
        name: 'Test User',
        image: 'https://example.com/avatar.jpg',
        createdAt: new Date(),
      };

      const mockQuery = {
        values: jest.fn().mockReturnThis(),
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
      expect(mockDb.insert).toHaveBeenCalled();
    });
  });

  describe('createTask', () => {
    it('creates task successfully when under limit', async () => {
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
      expect(mockGetTaskCount).toHaveBeenCalledWith('user-1');
    });

    it('throws error when task limit is reached', async () => {
      mockGetTaskCount.mockResolvedValue(3); // User already has 3 tasks

      await expect(
        createTask('user-1', {
          title: 'New Task',
          position: 1,
        })
      ).rejects.toThrow('Task limit reached');

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
