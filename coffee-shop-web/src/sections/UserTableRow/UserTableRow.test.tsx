import { render, screen } from '@testing-library/react'

import { UserTableRow } from '@/sections/UserTableRow'
import { USER_ROLES, USER_STATUS } from '@/types/user'

const baseUser = {
  id: 'u-1',
  email: 'pat@example.com',
  firstName: 'Pat',
  lastName: 'Lee',
  name: 'Pat Lee',
  avatarUrl: null,
  role: USER_ROLES.USER,
  status: USER_STATUS.ACTIVE,
}

describe('UserTableRow', () => {
  it('sets title on name and email for hover when text may truncate', () => {
    const longEmail = `${'a'.repeat(48)}@example.com`

    render(
      <table>
        <tbody>
          <tr>
            <UserTableRow
              user={{
                ...baseUser,
                firstName: 'Pat',
                lastName: 'Lee',
                email: longEmail,
              }}
            />
          </tr>
        </tbody>
      </table>,
    )

    expect(screen.getByText('Pat Lee')).toHaveAttribute('title', 'Pat Lee')
    expect(screen.getByText(longEmail)).toHaveAttribute('title', longEmail)
  })
})
