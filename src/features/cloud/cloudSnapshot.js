export const CLOUD_SCHEMA_VERSION = 1

export function createCloudPayload(items, exportedAt = new Date().toISOString()) {
  if (!Array.isArray(items)) {
    throw new TypeError('Cloud payload items must be an array.')
  }

  return {
    app: 'minutiae',
    schemaVersion: CLOUD_SCHEMA_VERSION,
    exportedAt,
    items,
  }
}

export function validateCloudPayload(payload) {
  if (!payload || payload.app !== 'minutiae') {
    return 'The cloud record is not a Minutiae backup.'
  }

  if (payload.schemaVersion !== CLOUD_SCHEMA_VERSION) {
    return 'The cloud record uses an unsupported schema version.'
  }

  if (!Array.isArray(payload.items)) {
    return 'The cloud record does not contain an items array.'
  }

  return ''
}
