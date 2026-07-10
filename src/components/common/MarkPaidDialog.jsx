import { useState } from 'react'

function MarkPaidDialog({ duplicateExpense = false, onCancel, onConfirm }) {
  const [recordExpense, setRecordExpense] = useState(!duplicateExpense)

  return (
    <div
      className="fixed inset-0 z-30 flex items-center justify-center bg-stone-950/40 px-4"
      role="dialog"
      aria-modal="true"
      aria-label="Mark as paid"
    >
      <div className="w-full max-w-sm rounded-2xl bg-white p-4 shadow-2xl shadow-stone-950/20">
        <h2 className="text-base font-bold text-stone-950">Mark as paid?</h2>
        <p className="mt-2 text-sm leading-6 text-stone-600">
          Add this payment to Money as an expense too.
        </p>

        <label className="mt-4 flex items-start gap-3 rounded-2xl bg-stone-50 px-3 py-3">
          <input
            type="checkbox"
            checked={recordExpense}
            disabled={duplicateExpense}
            onChange={(event) => setRecordExpense(event.target.checked)}
            className="mt-1 h-4 w-4 rounded border-stone-300 text-teal-700 focus:ring-teal-600"
          />
          <span>
            <span className="block text-sm font-bold text-stone-900">
              Record as expense
            </span>
            <span className="mt-1 block text-xs leading-5 text-stone-500">
              {duplicateExpense
                ? 'An expense is already linked to this item.'
                : 'This creates a linked expense for today.'}
            </span>
          </span>
        </label>

        <div className="mt-4 grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-2xl bg-stone-100 px-4 py-3 text-sm font-bold text-stone-800"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => onConfirm({ recordExpense })}
            className="rounded-2xl bg-teal-700 px-4 py-3 text-sm font-bold text-white"
          >
            Mark Paid
          </button>
        </div>
      </div>
    </div>
  )
}

export default MarkPaidDialog
