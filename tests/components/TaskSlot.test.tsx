import { render, screen } from '@testing-library/react'
import TaskSlot from '@/components/TaskSlot'

describe('TaskSlot Component', () => {
  it('renders with correct slot number', () => {
    render(<TaskSlot slotNumber={1} />)

    expect(screen.getByText('Task Slot 1')).toBeInTheDocument()
  })

  it('renders with different slot numbers', () => {
    const { rerender } = render(<TaskSlot slotNumber={2} />)
    expect(screen.getByText('Task Slot 2')).toBeInTheDocument()

    rerender(<TaskSlot slotNumber={3} />)
    expect(screen.getByText('Task Slot 3')).toBeInTheDocument()
  })

  it('has correct styling classes', () => {
    render(<TaskSlot slotNumber={1} />)

    const container = screen.getByText('Task Slot 1').closest('div')

    expect(container).toHaveClass('text-center')
    expect(container?.parentElement).toHaveClass(
      'flex',
      'items-center',
      'justify-center'
    )
  })

  it('renders with proper structure', () => {
    const { container } = render(<TaskSlot slotNumber={1} />)

    // Check that the main container exists
    const mainDiv = container.firstChild
    expect(mainDiv).toBeInTheDocument()

    // Check that text is rendered
    expect(screen.getByText('Task Slot 1')).toBeInTheDocument()
  })
})
