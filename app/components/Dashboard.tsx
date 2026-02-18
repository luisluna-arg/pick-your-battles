import TaskSlot from './TaskSlot';

export default function Dashboard() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 p-4 dark:bg-zinc-950">
      <div className="w-full max-w-4xl">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="mb-2 text-4xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            Pick Your Battles
          </h1>
          <p className="text-lg text-zinc-600 dark:text-zinc-400">
            Focus on what matters. Limit yourself to 3 tasks at a time.
          </p>
        </div>

        {/* Task Slots */}
        <div className="grid gap-6 md:grid-cols-3">
          <TaskSlot slotNumber={1} />
          <TaskSlot slotNumber={2} />
          <TaskSlot slotNumber={3} />
        </div>
      </div>
    </div>
  );
}
