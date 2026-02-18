import { getUserProfile, getUserTasks, getTaskById, getTaskCount } from '@/lib/db/queries';
import { db } from '@/lib/db/connection';
import type { Task, User } from '@/lib/db/schema';

// Mock the database connection
jest.mock('@/lib/db/connection', () => ({
  db: {
    select: jest.fn(),
  },
}));

const mockDb = db as jest.Mocked<typeof db>;

const mockUser: User = {
  id: 'user-1',
  email: 'test@example.com',
  name: 'Test User',
  image: null,
  maxTasks: 3,
  createdAt: new Date(),
};

describe('Database Queries', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getUserProfile', () => {
    it('returns user when found by id', async () => {
      const mockQuery = {
        from: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        limit: jest.fn().mockResolvedValue([mockUser]),
      };
      mockDb.select.mockReturnValue(mockQuery as any);

      const result = await getUserProfile('user-1');

      expect(result).toEqual(mockUser);
      expect(mockDb.select).toHaveBeenCalledTimes(1);
    });

    it('returns null when id not found and no email provided', async () => {
      const mockQuery = {
        from: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        limit: jest.fn().mockResolvedValue([]),
      };
      mockDb.select.mockReturnValue(mockQuery as any);

      const result = await getUserProfile('unknown-id');

      expect(result).toBeNull();
      expect(mockDb.select).toHaveBeenCalledTimes(1);
    });

    it('falls back to email lookup when id not found', async () => {
      const emptyQuery = {
        from: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        limit: jest.fn().mockResolvedValue([]),
      };
      const emailQuery = {
        from: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        limit: jest.fn().mockResolvedValue([mockUser]),
      };
      mockDb.select
        .mockReturnValueOnce(emptyQuery as any)
        .mockReturnValueOnce(emailQuery as any);

      const result = await getUserProfile('new-oauth-id', 'test@example.com');

      expect(result).toEqual(mockUser);
      expect(mockDb.select).toHaveBeenCalledTimes(2);
    });

    it('returns null when neither id nor email finds a user', async () => {
      const mockQuery = {
        from: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        limit: jest.fn().mockResolvedValue([]),
      };
      mockDb.select.mockReturnValue(mockQuery as any);

      const result = await getUserProfile('unknown-id', 'unknown@example.com');

      expect(result).toBeNull();
      expect(mockDb.select).toHaveBeenCalledTimes(2);
    });
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

    it('excludes completed tasks from count', async () => {
      const mockTasks: Task[] = [
        {
          id: 1,
          userId: 'user-1',
          title: 'Active Task 1',
          description: null,
          status: 'pending',
          position: 1,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 2,
          userId: 'user-1',
          title: 'Active Task 2',
          description: null,
          status: 'in-progress',
          position: 2,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        // Completed task - should not be counted
      ];

      const mockQuery = {
        from: jest.fn().mockReturnThis(),
        where: jest.fn().mockResolvedValue(mockTasks),
      };

      mockDb.select.mockReturnValue(mockQuery as any);

      const result = await getTaskCount('user-1');

      expect(result).toBe(2); // Only 2 active tasks
    });

    it('returns 0 when all tasks are completed', async () => {
      const mockTasks: Task[] = []; // Query with status filter returns empty

      const mockQuery = {
        from: jest.fn().mockReturnThis(),
        where: jest.fn().mockResolvedValue(mockTasks),
      };

      mockDb.select.mockReturnValue(mockQuery as any);

      const result = await getTaskCount('user-1');

      expect(result).toBe(0);
    });

    it('counts only pending and in-progress tasks', async () => {
      const mockTasks: Task[] = [
        {
          id: 1,
          userId: 'user-1',
          title: 'Pending Task',
          description: null,
          status: 'pending',
          position: 1,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 2,
          userId: 'user-1',
          title: 'In Progress Task',
          description: null,
          status: 'in-progress',
          position: 2,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 3,
          userId: 'user-1',
          title: 'Another Pending',
          description: null,
          status: 'pending',
          position: 3,
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

      expect(result).toBe(3); // 2 pending + 1 in-progress
    });
  });
});
