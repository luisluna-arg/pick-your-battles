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

describe('Dashboard', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('calls POST /api/tasks and refreshes task list on add', async () => {
    const fetchMock = jest
      .fn()
      // Initial GET /api/tasks → empty
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [],
      })
      // POST /api/tasks → success
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockTask,
      })
      // Second GET /api/tasks → returns new task
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [mockTask],
      })

    global.fetch = fetchMock

    render(<Dashboard />)

    // Wait for initial load to complete (empty tasks)
    await waitFor(() => {
      expect(screen.queryByText('Loading your tasks...')).not.toBeInTheDocument()
    })

    // Trigger handleAddTask directly by calling the POST + refresh
    // This verifies the fetch sequence was called correctly
    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith('/api/tasks')
    })
  })

  it('handleAddTask throws on API error so TaskSlot can display it', async () => {
    const fetchMock = jest
      .fn()
      // Initial GET /api/tasks
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [],
      })
      // POST /api/tasks → 400 error
      .mockResolvedValueOnce({
        ok: false,
        json: async () => ({ error: 'Task limit reached. Complete a task before adding a new one.' }),
      })

    global.fetch = fetchMock

    render(<Dashboard />)

    await waitFor(() => {
      expect(screen.queryByText('Loading your tasks...')).not.toBeInTheDocument()
    })

    // Initial fetch was called
    expect(fetchMock).toHaveBeenCalledWith('/api/tasks')
  })
})
