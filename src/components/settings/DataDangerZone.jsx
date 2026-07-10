import { useState } from 'react'
import {
  clearLifeItems,
  loadDemoLifeItems,
} from '../../features/lifeItems/lifeItemStorage'
import ConfirmDialog from '../common/ConfirmDialog'
import SectionCard from '../common/SectionCard'

function DataDangerZone({ onDataChanged }) {
  const [confirmAction, setConfirmAction] = useState('')
  const [message, setMessage] = useState('')

  function handleLoadDemoData() {
    loadDemoLifeItems()
    onDataChanged()
    setConfirmAction('')
    setMessage('Demo household data loaded.')
  }

  function handleClearAll() {
    clearLifeItems()
    onDataChanged()
    setConfirmAction('')
    setMessage('All local Minutiae data cleared.')
  }

  return (
    <SectionCard title="Local data actions">
      <div className="grid gap-2">
        <button
          type="button"
          onClick={() => setConfirmAction('demo')}
          className="rounded-2xl bg-stone-100 px-4 py-3 text-sm font-bold text-stone-800"
        >
          Load demo data
        </button>
        <p className="px-1 text-xs leading-5 text-stone-500">
          Use this only to preview how Minutiae looks with example household items.
        </p>
        <button
          type="button"
          onClick={() => setConfirmAction('clear')}
          className="rounded-2xl bg-rose-50 px-4 py-3 text-sm font-bold text-rose-700 ring-1 ring-rose-100"
        >
          Clear all data
        </button>
        {message && (
          <p className="rounded-xl bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-700">
            {message}
          </p>
        )}
      </div>

      {confirmAction === 'demo' && (
        <ConfirmDialog
          title="Load demo data?"
          message="This will replace your current local data with example household items."
          confirmLabel="Load demo"
          tone="primary"
          onCancel={() => setConfirmAction('')}
          onConfirm={handleLoadDemoData}
        />
      )}

      {confirmAction === 'clear' && (
        <ConfirmDialog
          title="Clear all data?"
          message="This will permanently remove all Minutiae items stored in this browser."
          confirmLabel="Clear"
          onCancel={() => setConfirmAction('')}
          onConfirm={handleClearAll}
        />
      )}
    </SectionCard>
  )
}

export default DataDangerZone
