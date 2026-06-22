import {
  MENU,
  MENU_DISABLED_HINT,
  DASHBOARD_DISABLED_HINT,
  DASHBOARD_MENU,
} from '@/constants/nav'

describe('nav constants', () => {
  it('exports the dashboard disabled hint label', () => {
    expect(DASHBOARD_DISABLED_HINT).toBe('Coming soon')
  })

  it('exports the header disabled hint label', () => {
    expect(MENU_DISABLED_HINT).toBe('Coming soon')
  })

  it('only disables favorites and settings entries in dashboard', () => {
    const disabledByLabel = DASHBOARD_MENU.filter((item) => item.disabled).map(
      (item) => item.label,
    )

    expect(disabledByLabel).toEqual(['Favorites', 'Settings'])
  })

  it('only disables brew guides, subscriptions, and contact in header', () => {
    const disabledByLabel = MENU.filter((item) => item.disabled).map(
      (item) => item.label,
    )

    expect(disabledByLabel).toEqual(['Brew Guides', 'Subscriptions', 'Contact'])
  })
})
