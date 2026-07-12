import { useEffect, useState } from 'react'
import AddItemForm from '../components/add/AddItemForm'
import AddItemTypeSelector from '../components/add/AddItemTypeSelector'
import NextReminderPrompt from '../components/common/NextReminderPrompt'
import Toast from '../components/common/Toast'
import AppHeader from '../components/layout/AppHeader'
import { itemTypes } from '../data/lifeAdminConstants'
import { getItemTypeMeta } from '../data/itemTypes'
import {
  applyNextReminderBehavior,
  getNextReminderToastMessage,
} from '../features/lifeItems/nextReminderFlow'
import { addLifeItemWithLinkedExpense } from '../features/lifeItems/lifeItemStorage'

function AddPage({ initialType = '' }) {
  const [selectedType, setSelectedType] = useState(initialType)
  const [pendingNextReminderItem, setPendingNextReminderItem] = useState(null)
  const [toast, setToast] = useState(null)

  useEffect(() => {
    function handleInternalBack(event) {
      if (!selectedType) {
        return
      }

      event.preventDefault()
      setSelectedType('')
    }

    window.addEventListener('minutiae:back', handleInternalBack)
    return () => window.removeEventListener('minutiae:back', handleInternalBack)
  }, [selectedType])

  function handleSave(item, options) {
    try {
      const result = addLifeItemWithLinkedExpense(item, options)
      setSelectedType('')
      setToast({
        message: result.expenseCreated
          ? 'Saved and added to Money'
          : `${getSaveLabel(result.item.type)} saved`,
        tone: 'success',
      })
      handlePostSaveNextReminder(result.item)
      return true
    } catch {
      setToast({
        message: 'Save failed. Please try again.',
        tone: 'error',
      })
      return false
    }
  }

  function handlePostSaveNextReminder(item) {
    if (!shouldPromptForNextReminder(item)) {
      return
    }

    const result = applyNextReminderBehavior(item)

    if (result.behavior === 'ask') {
      setPendingNextReminderItem(item)
      return
    }

    if (result.behavior === 'auto') {
      setToast({
        message: getNextReminderToastMessage(result),
        tone: 'success',
      })
    }
  }

  return (
    <>
      <AppHeader
        title={selectedType ? 'Add' : 'What do you want to add?'}
        eyebrow="Capture a household item"
        description={
          selectedType
            ? 'Add just enough detail to make this easy to find and follow up.'
            : 'Add expenses, bills, vendor payments, income, renewals or records.'
        }
      />

      {selectedType ? (
        <AddItemForm
          key={selectedType}
          selectedType={selectedType}
          onBack={() => setSelectedType('')}
          onSave={handleSave}
        />
      ) : (
        <AddItemTypeSelector
          itemTypes={itemTypes}
          onSelectType={setSelectedType}
        />
      )}

      <Toast
        message={toast?.message}
        tone={toast?.tone}
        onDismiss={() => setToast(null)}
      />

      <NextReminderPrompt
        item={pendingNextReminderItem}
        onClose={() => setPendingNextReminderItem(null)}
        onCreated={(result) =>
          setToast({
            message: getNextReminderToastMessage(result),
            tone: 'success',
          })
        }
      />
    </>
  )
}

function shouldPromptForNextReminder(item) {
  return ['paid', 'completed', 'closed'].includes(item?.status)
}

function getSaveLabel(type) {
  const label = getItemTypeMeta(type).label

  if (type === 'document') {
    return 'Record'
  }

  return label
}

export default AddPage
