import { getCurrentUser } from '@/lib/auth';
import { getUserProfile } from '@/lib/db/queries';
import UserNav from '@/components/UserNav';
import SettingsForm from '@/components/SettingsForm';
import { redirect } from 'next/navigation';
import Link from 'next/link';

export default async function SettingsPage() {
  // Get authenticated user
  const user = await getCurrentUser();
  if (!user) {
    redirect('/');
  }

  // Fetch user profile
  const userId = user.id!;
  const profile = await getUserProfile(userId);
  if (!profile) {
    // User should exist if authenticated, but handle edge case
    redirect('/');
  }

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
          <Link
            href="/"
            className="mb-6 inline-flex items-center text-sm text-zinc-600 transition-colors hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50"
          >
            ← Dashboard
          </Link>
          <h1 className="mb-2 text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            Settings
          </h1>
          <p className="text-lg text-zinc-600 dark:text-zinc-400">
            Manage your Pick Your Battles preferences
          </p>
        </div>

        {/* Settings Form */}
        <div className="rounded-lg border border-zinc-200 bg-white p-8 dark:border-zinc-800 dark:bg-zinc-900">
          <SettingsForm
            initialMaxTasks={profile.maxTasks}
            userId={userId}
          />
        </div>
      </div>
    </div>
  );
}
