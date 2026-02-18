interface TaskSlotProps {
  slotNumber: number;
}

export default function TaskSlot({ slotNumber }: TaskSlotProps) {
  return (
    <div className="flex items-center justify-center rounded-lg border-2 border-zinc-300 bg-white p-8 shadow-sm transition-colors hover:border-zinc-400 dark:border-zinc-700 dark:bg-zinc-900 dark:hover:border-zinc-600">
      <div className="text-center">
        <p className="text-xl font-semibold text-zinc-400 dark:text-zinc-500">
          Task Slot {slotNumber}
        </p>
      </div>
    </div>
  );
}
