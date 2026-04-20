const UUID_RE =
  /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/gi;

const ISO_DATE_RE = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/;

/**
 * Stabilises JSON snapshots: UUIDs and ISO timestamps from the DB / runtime.
 */
export function sanitizeForSnapshot(value: unknown): unknown {
  if (value === null || value === undefined) {
    return value;
  }
  if (typeof value === 'string') {
    if (ISO_DATE_RE.test(value)) {
      return '<iso-date>';
    }
    if (UUID_RE.test(value)) {
      return value.replace(UUID_RE, '<uuid>');
    }
    return value;
  }
  if (Array.isArray(value)) {
    return value.map((v) => sanitizeForSnapshot(v));
  }
  if (typeof value === 'object') {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
      if (k === 'createdAt' || k === 'updatedAt') {
        out[k] = '<iso-date>';
      } else {
        out[k] = sanitizeForSnapshot(v);
      }
    }
    return out;
  }
  return value;
}

export function expectSnapshotBody(body: unknown): void {
  expect(sanitizeForSnapshot(body)).toMatchSnapshot();
}
