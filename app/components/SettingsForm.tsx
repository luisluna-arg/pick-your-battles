'use client';

import { useState } from 'react';

interface SettingsFormProps {
  initialDisplayName: string | null;
  initialMaxTasks: number;
  userId: string;
}

export default function SettingsForm({
  initialDisplayName,
  initialMaxTasks,
}: SettingsFormProps) {
  const [displayName, setDisplayName] = useState(initialDisplayName || '');
  const [maxTasks, setMaxTasks] = useState(initialMaxTasks);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage(null);

    try {
      const response = await fetch('/api/user', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          displayName: displayName.trim() || null,
          maxTasks,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update settings');
      }

      setMessage({ type: 'success', text: 'Settings updated successfully!' });
    } catch (error) {
      setMessage({
        type: 'error',
        text: error instanceof Error ? error.message : 'Failed to update settings',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Display Name Field */}
      <div>
        <label
          htmlFor="displayName"
          className="block text-sm font-medium text-zinc-900 dark:text-zinc-50"
        >
          Display Name
        </label>
        <input
          type="text"
          id="displayName"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          maxLength={50}
          className="mt-2 block w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-zinc-900 shadow-sm focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50 dark:focus:border-zinc-50 dark:focus:ring-zinc-50"
          placeholder="Enter your display name"
          disabled={isLoading}
        />
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          Maximum 50 characters
        </p>
      </div>

      {/* Max Tasks Field */}
      <div>
        <label
          htmlFor="maxTasks"
          className="block text-sm font-medium text-zinc-900 dark:text-zinc-50"
        >
          Maximum Concurrent Tasks
        </label>
        <input
          type="number"
          id="maxTasks"
          value={maxTasks}
          onChange={(e) => setMaxTasks(parseInt(e.target.value, 10))}
          min={1}
          max={10}
          className="mt-2 block w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-zinc-900 shadow-sm focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50 dark:focus:border-zinc-50 dark:focus:ring-zinc-50"
          disabled={isLoading}
        />
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          Choose between 1 and 10 tasks
        </p>
      </div>

      {/* Message Display */}
      {message && (
        <div
          className={`rounded-md p-4 ${
            message.type === 'success'
              ? 'bg-green-50 text-green-800 dark:bg-green-900/20 dark:text-green-400'
              : 'bg-red-50 text-red-800 dark:bg-red-900/20 dark:text-red-400'
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Submit Button */}
      <div>
        <button
          type="submit"
          disabled={isLoading}
          className="inline-flex justify-center rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200 dark:focus:ring-zinc-50"
        >
          {isLoading ? 'Saving...' : 'Save Settings'}
        </button>
      </div>
    </form>
  );
}
