import { getNextReminderBehavior } from './lifeItemHelpers'
import { createNextCycleItem } from './lifeItemStorage'

export function applyNextReminderBehavior(item) {
  const behavior = getNextReminderBehavior(item)

  if (behavior !== 'auto') {
    return { behavior, duplicateSkipped: false, item: null }
  }

  return {
    behavior,
    ...createNextCycleItem(item),
  }
}

export function getNextReminderToastMessage(result) {
  if (result.duplicateSkipped) {
    return 'Next reminder already exists.'
  }

  return 'Next reminder created'
}
