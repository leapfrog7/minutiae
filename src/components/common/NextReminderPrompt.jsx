import { getNextCyclePromptMessage } from '../../features/lifeItems/lifeItemHelpers'
import { createNextCycleItem } from '../../features/lifeItems/lifeItemStorage'
import ConfirmDialog from './ConfirmDialog'

function NextReminderPrompt({ item, onClose, onCreated }) {
  if (!item) {
    return null
  }

  function handleCreate() {
    const result = createNextCycleItem(item)
    onCreated?.(result)
    onClose()
  }

  return (
    <ConfirmDialog
      cancelLabel="Skip"
      confirmLabel="Create next"
      message={getNextCyclePromptMessage(item)}
      onCancel={onClose}
      onConfirm={handleCreate}
      title="Create next reminder?"
      tone="default"
    />
  )
}

export default NextReminderPrompt
