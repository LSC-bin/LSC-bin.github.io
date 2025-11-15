import { render, screen } from '@testing-library/react'

import { EmptyState } from '../EmptyState'

describe('EmptyState', () => {
  it('renders title and description', () => {
    render(<EmptyState title="No data" description="Try creating a new session." />)

    expect(screen.getByText('No data')).toBeInTheDocument()
    expect(screen.getByText('Try creating a new session.')).toBeInTheDocument()
  })

  it('renders custom children when provided', () => {
    render(
      <EmptyState title="Nothing here">
        <button type="button">Create item</button>
      </EmptyState>,
    )

    expect(screen.getByRole('button', { name: 'Create item' })).toBeInTheDocument()
  })
})



