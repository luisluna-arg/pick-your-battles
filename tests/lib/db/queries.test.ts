import { getUserTasks, getTaskById, getTaskCount } from '@/lib/db/queries';
import { db } from '@/lib/db/connection';
import type { Task } from '@/lib/db/schema';

// Mock the database connection
jest.mock('@/lib/db/connection', () => ({
  db: {
    select: jest.fn(),
  },
}));

const mockDb = db as jest.Mocked<typeof db>;

describe('Database Queries', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getUserTasks', () => {
    it('returns tasks for the specified user ordered by position', async () => {
      const mockTasks: Task[] = [
        {
          id: 1,
          userId: 'user-1',
          title: 'Task 1',
          description: null,
          status: 'pending',
          position: 1,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 2,
          userId: 'user-1',
          title: 'Task 2',
          description: null,
          status: 'in-progress',
          position: 2,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      const mockQuery = {
        from: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockResolvedValue(mockTasks),
      };

      mockDb.select.mockReturnValue(mockQuery as any);

      const result = await getUserTasks('user-1');

      expect(result).toEqual(mockTasks);
      expect(mockDb.select).toHaveBeenCalled();
    });

    it('returns empty array when user has no tasks', async () => {
      const mockQuery = {
        from: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockResolvedValue([]),
      };

      mockDb.select.mockReturnValue(mockQuery as any);

      const result = await getUserTasks('user-no-tasks');

      expect(result).toEqual([]);
    });
  });

  describe('getTaskById', () => {
    it('returns task when user owns it', async () => {
      const mockTask: Task = {
        id: 1,
        userId: 'user-1',
        title: 'Task 1',
        description: null,
        status: 'pending',
        position: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const mockQuery = {
        from: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        limit: jest.fn().mockResolvedValue([mockTask]),
      };

      mockDb.select.mockReturnValue(mockQuery as any);

      const result = await getTaskById(1, 'user-1');

      expect(result).toEqual(mockTask);
    });

    it('returns null when task does not exist', async () => {
      const mockQuery = {
        from: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        limit: jest.fn().mockResolvedValue([]),
      };

      mockDb.select.mockReturnValue(mockQuery as any);

      const result = await getTaskById(999, 'user-1');

      expect(result).toBeNull();
    });
  });

  describe('getTaskCount', () => {
    it('returns correct count for user with tasks', async () => {
      const mockTasks: Task[] = [
        {
          id: 1,
          userId: 'user-1',
          title: 'Task 1',
          description: null,
          status: 'pending',
          position: 1,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 2,
          userId: 'user-1',
          title: 'Task 2',
          description: null,
          status: 'in-progress',
          position: 2,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      const mockQuery = {
        from: jest.fn().mockReturnThis(),
        where: jest.fn().mockResolvedValue(mockTasks),
      };

      mockDb.select.mockReturnValue(mockQuery as any);

      const result = await getTaskCount('user-1');

      expect(result).toBe(2);
    });

    it('returns 0 for user with no tasks', async () => {
      const mockQuery = {
        from: jest.fn().mockReturnThis(),
        where: jest.fn().mockResolvedValue([]),
      };

      mockDb.select.mockReturnValue(mockQuery as any);

      const result = await getTaskCount('user-no-tasks');

      expect(result).toBe(0);
    });
  });
});
