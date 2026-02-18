import { getCurrentUser } from '@/lib/auth';
import Dashboard from '@/components/Dashboard';
import LandingPage from '@/components/LandingPage';

export default async function Home() {
  // Check authentication state
  const user = await getCurrentUser();

  // Render dashboard for authenticated users, landing page for unauthenticated
  if (user) {
    return <Dashboard />;
  }

  return <LandingPage />;
}
