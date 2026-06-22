import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { CategoryTableRow } from '@/sections/CategoryTableRow'

const activeCategory = {
  id: 'cat-1',
  name: 'Espresso',
  slug: 'espresso',
  createdBy: null,
  updatedBy: null,
  deletedBy: null,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
  deletedAt: null,
}

describe('CategoryTableRow', () => {
  it('calls onRequestDelete when remove is clicked', async () => {
    const user = userEvent.setup()
    const onRequestDelete = jest.fn()

    render(
      <table>
        <tbody>
          <tr>
            <CategoryTableRow
              category={activeCategory}
              onRequestDelete={onRequestDelete}
            />
          </tr>
        </tbody>
      </table>,
    )

    await user.click(screen.getByRole('button', { name: /remove espresso/i }))
    expect(onRequestDelete).toHaveBeenCalledTimes(1)
    expect(onRequestDelete).toHaveBeenCalledWith(activeCategory)
  })

  it('does not call onRequestDelete when archived', () => {
    const onRequestDelete = jest.fn()

    render(
      <table>
        <tbody>
          <tr>
            <CategoryTableRow
              category={{
                ...activeCategory,
                deletedAt: '2026-01-02T00:00:00.000Z',
              }}
              onRequestDelete={onRequestDelete}
            />
          </tr>
        </tbody>
      </table>,
    )

    expect(
      screen.getByRole('button', { name: /remove espresso/i }),
    ).toBeDisabled()
    expect(onRequestDelete).not.toHaveBeenCalled()
  })

  it('exposes full slug via title on slug cell when slug is non-empty', () => {
    const longSlug = 'very-long-category-slug-for-truncation-testing'

    render(
      <table>
        <tbody>
          <tr>
            <CategoryTableRow
              category={{ ...activeCategory, slug: longSlug }}
            />
          </tr>
        </tbody>
      </table>,
    )

    const slugCode = screen.getByText(longSlug)
    expect(slugCode).toHaveAttribute('title', longSlug)
  })
})
