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

function AddPage({ initialItem = null, initialType = '' }) {
  const [selectedType, setSelectedType] = useState(initialType)
  const [similarDraft, setSimilarDraft] = useState(initialItem)
  const [pendingNextReminderItem, setPendingNextReminderItem] = useState(null)
  const [toast, setToast] = useState(null)

  useEffect(() => {
    function handleInternalBack(event) {
      if (!selectedType) {
        return
      }

      event.preventDefault()
      setSelectedType('')
      setSimilarDraft(null)
    }

    window.addEventListener('minutiae:back', handleInternalBack)
    return () => window.removeEventListener('minutiae:back', handleInternalBack)
  }, [selectedType])

  function handleSave(item, options) {
    try {
      const result = addLifeItemWithLinkedExpense(item, options)
      setSelectedType('')
      setSimilarDraft(null)
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
        eyebrow={similarDraft ? 'Create a similar item' : 'Capture a household item'}
        description={
          selectedType
            ? similarDraft
              ? 'Review the copied details, add the new date and save when ready.'
              : 'Add just enough detail to make this easy to find and follow up.'
            : 'Add expenses, bills, income, investments, reminders, vendor payments, renewals or records.'
        }
      />

      {selectedType ? (
        <AddItemForm
          key={`${selectedType}-${similarDraft ? 'similar' : 'new'}`}
          initialItem={similarDraft}
          selectedType={selectedType}
          onBack={() => {
            setSelectedType('')
            setSimilarDraft(null)
          }}
          onSave={handleSave}
        />
      ) : (
        <AddItemTypeSelector
          itemTypes={itemTypes}
          onSelectType={(type) => {
            setSimilarDraft(null)
            setSelectedType(type)
          }}
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
