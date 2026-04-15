function omit<T extends Record<string, unknown>, K extends keyof T>(obj: T, keys: K[]): Omit<T, K> {
  if (!obj) return {} as Omit<T, K>

  const result = { ...obj }

  for (const key of keys) {
    if (key in result) {
      delete result[key]
    }
  }

  return result
}

export default omit
