// Import Jest DOM matchers
require('@testing-library/jest-dom')

// Mock Next.js navigation
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(() => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
    refresh: jest.fn(),
    prefetch: jest.fn(),
  })),
  usePathname: jest.fn(() => '/'),
  useSearchParams: jest.fn(() => new URLSearchParams()),
  useParams: jest.fn(() => ({})),
}))

// Mock Next.js Image component
jest.mock('next/image', () => ({
  __esModule: true,
  default: function Image(props) {
    // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
    return require('react').createElement('img', props)
  },
}))

// Mock Auth.js
jest.mock('./app/auth', () => ({
  auth: jest.fn(),
  signIn: jest.fn(),
  signOut: jest.fn(),
}))

// Set up environment variables for tests
process.env.AUTH_SECRET = 'test-secret'
process.env.GOOGLE_CLIENT_ID = 'test-client-id'
process.env.GOOGLE_CLIENT_SECRET = 'test-client-secret'
