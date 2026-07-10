import { useRef, useState } from 'react'
import { itemTypes } from '../../data/itemTypes'
import {
  getLifeItems,
  saveLifeItems,
} from '../../features/lifeItems/lifeItemStorage'
import ConfirmDialog from '../common/ConfirmDialog'
import SectionCard from '../common/SectionCard'

const supportedTypes = new Set(itemTypes.map((item) => item.id))

function BackupRestore({ onDataChanged }) {
  const fileInputRef = useRef(null)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [pendingItems, setPendingItems] = useState(null)

  function handleExport() {
    const items = getLifeItems()
    const exportedAt = new Date().toISOString()
    const payload = {
      app: 'Minutiae',
      version: '0.1.0',
      exportedAt,
      itemCount: items.length,
      items,
    }
    const dateKey = exportedAt.slice(0, 10)
    const blob = new Blob([JSON.stringify(payload, null, 2)], {
      type: 'application/json',
    })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')

    link.href = url
    link.download = `minutiae-backup-${dateKey}.json`
    link.click()
    URL.revokeObjectURL(url)
    setError('')
    setSuccess(`Exported ${items.length} items.`)
  }

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
    saveLifeItems(pendingItems)
    onDataChanged()
    setSuccess(`Imported ${pendingItems.length} items.`)
    setPendingItems(null)
  }

  return (
    <SectionCard title="Backup and restore">
      <div className="grid gap-3">
        <button
          type="button"
          onClick={handleExport}
          className="rounded-2xl bg-teal-700 px-4 py-3 text-sm font-bold text-white"
        >
          Export backup
        </button>

        <label className="block">
          <span className="mb-1 block text-xs font-semibold text-stone-700">
            Import backup
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

  return invalidItem
    ? 'Each item needs id, supported type, and title or vendor name.'
    : ''
}

export default BackupRestore
