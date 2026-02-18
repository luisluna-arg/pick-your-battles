import { render, screen } from '@testing-library/react'
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
})
