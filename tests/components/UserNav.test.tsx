import { render, screen } from '@testing-library/react';
import UserNav from '@/components/UserNav';
import { auth } from '@/auth';

const mockedAuth = auth as jest.MockedFunction<typeof auth>;

describe('UserNav', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders nothing when not authenticated', async () => {
    mockedAuth.mockResolvedValue(null);

    const { container } = render(await UserNav());

    expect(container).toBeEmptyDOMElement();
  });

  it('renders Settings link for authenticated users', async () => {
    mockedAuth.mockResolvedValue({
      user: {
        name: 'Test User',
        email: 'test@example.com',
        image: null,
      },
    });

    render(await UserNav());

    const settingsLink = screen.getByRole('link', { name: 'Settings' });
    expect(settingsLink).toBeInTheDocument();
    expect(settingsLink).toHaveAttribute('href', '/settings');
  });

  it('renders Sign Out button for authenticated users', async () => {
    mockedAuth.mockResolvedValue({
      user: {
        name: 'Test User',
        email: 'test@example.com',
        image: null,
      },
    });

    render(await UserNav());

    expect(screen.getByRole('button', { name: 'Sign Out' })).toBeInTheDocument();
  });

  it('Sign Out button has cursor-pointer class', async () => {
    mockedAuth.mockResolvedValue({
      user: {
        name: 'Test User',
        email: 'test@example.com',
        image: null,
      },
    });

    render(await UserNav());

    expect(screen.getByRole('button', { name: 'Sign Out' })).toHaveClass('cursor-pointer');
  });

  it('renders user name and email for authenticated users', async () => {
    mockedAuth.mockResolvedValue({
      user: {
        name: 'Test User',
        email: 'test@example.com',
        image: null,
      },
    });

    render(await UserNav());

    expect(screen.getByText('Test User')).toBeInTheDocument();
    expect(screen.getByText('test@example.com')).toBeInTheDocument();
  });

  it('renders avatar when user has an image', async () => {
    mockedAuth.mockResolvedValue({
      user: {
        name: 'Test User',
        email: 'test@example.com',
        image: 'https://example.com/avatar.jpg',
      },
    });

    render(await UserNav());

    const avatar = screen.getByRole('img', { name: 'Test User' });
    expect(avatar).toBeInTheDocument();
    expect(avatar).toHaveAttribute('src', 'https://example.com/avatar.jpg');
  });
});
