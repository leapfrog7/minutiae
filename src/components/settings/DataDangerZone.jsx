import { useState } from 'react'
import {
  clearLifeItems,
  resetSampleLifeItems,
} from '../../features/lifeItems/lifeItemStorage'
import ConfirmDialog from '../common/ConfirmDialog'
import SectionCard from '../common/SectionCard'

function DataDangerZone({ onDataChanged }) {
  const [confirmAction, setConfirmAction] = useState('')
  const [message, setMessage] = useState('')

  function handleResetSamples() {
    resetSampleLifeItems()
    onDataChanged()
    setConfirmAction('')
    setMessage('Sample household data restored.')
  }

  function handleClearAll() {
    clearLifeItems()
    onDataChanged()
    setConfirmAction('')
    setMessage('All local Minutiae data cleared.')
  }

  return (
    <SectionCard title="Danger zone">
      <div className="grid gap-2">
        <button
          type="button"
          onClick={() => setConfirmAction('reset')}
          className="rounded-2xl bg-stone-100 px-4 py-3 text-sm font-bold text-stone-800"
        >
          Reset sample data
        </button>
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

      {confirmAction === 'reset' && (
        <ConfirmDialog
          title="Reset sample data?"
          message="This will replace current data with demo household items."
          confirmLabel="Reset"
          tone="primary"
          onCancel={() => setConfirmAction('')}
          onConfirm={handleResetSamples}
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
