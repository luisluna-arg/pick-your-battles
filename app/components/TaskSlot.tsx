import type { Task } from '@/lib/db/schema';

interface TaskSlotProps {
  slotNumber: number;
  task?: Task;
}

export default function TaskSlot({ slotNumber, task }: TaskSlotProps) {
  if (!task) {
    // Empty slot
    return (
      <div className="flex items-center justify-center rounded-lg border-2 border-dashed border-zinc-300 bg-zinc-50 p-8 shadow-sm dark:border-zinc-700 dark:bg-zinc-900/50">
        <div className="text-center">
          <p className="text-xl font-semibold text-zinc-400 dark:text-zinc-500">
            Empty Slot {slotNumber}
          </p>
        </div>
      </div>
    );
  }

  // Filled slot with task
  const statusColors = {
    pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
    'in-progress': 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
    completed: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  };

  const statusColor = statusColors[task.status as keyof typeof statusColors] || statusColors.pending;

  return (
    <div className="flex flex-col rounded-lg border-2 border-zinc-300 bg-white p-6 shadow-sm transition-colors hover:border-zinc-400 dark:border-zinc-700 dark:bg-zinc-900 dark:hover:border-zinc-600">
      <div className="mb-2 flex items-start justify-between">
        <span className={`rounded-full px-2 py-1 text-xs font-medium ${statusColor}`}>
          {task.status}
        </span>
        <span className="text-sm text-zinc-400 dark:text-zinc-500">
          #{task.position}
        </span>
      </div>
      <h3 className="mb-2 text-lg font-semibold text-zinc-900 dark:text-zinc-50">
        {task.title}
      </h3>
      {task.description && (
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          {task.description}
        </p>
      )}
    </div>
  );
}
