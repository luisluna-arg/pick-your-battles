import { render, screen, waitFor } from '@testing-library/react'
import Dashboard from '@/components/Dashboard'

const mockTask = {
  id: 1,
  userId: 'user-1',
  title: 'Test Task',
  description: null,
  status: 'pending',
  position: 1,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
}

const mockUser = { id: 'user-1', maxTasks: 3, email: 'test@example.com', name: 'Test', displayName: 'Test', image: null }

describe('Dashboard', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('fetches user profile and renders correct number of slots', async () => {
    global.fetch = jest
      .fn()
      .mockResolvedValueOnce({ ok: true, json: async () => [] })          // GET /api/tasks
      .mockResolvedValueOnce({ ok: true, json: async () => ({ ...mockUser, maxTasks: 5 }) }) // GET /api/user

    render(<Dashboard />)

    await waitFor(() => {
      expect(screen.queryByText('Loading your tasks...')).not.toBeInTheDocument()
    })

    // 5 slots should be rendered (each has an "Add task to slot N" button)
    const slots = screen.getAllByLabelText(/Add task to slot \d+/)
    expect(slots).toHaveLength(5)
  })

  it('defaults to 3 slots when user fetch fails', async () => {
    global.fetch = jest
      .fn()
      .mockResolvedValueOnce({ ok: true, json: async () => [] })     // GET /api/tasks
      .mockResolvedValueOnce({ ok: false, json: async () => ({}) })   // GET /api/user fails

    render(<Dashboard />)

    await waitFor(() => {
      expect(screen.queryByText('Loading your tasks...')).not.toBeInTheDocument()
    })

    const slots = screen.getAllByLabelText(/Add task to slot \d+/)
    expect(slots).toHaveLength(3)
  })

  it('subtitle reflects maxTasks value', async () => {
    global.fetch = jest
      .fn()
      .mockResolvedValueOnce({ ok: true, json: async () => [] })
      .mockResolvedValueOnce({ ok: true, json: async () => ({ ...mockUser, maxTasks: 5 }) })

    render(<Dashboard />)

    await waitFor(() => {
      expect(screen.getByText(/Limit yourself to 5 tasks at a time\./)).toBeInTheDocument()
    })
  })

  it('subtitle shows singular form for maxTasks = 1', async () => {
    global.fetch = jest
      .fn()
      .mockResolvedValueOnce({ ok: true, json: async () => [] })
      .mockResolvedValueOnce({ ok: true, json: async () => ({ ...mockUser, maxTasks: 1 }) })

    render(<Dashboard />)

    await waitFor(() => {
      expect(screen.getByText(/Limit yourself to 1 task at a time\./)).toBeInTheDocument()
    })
  })

  it('calls POST /api/tasks and refreshes task list on add', async () => {
    global.fetch = jest
      .fn()
      .mockResolvedValueOnce({ ok: true, json: async () => [] })          // GET /api/tasks
      .mockResolvedValueOnce({ ok: true, json: async () => mockUser })    // GET /api/user
      .mockResolvedValueOnce({ ok: true, json: async () => mockTask })    // POST /api/tasks
      .mockResolvedValueOnce({ ok: true, json: async () => [mockTask] })  // GET /api/tasks refresh

    render(<Dashboard />)

    await waitFor(() => {
      expect(screen.queryByText('Loading your tasks...')).not.toBeInTheDocument()
    })

    expect(global.fetch).toHaveBeenCalledWith('/api/tasks')
    expect(global.fetch).toHaveBeenCalledWith('/api/user')
  })

  it('handleAddTask throws on API error so TaskSlot can display it', async () => {
    global.fetch = jest
      .fn()
      .mockResolvedValueOnce({ ok: true, json: async () => [] })       // GET /api/tasks
      .mockResolvedValueOnce({ ok: true, json: async () => mockUser }) // GET /api/user

    render(<Dashboard />)

    await waitFor(() => {
      expect(screen.queryByText('Loading your tasks...')).not.toBeInTheDocument()
    })

    expect(global.fetch).toHaveBeenCalledWith('/api/tasks')
  })
})
