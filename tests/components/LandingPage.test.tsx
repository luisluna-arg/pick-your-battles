import { render, screen } from '@testing-library/react';
import LandingPage from '@/components/LandingPage';

// Mock the auth module's signIn function
jest.mock('@/auth', () => ({
  signIn: jest.fn(),
}));

describe('LandingPage Component', () => {
  it('renders hero section with app branding', () => {
    render(<LandingPage />);

    expect(screen.getByText('Pick Your Battles')).toBeInTheDocument();
    expect(
      screen.getByText(/Focus on what matters\. Limit yourself to a few tasks at a time/)
    ).toBeInTheDocument();
  });

  it('renders value proposition section', () => {
    render(<LandingPage />);

    expect(screen.getByText('Why Limit Your Tasks?')).toBeInTheDocument();
    expect(screen.getByText('Forced Focus')).toBeInTheDocument();
    expect(screen.getByText('Real Progress')).toBeInTheDocument();
    expect(screen.getByText('Less Stress')).toBeInTheDocument();
  });

  it('renders how it works section', () => {
    render(<LandingPage />);

    expect(screen.getByText('How It Works')).toBeInTheDocument();
    // "Sign in with Google" appears both as an h3 and in the button, so we check for both
    const signInElements = screen.getAllByText('Sign in with Google');
    expect(signInElements.length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText('Choose your battles')).toBeInTheDocument();
    expect(
      screen.getByText(/Add tasks up to your configured limit/)
    ).toBeInTheDocument();
    expect(screen.getByText('Stay focused and complete')).toBeInTheDocument();
  });

  it('renders sign in button', () => {
    render(<LandingPage />);

    const signInButton = screen.getByRole('button', {
      name: /sign in with google/i,
    });
    expect(signInButton).toBeInTheDocument();
  });

  it('has privacy note about Google authentication', () => {
    render(<LandingPage />);

    expect(
      screen.getByText(/We only use your Google account for authentication/i)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/We never access your Gmail or other Google services/i)
    ).toBeInTheDocument();
  });

  it('has correct structure with multiple sections', () => {
    const { container } = render(<LandingPage />);

    // Check that main container exists
    const mainDiv = container.firstChild;
    expect(mainDiv).toBeInTheDocument();

    // Verify all key sections are present
    expect(screen.getByText('Pick Your Battles')).toBeInTheDocument();
    expect(screen.getByText('Why Limit Your Tasks?')).toBeInTheDocument();
    expect(screen.getByText('How It Works')).toBeInTheDocument();
  });
});
