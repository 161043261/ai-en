export function createQueryParams(
  input: Readonly<Record<string, string | number | boolean | undefined>>,
): URLSearchParams {
  const params = new URLSearchParams();

  for (const [key, value] of Object.entries(input)) {
    if (value !== undefined) {
      params.set(key, String(value));
    }
  }

  return params;
}
