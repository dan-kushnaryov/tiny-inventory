/**
 * Copies fields from `patch` to `target` if their value is not `undefined`.
 * Explicit `null` is passed through (e.g. to reset a nullable field).
 */
export function assignDefined(target: object, patch: object): void {
  for (const [key, value] of Object.entries(patch)) {
    if (value !== undefined) {
      Reflect.set(target, key, value);
    }
  }
}

/**
 * Returns a new object with only the fields that have a value.
 */
export function pickDefined(
  source: Record<string, unknown>,
): Record<string, unknown> {
  return Object.fromEntries(
    Object.entries(source).filter(([, v]) => v !== undefined),
  );
}
