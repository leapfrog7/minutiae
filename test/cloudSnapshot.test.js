import test from 'node:test'
import assert from 'node:assert/strict'
import {
  CLOUD_SCHEMA_VERSION,
  createCloudPayload,
  validateCloudPayload,
} from '../src/features/cloud/cloudSnapshot.js'

test('creates a versioned Minutiae cloud payload', () => {
  const payload = createCloudPayload([{ id: 'one' }], '2026-07-21T10:00:00.000Z')

  assert.deepEqual(payload, {
    app: 'minutiae',
    schemaVersion: CLOUD_SCHEMA_VERSION,
    exportedAt: '2026-07-21T10:00:00.000Z',
    items: [{ id: 'one' }],
  })
  assert.equal(validateCloudPayload(payload), '')
})

test('rejects snapshots from another application or schema', () => {
  assert.match(validateCloudPayload({ app: 'other', schemaVersion: 1, items: [] }), /not a Minutiae/)
  assert.match(validateCloudPayload({ app: 'minutiae', schemaVersion: 99, items: [] }), /unsupported/)
})

test('requires an items array', () => {
  assert.throws(() => createCloudPayload(null), /must be an array/)
  assert.match(validateCloudPayload({ app: 'minutiae', schemaVersion: 1 }), /items array/)
})
