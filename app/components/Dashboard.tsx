'use client';

import { useEffect, useState } from 'react';
import TaskSlot from './TaskSlot';
import type { Task } from '@/lib/db/schema';

export default function Dashboard() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [maxTasks, setMaxTasks] = useState(3);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [focusedTaskId, setFocusedTaskId] = useState<number | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const [tasksResponse, userResponse] = await Promise.all([
          fetch('/api/tasks'),
          fetch('/api/user'),
        ]);

        if (!tasksResponse.ok) {
          throw new Error('Failed to fetch tasks');
        }

        const tasksData = await tasksResponse.json();
        setTasks(tasksData);

        if (userResponse.ok) {
          const userData = await userResponse.json();
          setMaxTasks(userData.maxTasks ?? 3);
        }
      } catch (err) {
        console.error('Error fetching data:', err);
        setError(err instanceof Error ? err.message : 'Failed to load tasks');
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  // Map tasks to slots (positions 1, 2, 3)
  const getTaskForSlot = (slotNumber: number): Task | undefined => {
    return tasks.find((task) => task.position === slotNumber);
  };

  // Handle focus toggle - clicking focused task unfocuses, clicking unfocused task focuses it
  const handleFocusToggle = (taskId: number) => {
    setFocusedTaskId((prev) => (prev === taskId ? null : taskId));
  };

  // Handle adding a new task to a slot
  const handleAddTask = async (position: number, title: string) => {
    const response = await fetch('/api/tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, position }),
    });

    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.error || 'Failed to create task');
    }

    // Re-fetch tasks to update the UI
    const updated = await fetch('/api/tasks');
    if (updated.ok) {
      const data = await updated.json();
      setTasks(data);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 p-4 dark:bg-zinc-950">
      <div className="w-full max-w-4xl">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="mb-2 text-4xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            Pick Your Battles
          </h1>
          <p className="text-lg text-zinc-600 dark:text-zinc-400">
            Focus on what matters. Limit yourself to {maxTasks} task{maxTasks !== 1 ? 's' : ''} at a time.
          </p>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center">
            <p className="text-zinc-600 dark:text-zinc-400">Loading your tasks...</p>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="rounded-lg bg-red-50 p-4 text-center dark:bg-red-900/20">
            <p className="text-red-800 dark:text-red-400">{error}</p>
          </div>
        )}

        {/* Task Slots */}
        {!loading && !error && (
          <div className="grid gap-6 md:grid-cols-3">
            {Array.from({ length: maxTasks }, (_, i) => i + 1).map((slotNumber) => (
              <TaskSlot
                key={slotNumber}
                slotNumber={slotNumber}
                task={getTaskForSlot(slotNumber)}
                focusedTaskId={focusedTaskId}
                onFocusToggle={handleFocusToggle}
                onAddTask={handleAddTask}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
