const formatThousandsRegex = /\B(?=(\d{3})+(?!\d))/g

export const normalizeNumericInput = (value: string): string => {
  if (!value) return ''

  const sanitized = value.replaceAll(',', '').replaceAll(' ', '')
  const isNegative = sanitized.startsWith('-')
  const unsigned = sanitized.replaceAll('-', '')
  const hasDecimalPoint = unsigned.includes('.')
  const [integerPartRaw, ...decimalParts] = unsigned.split('.')
  const integerPart = integerPartRaw.replaceAll(/\D/g, '')
  const decimalPart = decimalParts.join('').replaceAll(/\D/g, '')

  if (!integerPart && hasDecimalPoint) {
    if (!decimalPart) return `${isNegative ? '-' : ''}.`
    return `${isNegative ? '-' : ''}.${decimalPart}`
  }

  const baseInteger =
    integerPart.length > 0 ? integerPart : decimalPart.length > 0 ? '0' : ''
  if (!baseInteger && !decimalPart) return ''

  const prefixedInteger = `${isNegative ? '-' : ''}${baseInteger}`
  if (!decimalPart) return prefixedInteger

  return `${prefixedInteger}.${decimalPart}`
}

export const formatNumericWithThousands = (raw: string): string => {
  if (!raw) return ''

  const isNegative = raw.startsWith('-')
  const unsigned = isNegative ? raw.slice(1) : raw
  const [integerPart, decimalPart] = unsigned.split('.')
  const formattedInteger = integerPart.replaceAll(formatThousandsRegex, ',')
  const prefixedInteger = `${isNegative ? '-' : ''}${formattedInteger}`

  if (decimalPart === undefined) return prefixedInteger

  return `${prefixedInteger}.${decimalPart}`
}
