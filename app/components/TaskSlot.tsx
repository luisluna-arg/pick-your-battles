import type { Task } from '@/lib/db/schema';

interface TaskSlotProps {
  slotNumber: number;
  task?: Task;
  focusedTaskId?: number | null;
  onFocusToggle?: (taskId: number) => void;
}

export default function TaskSlot({
  slotNumber,
  task,
  focusedTaskId,
  onFocusToggle,
}: TaskSlotProps) {
  // Determine focus state
  const isFocused = task && focusedTaskId === task.id;
  const isFocusMode = focusedTaskId !== null;
  const shouldDim = isFocusMode && !isFocused;
  if (!task) {
    // Empty slot - dim during focus mode
    return (
      <div
        className={`flex items-center justify-center rounded-lg border-2 border-dashed p-8 shadow-sm transition-all ${
          isFocusMode
            ? 'border-zinc-200 bg-zinc-50/50 opacity-30 blur-sm dark:border-zinc-800 dark:bg-zinc-900/20'
            : 'border-zinc-300 bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900/50'
        }`}
      >
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
    <div
      className={`flex flex-col rounded-lg border-2 p-6 shadow-sm transition-all ${
        shouldDim
          ? 'border-zinc-200 bg-zinc-50 opacity-40 blur-sm dark:border-zinc-800 dark:bg-zinc-900/30'
          : 'border-zinc-300 bg-white hover:border-zinc-400 dark:border-zinc-700 dark:bg-zinc-900 dark:hover:border-zinc-600'
      }`}
    >
      <div className="mb-2 flex items-start justify-between">
        <span className={`rounded-full px-2 py-1 text-xs font-medium ${statusColor}`}>
          {task.status}
        </span>
        <div className="flex items-center gap-2">
          {onFocusToggle && (
            <button
              onClick={() => onFocusToggle(task.id)}
              className="rounded p-1 hover:bg-zinc-100 dark:hover:bg-zinc-800"
              aria-label={isFocused ? 'Unfocus task' : 'Focus on this task'}
              title={isFocused ? 'Exit focus mode' : 'Focus on this task'}
            >
              {isFocused ? (
                // Eye icon (focused)
                <svg
                  className="h-5 w-5 text-zinc-600 dark:text-zinc-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                  />
                </svg>
              ) : (
                // Eye-off icon (not focused)
                <svg
                  className="h-5 w-5 text-zinc-400 dark:text-zinc-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                  />
                </svg>
              )}
            </button>
          )}
          <span className="text-sm text-zinc-400 dark:text-zinc-500">
            #{task.position}
          </span>
        </div>
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
