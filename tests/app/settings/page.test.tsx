import { render, screen } from '@testing-library/react';
import SettingsPage from '@/app/settings/page';
import { getCurrentUser } from '@/lib/auth';
import { getUserProfile } from '@/lib/db/queries';
import type { User } from '@/lib/db/schema';

jest.mock('@/lib/auth');
jest.mock('@/lib/db/connection', () => ({ db: {} }));
jest.mock('@/lib/db/queries');
jest.mock('@/lib/db/mutations');
jest.mock('next/navigation', () => ({ redirect: jest.fn() }));
jest.mock('@/auth', () => ({ auth: jest.fn(), signOut: jest.fn() }));
jest.mock('@/components/UserNav', () => () => <div data-testid="user-nav" />);
jest.mock('@/components/SettingsForm', () => () => <div data-testid="settings-form" />);

const mockGetCurrentUser = getCurrentUser as jest.MockedFunction<typeof getCurrentUser>;
const mockGetUserProfile = getUserProfile as jest.MockedFunction<typeof getUserProfile>;

const mockUser: User = {
  id: 'user-1',
  email: 'test@example.com',
  name: 'Test User',
  image: null,
  maxTasks: 3,
  createdAt: new Date('2024-01-01'),
};

describe('SettingsPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('does not render UserNav directly (prevents duplicate nav)', async () => {
    mockGetCurrentUser.mockResolvedValue({ id: 'user-1', email: 'test@example.com', name: 'Test User' });
    mockGetUserProfile.mockResolvedValue(mockUser);

    render(await SettingsPage());

    // The settings page itself should NOT render UserNav
    // (UserNav is already rendered by the root layout globally)
    expect(screen.queryByTestId('user-nav')).not.toBeInTheDocument();
  });

  it('renders the Settings heading', async () => {
    mockGetCurrentUser.mockResolvedValue({ id: 'user-1', email: 'test@example.com', name: 'Test User' });
    mockGetUserProfile.mockResolvedValue(mockUser);

    render(await SettingsPage());

    expect(screen.getByRole('heading', { name: 'Settings' })).toBeInTheDocument();
  });

  it('renders the Dashboard back link', async () => {
    mockGetCurrentUser.mockResolvedValue({ id: 'user-1', email: 'test@example.com', name: 'Test User' });
    mockGetUserProfile.mockResolvedValue(mockUser);

    render(await SettingsPage());

    const dashboardLink = screen.getByRole('link', { name: /dashboard/i });
    expect(dashboardLink).toHaveAttribute('href', '/');
  });
});
