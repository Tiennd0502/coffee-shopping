import { ROAST_LEVEL_SPECTRUM_PERCENT } from '@/constants/roast'
import { ROAST_LEVEL } from '@/types/product'

describe('ROAST_LEVEL_SPECTRUM_PERCENT', () => {
  it('maps LIGHT to a left-biased position', () => {
    expect(ROAST_LEVEL_SPECTRUM_PERCENT[ROAST_LEVEL.LIGHT]).toBe(15)
  })

  it('maps MEDIUM to center', () => {
    expect(ROAST_LEVEL_SPECTRUM_PERCENT[ROAST_LEVEL.MEDIUM]).toBe(50)
  })

  it('maps DARK to a right-biased position', () => {
    expect(ROAST_LEVEL_SPECTRUM_PERCENT[ROAST_LEVEL.DARK]).toBe(85)
  })
})
