export function assertNever(value: never): never {
  throw new Error(`Unsupported provider value: ${String(value)}`);
}
