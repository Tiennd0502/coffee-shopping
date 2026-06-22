import { render, screen } from '@testing-library/react'

import Table from '@/components/Table'

interface Row {
  id: string
  label: string
}

const columns = [
  { key: 'a', label: 'Column A' },
  { key: 'b', label: 'Column B' },
]

describe('Table', () => {
  it('renders column headers and row cells', () => {
    const data: Row[] = [
      { id: '1', label: 'First' },
      { id: '2', label: 'Second' },
    ]

    render(
      <Table<Row>
        columns={columns}
        data={data}
        getRowKey={(row) => row.id}
        renderRow={(row) => (
          <>
            <td>{row.id}</td>
            <td>{row.label}</td>
          </>
        )}
      />,
    )

    expect(screen.getByText('Column A')).toBeInTheDocument()
    expect(screen.getByText('Column B')).toBeInTheDocument()
    expect(screen.getByText('First')).toBeInTheDocument()
    expect(screen.getByText('Second')).toBeInTheDocument()
  })

  it('renders empty message when data is empty', () => {
    render(
      <Table<Row>
        columns={columns}
        data={[]}
        getRowKey={(row) => row.id}
        renderRow={() => null}
        emptyMessage="Nothing here."
      />,
    )

    expect(screen.getByText('Nothing here.')).toBeInTheDocument()
  })

  it('uses wrapper without horizontal scroll and default table width classes', () => {
    const { container } = render(
      <Table<Row>
        columns={columns}
        data={[]}
        getRowKey={(row) => row.id}
        renderRow={() => null}
      />,
    )

    const wrapper = container.firstChild as HTMLElement
    expect(wrapper.className).not.toMatch(/overflow-x-auto/)
    expect(wrapper.className).toMatch(/min-w-0/)

    const table = container.querySelector('table')
    expect(table?.className).toMatch(/w-full/)
    expect(table?.className).toMatch(/table-fixed/)
    expect(table?.className).not.toMatch(/min-w-\[700px\]/)
  })

  it('merges custom tableClassName onto table element', () => {
    const { container } = render(
      <Table<Row>
        columns={columns}
        data={[]}
        getRowKey={(row) => row.id}
        renderRow={() => null}
        tableClassName="custom-table-class"
      />,
    )

    const table = container.querySelector('table')
    expect(table?.className).toContain('custom-table-class')
  })

  it('applies resolveRowClassName to each row', () => {
    const data: Row[] = [
      { id: '1', label: 'First' },
      { id: '2', label: 'Second' },
    ]

    render(
      <Table<Row>
        columns={columns}
        data={data}
        getRowKey={(row) => row.id}
        resolveRowClassName={(row) => (row.id === '2' ? 'bg-muted/30' : '')}
        renderRow={(row) => (
          <>
            <td>{row.id}</td>
            <td>{row.label}</td>
          </>
        )}
      />,
    )

    const rows = screen.getAllByRole('row')
    expect(rows[1]).not.toHaveClass('bg-muted/30')
    expect(rows[2]).toHaveClass('bg-muted/30')
  })
})
