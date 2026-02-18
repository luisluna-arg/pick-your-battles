import { createTask, updateTask, deleteTask, upsertUser, updateUserProfile } from '@/lib/db/mutations';
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
    it('creates user with default maxTasks of 3', async () => {
      const mockUser = {
        id: 'user-1',
        email: 'test@example.com',
        name: 'Test User',
        image: 'https://example.com/avatar.jpg',
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
        maxTasks: 3, // Should default to 3
      }));
    });

    it('preserves provided maxTasks', async () => {
      const mockUser = {
        id: 'user-1',
        email: 'test@example.com',
        name: 'Test User',
        image: 'https://example.com/avatar.jpg',
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
        maxTasks: 5,
      });

      expect(result).toEqual(mockUser);
      expect(mockValues).toHaveBeenCalledWith(expect.objectContaining({
        maxTasks: 5, // Should preserve provided value
      }));
    });

    it('does not update maxTasks on conflict', async () => {
      const mockUser = {
        id: 'user-1',
        email: 'updated@example.com',
        name: 'Updated Name',
        image: 'https://example.com/new-avatar.jpg',
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

    it('allows task creation with maxTasks=1 boundary', async () => {
      mockGetUserProfile.mockResolvedValue({
        id: 'user-1',
        email: 'test@example.com',
        name: 'Test User',
        image: null,
        maxTasks: 1, // Minimum practical limit
        createdAt: new Date(),
      });
      mockGetTaskCount.mockResolvedValue(0); // No tasks yet

      const mockTask = {
        id: 1,
        userId: 'user-1',
        title: 'Only Task',
        description: null,
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
        title: 'Only Task',
        position: 1,
      });

      expect(result).toEqual(mockTask);
    });

    it('rejects task creation when maxTasks=1 and limit reached', async () => {
      mockGetUserProfile.mockResolvedValue({
        id: 'user-1',
        email: 'test@example.com',
        name: 'Test User',
        image: null,
        maxTasks: 1,
        createdAt: new Date(),
      });
      mockGetTaskCount.mockResolvedValue(1); // Already has 1 task

      await expect(
        createTask('user-1', {
          title: 'Second Task',
          position: 2,
        })
      ).rejects.toThrow('Task limit reached. You can only have 1 tasks at a time.');

      expect(mockDb.insert).not.toHaveBeenCalled();
    });

    it('allows task creation with maxTasks=10 boundary', async () => {
      mockGetUserProfile.mockResolvedValue({
        id: 'user-1',
        email: 'test@example.com',
        name: 'Test User',
        image: null,
        maxTasks: 10, // Maximum allowed limit
        createdAt: new Date(),
      });
      mockGetTaskCount.mockResolvedValue(9); // 9 tasks, can add one more

      const mockTask = {
        id: 10,
        userId: 'user-1',
        title: 'Tenth Task',
        description: null,
        status: 'pending',
        position: 10,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const mockQuery = {
        values: jest.fn().mockReturnThis(),
        returning: jest.fn().mockResolvedValue([mockTask]),
      };

      mockDb.insert.mockReturnValue(mockQuery as any);

      const result = await createTask('user-1', {
        title: 'Tenth Task',
        position: 10,
      });

      expect(result).toEqual(mockTask);
    });

    it('creates task at exact limit boundary successfully', async () => {
      mockGetUserProfile.mockResolvedValue({
        id: 'user-1',
        email: 'test@example.com',
        name: 'Test User',
        image: null,
        maxTasks: 3,
        createdAt: new Date(),
      });
      mockGetTaskCount.mockResolvedValue(2); // 2 of 3, should allow 3rd

      const mockTask = {
        id: 3,
        userId: 'user-1',
        title: 'Third Task',
        description: null,
        status: 'pending',
        position: 3,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const mockQuery = {
        values: jest.fn().mockReturnThis(),
        returning: jest.fn().mockResolvedValue([mockTask]),
      };

      mockDb.insert.mockReturnValue(mockQuery as any);

      const result = await createTask('user-1', {
        title: 'Third Task',
        position: 3,
      });

      expect(result).toEqual(mockTask);
      // Verify it checks the limit but allows creation
      expect(mockGetTaskCount).toHaveBeenCalledWith('user-1');
    });

    it('allows task creation after completing a task at limit', async () => {
      mockGetUserProfile.mockResolvedValue({
        id: 'user-1',
        email: 'test@example.com',
        name: 'Test User',
        image: null,
        maxTasks: 3,
        createdAt: new Date(),
      });

      // User has 2 active tasks (completed tasks excluded by getTaskCount)
      // Even if user has 3 total tasks (1 completed + 2 active), they can create new task
      mockGetTaskCount.mockResolvedValue(2);

      const mockTask = {
        id: 4,
        userId: 'user-1',
        title: 'New Task After Completion',
        description: null,
        status: 'pending',
        position: 4,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const mockQuery = {
        values: jest.fn().mockReturnThis(),
        returning: jest.fn().mockResolvedValue([mockTask]),
      };

      mockDb.insert.mockReturnValue(mockQuery as any);

      const result = await createTask('user-1', {
        title: 'New Task After Completion',
        position: 4,
      });

      expect(result).toEqual(mockTask);
      // Verify getTaskCount was called (which now excludes completed tasks)
      expect(mockGetTaskCount).toHaveBeenCalledWith('user-1');
    });

    it('allows creation when all previous tasks are completed', async () => {
      mockGetUserProfile.mockResolvedValue({
        id: 'user-1',
        email: 'test@example.com',
        name: 'Test User',
        image: null,
        maxTasks: 3,
        createdAt: new Date(),
      });

      // User has 0 active tasks (all completed)
      mockGetTaskCount.mockResolvedValue(0);

      const mockTask = {
        id: 5,
        userId: 'user-1',
        title: 'Fresh Start Task',
        description: null,
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
        title: 'Fresh Start Task',
        position: 1,
      });

      expect(result).toEqual(mockTask);
      expect(mockGetTaskCount).toHaveBeenCalledWith('user-1');
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

  describe('updateUserProfile', () => {
    it('updates maxTasks only', async () => {
      const mockUser = {
        id: 'user-1',
        email: 'test@example.com',
        name: 'Test User',
        image: null,
        maxTasks: 5,
        createdAt: new Date(),
      };

      const mockQuery = {
        set: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        returning: jest.fn().mockResolvedValue([mockUser]),
      };

      mockDb.update.mockReturnValue(mockQuery as any);

      const result = await updateUserProfile('user-1', { maxTasks: 5 });

      expect(result).toEqual(mockUser);
      expect(mockQuery.set).toHaveBeenCalledWith({ maxTasks: 5 });
    });

    it('throws error when maxTasks is less than 1', async () => {
      await expect(
        updateUserProfile('user-1', { maxTasks: 0 })
      ).rejects.toThrow('Max tasks must be between 1 and 10');

      expect(mockDb.update).not.toHaveBeenCalled();
    });

    it('throws error when maxTasks is greater than 10', async () => {
      await expect(
        updateUserProfile('user-1', { maxTasks: 11 })
      ).rejects.toThrow('Max tasks must be between 1 and 10');

      expect(mockDb.update).not.toHaveBeenCalled();
    });

    it('returns null when user not found', async () => {
      const mockQuery = {
        set: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        returning: jest.fn().mockResolvedValue([]),
      };

      mockDb.update.mockReturnValue(mockQuery as any);

      const result = await updateUserProfile('nonexistent-user', {
        maxTasks: 5,
      });

      expect(result).toBeNull();
    });

    it('accepts boundary value maxTasks = 1', async () => {
      const mockUser = {
        id: 'user-1',
        email: 'test@example.com',
        name: 'Test User',
        image: null,
        maxTasks: 1,
        createdAt: new Date(),
      };

      const mockQuery = {
        set: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        returning: jest.fn().mockResolvedValue([mockUser]),
      };

      mockDb.update.mockReturnValue(mockQuery as any);

      const result = await updateUserProfile('user-1', { maxTasks: 1 });

      expect(result).toEqual(mockUser);
      expect(mockQuery.set).toHaveBeenCalledWith({ maxTasks: 1 });
    });

    it('accepts boundary value maxTasks = 10', async () => {
      const mockUser = {
        id: 'user-1',
        email: 'test@example.com',
        name: 'Test User',
        image: null,
        maxTasks: 10,
        createdAt: new Date(),
      };

      const mockQuery = {
        set: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        returning: jest.fn().mockResolvedValue([mockUser]),
      };

      mockDb.update.mockReturnValue(mockQuery as any);

      const result = await updateUserProfile('user-1', { maxTasks: 10 });

      expect(result).toEqual(mockUser);
      expect(mockQuery.set).toHaveBeenCalledWith({ maxTasks: 10 });
    });
  });
});
