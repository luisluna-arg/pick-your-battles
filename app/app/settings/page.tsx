import { requireAuth } from '@/lib/auth';
import UserNav from '@/components/UserNav';

export default async function SettingsPage() {
  // Ensure user is authenticated (middleware also protects this route)
  await requireAuth();

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      {/* User Navigation */}
      <div className="border-b border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
        <div className="mx-auto max-w-7xl px-4 py-4">
          <UserNav />
        </div>
      </div>

      {/* Settings Content */}
      <div className="mx-auto max-w-4xl px-4 py-8">
        <div className="mb-8">
          <h1 className="mb-2 text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            Settings
          </h1>
          <p className="text-lg text-zinc-600 dark:text-zinc-400">
            Manage your Pick Your Battles preferences
          </p>
        </div>

        {/* Placeholder Content */}
        <div className="rounded-lg border border-zinc-200 bg-white p-8 text-center dark:border-zinc-800 dark:bg-zinc-900">
          <p className="text-zinc-600 dark:text-zinc-400">
            Settings coming soon...
          </p>
          <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-500">
            Future features: task limit configuration, theme preferences, account management
          </p>
        </div>
      </div>
    </div>
  );
}
