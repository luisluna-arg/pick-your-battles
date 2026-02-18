import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import TaskSlot from '@/components/TaskSlot'
import type { Task } from '@/lib/db/schema'

describe('TaskSlot Component', () => {
  it('renders empty slot when no task provided', () => {
    render(<TaskSlot slotNumber={1} />)

    expect(screen.getByText(/Empty Slot 1/)).toBeInTheDocument()
  })

  it('renders task when provided', () => {
    const mockTask: Task = {
      id: 1,
      userId: 'user-1',
      title: 'Test Task',
      description: 'Test description',
      status: 'pending',
      position: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    render(<TaskSlot slotNumber={1} task={mockTask} />)

    expect(screen.getByText('Test Task')).toBeInTheDocument()
    expect(screen.getByText('Test description')).toBeInTheDocument()
    expect(screen.getByText('pending')).toBeInTheDocument()
  })

  it('renders task without description', () => {
    const mockTask: Task = {
      id: 1,
      userId: 'user-1',
      title: 'Test Task',
      description: null,
      status: 'in-progress',
      position: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    render(<TaskSlot slotNumber={1} task={mockTask} />)

    expect(screen.getByText('Test Task')).toBeInTheDocument()
    expect(screen.queryByText('Test description')).not.toBeInTheDocument()
    expect(screen.getByText('in-progress')).toBeInTheDocument()
  })

  it('has correct styling for empty slot', () => {
    render(<TaskSlot slotNumber={1} />)

    const container = screen.getByText(/Empty Slot 1/).closest('div')
    expect(container).toHaveClass('text-center')
  })

  describe('Add Task', () => {
    it('renders Add Task button on empty slot when onAddTask provided', () => {
      render(<TaskSlot slotNumber={1} onAddTask={jest.fn()} />)

      expect(screen.getByLabelText('Add task to slot 1')).toBeInTheDocument()
      expect(screen.getByText('Add Task')).toBeInTheDocument()
    })

    it('Add Task button has cursor-pointer class', () => {
      render(<TaskSlot slotNumber={1} onAddTask={jest.fn()} />)

      expect(screen.getByLabelText('Add task to slot 1')).toHaveClass('cursor-pointer')
    })

    it('does not render Add Task button when onAddTask not provided', () => {
      render(<TaskSlot slotNumber={1} />)

      expect(screen.queryByLabelText('Add task to slot 1')).not.toBeInTheDocument()
      expect(screen.queryByText('Add Task')).not.toBeInTheDocument()
    })

    it('shows inline form when Add Task button clicked', () => {
      render(<TaskSlot slotNumber={1} onAddTask={jest.fn()} />)

      fireEvent.click(screen.getByLabelText('Add task to slot 1'))

      expect(screen.getByPlaceholderText('Task title...')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Add' })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument()
    })

    it('calls onAddTask with correct position and title on submit', async () => {
      const mockOnAddTask = jest.fn().mockResolvedValue(undefined)
      render(<TaskSlot slotNumber={2} onAddTask={mockOnAddTask} />)

      fireEvent.click(screen.getByLabelText('Add task to slot 2'))
      fireEvent.change(screen.getByPlaceholderText('Task title...'), {
        target: { value: 'My new task' },
      })
      fireEvent.click(screen.getByRole('button', { name: 'Add' }))

      await waitFor(() => {
        expect(mockOnAddTask).toHaveBeenCalledWith(2, 'My new task')
      })
    })

    it('disables submit when title is empty', () => {
      render(<TaskSlot slotNumber={1} onAddTask={jest.fn()} />)

      fireEvent.click(screen.getByLabelText('Add task to slot 1'))

      expect(screen.getByRole('button', { name: 'Add' })).toBeDisabled()
    })

    it('cancel hides the form and shows Add Task button again', () => {
      render(<TaskSlot slotNumber={1} onAddTask={jest.fn()} />)

      fireEvent.click(screen.getByLabelText('Add task to slot 1'))
      expect(screen.getByPlaceholderText('Task title...')).toBeInTheDocument()

      fireEvent.click(screen.getByRole('button', { name: 'Cancel' }))

      expect(screen.queryByPlaceholderText('Task title...')).not.toBeInTheDocument()
      expect(screen.getByLabelText('Add task to slot 1')).toBeInTheDocument()
    })

    it('shows error message when onAddTask throws', async () => {
      const mockOnAddTask = jest.fn().mockRejectedValue(new Error('Task limit reached'))
      render(<TaskSlot slotNumber={1} onAddTask={mockOnAddTask} />)

      fireEvent.click(screen.getByLabelText('Add task to slot 1'))
      fireEvent.change(screen.getByPlaceholderText('Task title...'), {
        target: { value: 'Task' },
      })
      fireEvent.click(screen.getByRole('button', { name: 'Add' }))

      await waitFor(() => {
        expect(screen.getByText('Task limit reached')).toBeInTheDocument()
      })
    })
  })

  describe('Focus Mode', () => {
    const mockTask: Task = {
      id: 1,
      userId: 'user-1',
      title: 'Test Task',
      description: null,
      status: 'pending',
      position: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    it('focus toggle button has cursor-pointer class', () => {
      render(
        <TaskSlot
          slotNumber={1}
          task={mockTask}
          focusedTaskId={null}
          onFocusToggle={jest.fn()}
        />
      )

      expect(screen.getByLabelText(/Focus on this task/)).toHaveClass('cursor-pointer')
    })

    it('renders focus button when onFocusToggle provided', () => {
      const mockOnFocusToggle = jest.fn()

      render(
        <TaskSlot
          slotNumber={1}
          task={mockTask}
          focusedTaskId={null}
          onFocusToggle={mockOnFocusToggle}
        />
      )

      const focusButton = screen.getByLabelText(/Focus on this task/)
      expect(focusButton).toBeInTheDocument()
    })

    it('calls onFocusToggle when focus button clicked', () => {
      const mockOnFocusToggle = jest.fn()

      render(
        <TaskSlot
          slotNumber={1}
          task={mockTask}
          focusedTaskId={null}
          onFocusToggle={mockOnFocusToggle}
        />
      )

      const focusButton = screen.getByLabelText(/Focus on this task/)
      fireEvent.click(focusButton)

      expect(mockOnFocusToggle).toHaveBeenCalledWith(1)
    })

    it('applies dim styles when another task is focused', () => {
      const { container } = render(
        <TaskSlot
          slotNumber={1}
          task={mockTask}
          focusedTaskId={2} // Different task is focused
          onFocusToggle={jest.fn()}
        />
      )

      const taskDiv = container.firstChild as HTMLElement
      expect(taskDiv).toHaveClass('opacity-40', 'blur-sm')
    })

    it('does not apply dim styles when this task is focused', () => {
      const { container } = render(
        <TaskSlot
          slotNumber={1}
          task={mockTask}
          focusedTaskId={1} // This task is focused
          onFocusToggle={jest.fn()}
        />
      )

      const taskDiv = container.firstChild as HTMLElement
      expect(taskDiv).not.toHaveClass('opacity-40')
      expect(taskDiv).not.toHaveClass('blur-sm')
    })

    it('does not apply dim styles when focus mode is off', () => {
      const { container } = render(
        <TaskSlot
          slotNumber={1}
          task={mockTask}
          focusedTaskId={null} // No focus active
          onFocusToggle={jest.fn()}
        />
      )

      const taskDiv = container.firstChild as HTMLElement
      expect(taskDiv).not.toHaveClass('opacity-40')
      expect(taskDiv).not.toHaveClass('blur-sm')
    })

    it('shows unfocus label when task is focused', () => {
      render(
        <TaskSlot
          slotNumber={1}
          task={mockTask}
          focusedTaskId={1} // This task is focused
          onFocusToggle={jest.fn()}
        />
      )

      const unfocusButton = screen.getByLabelText(/Unfocus task/)
      expect(unfocusButton).toBeInTheDocument()
    })

    it('dims empty slots during focus mode', () => {
      const { container } = render(
        <TaskSlot slotNumber={2} focusedTaskId={1} /> // No task, but focus mode active
      )

      const emptySlot = container.firstChild as HTMLElement
      expect(emptySlot).toHaveClass('opacity-30', 'blur-sm')
    })

    it('does not dim empty slots when focus mode is off', () => {
      const { container } = render(<TaskSlot slotNumber={2} focusedTaskId={null} />)

      const emptySlot = container.firstChild as HTMLElement
      expect(emptySlot).not.toHaveClass('opacity-30')
      expect(emptySlot).not.toHaveClass('blur-sm')
    })
  })
})
