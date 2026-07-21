import { cloudClient } from './cloudClient'
import { createCloudPayload, validateCloudPayload } from './cloudSnapshot'

const TABLE = 'minutiae_snapshots'

function requireClient() {
  if (!cloudClient) {
    throw new Error('Cloud sync is not configured for this build.')
  }

  return cloudClient
}

export async function getCloudSnapshot(userId) {
  const client = requireClient()
  const { data, error } = await client
    .from(TABLE)
    .select('owner_id, payload, revision, updated_at')
    .eq('owner_id', userId)
    .limit(1)

  if (error) {
    throw error
  }

  return data?.[0] || null
}

export async function uploadCloudSnapshot({ userId, items, expectedRevision }) {
  const client = requireClient()
  const current = await getCloudSnapshot(userId)

  if (
    expectedRevision !== undefined &&
    expectedRevision !== (current?.revision || 0)
  ) {
    throw new Error('Cloud data changed on another device. Refresh its status before replacing it.')
  }

  const updatedAt = new Date().toISOString()
  const nextRecord = {
    owner_id: userId,
    payload: createCloudPayload(items, updatedAt),
    revision: (current?.revision || 0) + 1,
    updated_at: updatedAt,
  }
  const { data, error } = await client
    .from(TABLE)
    .upsert(nextRecord, { onConflict: 'owner_id' })
    .select('owner_id, payload, revision, updated_at')
    .single()

  if (error) {
    throw error
  }

  return data
}

export function getSnapshotItems(snapshot) {
  const validationError = validateCloudPayload(snapshot?.payload)

  if (validationError) {
    throw new Error(validationError)
  }

  return snapshot.payload.items
}
