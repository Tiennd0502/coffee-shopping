export const formDataEntryToString = (
  value: FormDataEntryValue | null,
): string => {
  if (value === null) {
    return ''
  }
  if (typeof value === 'string') {
    return value
  }
  return ''
}
