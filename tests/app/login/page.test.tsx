import { render, screen } from '@testing-library/react';
import LoginPage from '@/app/login/page';

jest.mock('@/auth', () => ({ signIn: jest.fn() }));

describe('LoginPage', () => {
  it('does not show hardcoded task limit of 3 in tagline', () => {
    render(<LoginPage />);

    expect(screen.queryByText(/limit yourself to 3 tasks/i)).not.toBeInTheDocument();
  });

  it('renders app name', () => {
    render(<LoginPage />);

    expect(screen.getByRole('heading', { name: 'Pick Your Battles' })).toBeInTheDocument();
  });

  it('renders sign in button', () => {
    render(<LoginPage />);

    expect(screen.getByRole('button', { name: /sign in with google/i })).toBeInTheDocument();
  });
});
