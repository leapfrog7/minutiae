import { useRef, useState } from 'react'
import { itemTypes } from '../../data/itemTypes'
import {
  saveLifeItems,
} from '../../features/lifeItems/lifeItemStorage'
import ConfirmDialog from '../common/ConfirmDialog'
import SectionCard from '../common/SectionCard'

const supportedTypes = new Set(itemTypes.map((item) => item.id))
const numericFields = [
  'amount',
  'premiumAmount',
  'usualAmount',
  'monthlyAmount',
  'amountDue',
  'amountPaid',
  'adjustmentAmount',
  'advanceGiven',
  'advanceAdjusted',
  'balancePayable',
]

function BackupRestore({ onDataChanged }) {
  const fileInputRef = useRef(null)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [pendingItems, setPendingItems] = useState(null)

  function handleImportFile(event) {
    const file = event.target.files?.[0]

    setError('')
    setSuccess('')

    if (!file) {
      return
    }

    const reader = new FileReader()

    reader.onload = () => {
      try {
        const parsed = JSON.parse(reader.result)
        const items = Array.isArray(parsed) ? parsed : parsed.items
        const validationError = validateItems(items)

        if (validationError) {
          setError(validationError)
          return
        }

        setPendingItems(items)
      } catch {
        setError('Import failed. Choose a valid JSON backup.')
      } finally {
        if (fileInputRef.current) {
          fileInputRef.current.value = ''
        }
      }
    }

    reader.readAsText(file)
  }

  function confirmImport() {
    try {
      saveLifeItems(pendingItems)
      onDataChanged()
      setError('')
      setSuccess(`Imported ${pendingItems.length} items.`)
      setPendingItems(null)
    } catch {
      setError('Import could not be saved. Your existing data is unchanged.')
      setSuccess('')
    }
  }

  return (
    <SectionCard eyebrow="Bring data back" title="Restore from backup">
      <div className="grid gap-3">
        <p className="text-sm leading-6 text-stone-600">
          Choose a Minutiae JSON backup to replace the data currently stored on
          this device. You can review the confirmation before anything changes.
        </p>

        <label className="block">
          <span className="mb-2 block text-xs font-bold uppercase tracking-[0.1em] text-stone-500">
            Backup file
          </span>
          <input
            ref={fileInputRef}
            type="file"
            accept="application/json,.json"
            onChange={handleImportFile}
            className="block w-full rounded-2xl border border-stone-200 bg-white px-3 py-3 text-sm text-stone-700 file:mr-3 file:rounded-full file:border-0 file:bg-stone-100 file:px-3 file:py-2 file:text-xs file:font-bold file:text-stone-700"
          />
        </label>

        {error && (
          <p className="rounded-xl bg-rose-50 px-3 py-2 text-sm font-semibold text-rose-700">
            {error}
          </p>
        )}
        {success && (
          <p className="rounded-xl bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-700">
            {success}
          </p>
        )}
      </div>

      {pendingItems && (
        <ConfirmDialog
          title="Replace current data?"
          message="This will replace all items currently stored on this device."
          confirmLabel="Import"
          tone="primary"
          onCancel={() => setPendingItems(null)}
          onConfirm={confirmImport}
        />
      )}
    </SectionCard>
  )
}

function validateItems(items) {
  if (!Array.isArray(items)) {
    return 'Backup must contain an items array.'
  }

  const invalidItem = items.find((item) => {
    return (
      !item ||
      !item.id ||
      !item.type ||
      (!item.title && !item.vendorName) ||
      !supportedTypes.has(item.type)
    )
  })

  if (invalidItem) {
    return 'Each item needs id, supported type, and title or vendor name.'
  }

  const ids = new Set()
  const duplicateId = items.find((item) => {
    if (ids.has(item.id)) {
      return true
    }

    ids.add(item.id)
    return false
  })

  if (duplicateId) {
    return `Backup contains a duplicate item ID: ${duplicateId.id}.`
  }

  const invalidAmountItem = items.find((item) =>
    numericFields.some(
      (field) =>
        item[field] !== undefined &&
        item[field] !== '' &&
        (!Number.isFinite(Number(item[field])) || Number(item[field]) < 0),
    ),
  )

  if (invalidAmountItem) {
    return `Backup contains an invalid amount for ${invalidAmountItem.title || invalidAmountItem.vendorName}.`
  }

  const orphanedExpense = items.find(
    (item) =>
      item.type === 'expense' &&
      item.linkedItemId &&
      !ids.has(item.linkedItemId),
  )

  if (orphanedExpense) {
    return `Linked expense has no source item: ${orphanedExpense.title}.`
  }

  const linkedSourceIds = new Set()
  const duplicateLinkedExpense = items.find((item) => {
    if (item.type !== 'expense' || !item.linkedItemId) {
      return false
    }

    if (linkedSourceIds.has(item.linkedItemId)) {
      return true
    }

    linkedSourceIds.add(item.linkedItemId)
    return false
  })

  if (duplicateLinkedExpense) {
    return `Backup contains more than one linked expense for ${duplicateLinkedExpense.title}.`
  }

  return ''
}

export default BackupRestore
