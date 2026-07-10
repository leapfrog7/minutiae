import { useEffect, useState } from 'react'
import { calculateVendorSettlement } from '../../features/lifeItems/lifeItemHelpers'

function MarkPaidDialog({ duplicateExpense = false, item, onCancel, onConfirm }) {
  const [recordExpense, setRecordExpense] = useState(!duplicateExpense)
  const isVendor = item?.type === 'vendor'
  const [vendorUpdates, setVendorUpdates] = useState(() => ({
    adjustmentAmount: item?.adjustmentAmount || '',
    advanceAdjusted: item?.advanceAdjusted || '',
    amountPaid: item?.amountPaid || item?.amountDue || item?.amount || item?.monthlyAmount || '',
    balancePayable: item?.balancePayable || '',
    paymentMode: item?.paymentMode || 'UPI',
  }))
  const settlement = calculateVendorSettlement({
    ...item,
    ...vendorUpdates,
  })

  useEffect(() => {
    function handleInternalBack(event) {
      event.preventDefault()
      onCancel()
    }

    window.addEventListener('minutiae:back', handleInternalBack)
    return () => window.removeEventListener('minutiae:back', handleInternalBack)
  }, [onCancel])

  function updateVendorField(field, value) {
    setVendorUpdates((current) => ({ ...current, [field]: value }))
  }

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
          Add this payment to Money as an expense too?
        </p>

        {isVendor && (
          <div className="mt-4 grid gap-2 rounded-2xl bg-stone-50 px-3 py-3">
            <div className="grid grid-cols-2 gap-2">
              <CompactField label="Paid">
                <CompactInput
                  type="number"
                  min="0"
                  inputMode="decimal"
                  value={vendorUpdates.amountPaid}
                  onChange={(event) => updateVendorField('amountPaid', event.target.value)}
                />
              </CompactField>
              <CompactField label="Payment">
                <select
                  value={vendorUpdates.paymentMode}
                  onChange={(event) => updateVendorField('paymentMode', event.target.value)}
                  className="w-full rounded-xl border border-stone-200 bg-white px-2 py-2 text-sm text-stone-950"
                >
                  {['UPI', 'Cash', 'Card', 'Bank Transfer', 'Auto Debit', 'Other'].map((mode) => (
                    <option key={mode} value={mode}>{mode}</option>
                  ))}
                </select>
              </CompactField>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <CompactField label="Adjust">
                <CompactInput
                  type="number"
                  min="0"
                  inputMode="decimal"
                  value={vendorUpdates.adjustmentAmount}
                  onChange={(event) => updateVendorField('adjustmentAmount', event.target.value)}
                />
              </CompactField>
              <CompactField label="Adv. adjusted">
                <CompactInput
                  type="number"
                  min="0"
                  inputMode="decimal"
                  value={vendorUpdates.advanceAdjusted}
                  onChange={(event) => updateVendorField('advanceAdjusted', event.target.value)}
                />
              </CompactField>
            </div>
            <div className="rounded-xl bg-white px-3 py-2 text-xs font-semibold text-stone-600 ring-1 ring-stone-200">
              Net due: {settlement.netDue.toLocaleString('en-IN')} · Balance: {settlement.balancePayable.toLocaleString('en-IN')}
            </div>
          </div>
        )}

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
              Add this payment to Money
            </span>
            <span className="mt-1 block text-xs leading-5 text-stone-500">
              {duplicateExpense
                ? 'An expense is already linked to this item.'
                : 'Creates a linked paid expense for this item.'}
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
            onClick={() =>
              onConfirm({
                recordExpense,
                updates: isVendor
                  ? {
                      ...vendorUpdates,
                      amountPaid: Number(vendorUpdates.amountPaid || 0),
                      adjustmentAmount: Number(vendorUpdates.adjustmentAmount || 0),
                      advanceAdjusted: Number(vendorUpdates.advanceAdjusted || 0),
                      balancePayable:
                        vendorUpdates.balancePayable === ''
                          ? settlement.balancePayable
                          : Number(vendorUpdates.balancePayable || 0),
                      amount: Number(vendorUpdates.amountPaid || item?.amount || 0),
                    }
                  : {},
              })
            }
            className="rounded-2xl bg-teal-700 px-4 py-3 text-sm font-bold text-white"
          >
            Mark Paid
          </button>
        </div>
      </div>
    </div>
  )
}

function CompactField({ children, label }) {
  return (
    <label>
      <span className="text-xs font-bold text-stone-600">{label}</span>
      <div className="mt-1">{children}</div>
    </label>
  )
}

function CompactInput(props) {
  return (
    <input
      className="w-full rounded-xl border border-stone-200 bg-white px-2 py-2 text-sm text-stone-950"
      {...props}
    />
  )
}

export default MarkPaidDialog
