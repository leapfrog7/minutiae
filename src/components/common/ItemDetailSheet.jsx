import { useEffect, useState } from 'react'
import AddItemForm from '../add/AddItemForm'
import { getStatusMeta } from '../../data/lifeAdminConstants'
import { getItemTypeMeta } from '../../data/itemTypes'
import {
  canRecordPaymentAsExpense,
  formatAmount,
  formatCycleLabel,
  formatDisplayDate,
  createTelLink,
  createUpiPaymentLink,
  getQuickStatusAction,
  getRelevantDate,
  hasLinkedExpense,
  shouldOfferRecordExpense,
} from '../../features/lifeItems/lifeItemHelpers'
import {
  deleteLifeItem,
  getLifeItems,
  markLifeItemPaid,
  recordExpenseForLifeItem,
  updateLifeItem,
  updateLifeItemWithLinkedExpense,
} from '../../features/lifeItems/lifeItemStorage'
import ConfirmDialog from './ConfirmDialog'
import MarkPaidDialog from './MarkPaidDialog'
import StatusBadge from './StatusBadge'

function ItemDetailSheet({ item, onClose, onItemDeleted, onItemUpdated }) {
  const [isEditing, setIsEditing] = useState(false)
  const [showPaidConfirm, setShowPaidConfirm] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [copiedValue, setCopiedValue] = useState('')

  useEffect(() => {
    function handleInternalBack(event) {
      if (!item) {
        return
      }

      event.preventDefault()

      if (showConfirm) {
        setShowConfirm(false)
        return
      }

      if (showPaidConfirm) {
        setShowPaidConfirm(false)
        return
      }

      if (isEditing) {
        setIsEditing(false)
        return
      }

      onClose()
    }

    window.addEventListener('minutiae:back', handleInternalBack)
    return () => window.removeEventListener('minutiae:back', handleInternalBack)
  }, [isEditing, item, onClose, showConfirm, showPaidConfirm])

  if (!item) {
    return null
  }

  const typeMeta = getItemTypeMeta(item.type)
  const statusMeta = getStatusMeta(item.status)
  const quickAction = getQuickStatusAction(item)
  const allItems = getLifeItems()
  const expenseRecorded = hasLinkedExpense(allItems, item)
  const canRecordExpense = shouldOfferRecordExpense(item, allItems)

  function handleQuickAction() {
    if (!quickAction) {
      return
    }

    if (quickAction.status === 'paid' && canRecordPaymentAsExpense(item)) {
      setShowPaidConfirm(true)
      return
    }

    if (quickAction.status === 'paid') {
      const result = markLifeItemPaid(item)
      onItemUpdated(result.updatedItem)
      return
    }

    const updates =
      item.type === 'income' && quickAction.status === 'received'
        ? { status: quickAction.status, receivedDate: new Date().toISOString().slice(0, 10) }
        : { status: quickAction.status }
    const updatedItem = updateLifeItem(item.id, updates)
    onItemUpdated(updatedItem)
  }

  function handleConfirmPaid({ recordExpense, updates }) {
    const result = markLifeItemPaid(item, { recordExpense, updates })
    setShowPaidConfirm(false)
    onItemUpdated(result.updatedItem)
  }

  function handleRecordExpense() {
    recordExpenseForLifeItem(item)
    onItemUpdated(item)
  }

  function handleEditSave(updates, options) {
    const { updatedItem } = updateLifeItemWithLinkedExpense(
      item.id,
      updates,
      options,
    )
    setIsEditing(false)
    onItemUpdated(updatedItem)
  }

  function handleDelete() {
    deleteLifeItem(item.id)
    setShowConfirm(false)
    onItemDeleted(item.id)
  }

  function handleCopy(value, label) {
    if (!navigator.clipboard || !value) {
      return
    }

    navigator.clipboard.writeText(value).then(() => {
      setCopiedValue(label)
      window.setTimeout(() => setCopiedValue(''), 1600)
    })
  }

  return (
    <>
      <div className="fixed inset-0 z-20 bg-stone-950/30" onClick={onClose} />
      <aside
        className="fixed inset-x-0 bottom-0 z-20 mx-auto max-h-[88vh] w-full max-w-md overflow-y-auto rounded-t-3xl bg-stone-50 p-4 shadow-2xl shadow-stone-950/20 md:inset-x-4 md:bottom-auto md:top-1/2 md:max-h-[86vh] md:max-w-2xl md:-translate-y-1/2 md:rounded-3xl md:p-5"
        aria-label="Item details"
      >
        <div className="mx-auto mb-3 h-1 w-12 rounded-full bg-stone-300 md:hidden" />

        {isEditing ? (
          <AddItemForm
            mode="edit"
            selectedType={item.type}
            initialItem={item}
            onCancel={() => setIsEditing(false)}
            onSave={handleEditSave}
          />
        ) : (
          <>
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-teal-700">
                  {typeMeta.emoji} {typeMeta.label}
                </p>
                <h2 className="mt-1 break-words text-lg font-bold text-stone-950">
                  {item.title}
                </h2>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="rounded-full bg-stone-200 px-3 py-2 text-xs font-bold text-stone-700"
                aria-label="Close item details"
              >
                Close
              </button>
            </div>

            <div className="mt-3 flex flex-wrap items-center gap-2">
              {item.status && (
                <StatusBadge tone={statusMeta.tone}>{statusMeta.label}</StatusBadge>
              )}
              {item.amount > 0 && (
                <span className="rounded-full bg-white px-3 py-1 text-sm font-bold text-stone-900 ring-1 ring-stone-200">
                  {formatAmount(item.amount)}
                </span>
              )}
            </div>

            <div className="mt-4 grid gap-2 md:grid-cols-2">
              <DetailRow label="Type" value={typeMeta.label} />
              <DetailRow label="Relevant date" value={formatDisplayDate(getRelevantDate(item))} />
              <DetailRow label="Category" value={item.category} />
              <DetailRow label="Payment" value={item.paymentMode} />
              <DetailRow label="Notes" value={item.notes} />
              {getSpecificRows(item).map((row) => (
                <DetailRow key={row.label} {...row} />
              ))}
            </div>

            {item.type === 'vendor' && (
              <VendorPaymentActions
                copiedValue={copiedValue}
                item={item}
                onCopy={handleCopy}
              />
            )}

            {item.type === 'document' && item.contactNumber && (
              <RecordContactActions item={item} />
            )}

            <div className="mt-4 grid gap-2 md:grid-cols-2">
              {expenseRecorded && canRecordPaymentAsExpense(item) && (
                <p className="rounded-xl bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-800">
                  Expense recorded in Money.
                </p>
              )}
              {quickAction && (
                <button
                  type="button"
                  onClick={handleQuickAction}
                  className="rounded-2xl bg-teal-700 px-4 py-3 text-sm font-bold text-white md:col-span-2"
                >
                  {quickAction.label}
                </button>
              )}
              {canRecordExpense && (
                <button
                  type="button"
                  onClick={handleRecordExpense}
                  className="rounded-2xl bg-teal-700 px-4 py-3 text-sm font-bold text-white md:col-span-2"
                >
                  {item.type === 'document' ? 'Add to Money' : 'Record expense'}
                </button>
              )}
              <div className="grid grid-cols-2 gap-2 md:col-span-2">
                <button
                  type="button"
                  onClick={() => setIsEditing(true)}
                  className="rounded-2xl bg-stone-900 px-4 py-3 text-sm font-bold text-white"
                >
                  Edit
                </button>
                <button
                  type="button"
                  onClick={() => setShowConfirm(true)}
                  className="rounded-2xl bg-rose-50 px-4 py-3 text-sm font-bold text-rose-700"
                >
                  Delete
                </button>
              </div>
            </div>
          </>
        )}
      </aside>

      {showConfirm && (
        <ConfirmDialog
          title="Delete this item?"
          message="This cannot be undone."
          onCancel={() => setShowConfirm(false)}
          onConfirm={handleDelete}
        />
      )}

      {showPaidConfirm && (
        <MarkPaidDialog
          duplicateExpense={hasLinkedExpense(getLifeItems(), item)}
          item={item}
          onCancel={() => setShowPaidConfirm(false)}
          onConfirm={handleConfirmPaid}
        />
      )}
    </>
  )
}

function VendorPaymentActions({ copiedValue, item, onCopy }) {
  const upiLink = createUpiPaymentLink(item)
  const telLink = createTelLink(item.contactNumber)
  const hasCopyActions = item.upiId || item.contactNumber

  if (!upiLink && !telLink && !hasCopyActions) {
    return null
  }

  return (
    <section className="mt-4 rounded-2xl border border-teal-100 bg-white px-3 py-3">
      <p className="text-xs font-bold uppercase tracking-[0.12em] text-teal-700">
        Vendor actions
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        {upiLink && (
          <a
            href={upiLink}
            className="rounded-2xl bg-teal-700 px-4 py-3 text-sm font-bold text-white"
          >
            Pay with UPI
          </a>
        )}
        {telLink && (
          <a
            href={telLink}
            className="rounded-2xl bg-stone-900 px-4 py-3 text-sm font-bold text-white"
          >
            Call
          </a>
        )}
        {item.upiId && (
          <button
            type="button"
            onClick={() => onCopy(item.upiId, 'upi')}
            className="rounded-2xl bg-stone-100 px-4 py-3 text-sm font-bold text-stone-800"
          >
            {copiedValue === 'upi' ? 'Copied' : 'Copy UPI'}
          </button>
        )}
        {item.contactNumber && (
          <button
            type="button"
            onClick={() => onCopy(item.contactNumber, 'number')}
            className="rounded-2xl bg-stone-100 px-4 py-3 text-sm font-bold text-stone-800"
          >
            {copiedValue === 'number' ? 'Copied' : 'Copy number'}
          </button>
        )}
      </div>
      {(upiLink || telLink) && (
        <p className="mt-3 text-xs leading-5 text-stone-500">
          After payment, return to Minutiae and mark this as paid.
        </p>
      )}
    </section>
  )
}

function RecordContactActions({ item }) {
  const telLink = createTelLink(item.contactNumber)

  if (!telLink) {
    return null
  }

  return (
    <section className="mt-4 rounded-2xl border border-stone-200 bg-white px-3 py-3">
      <p className="text-xs font-bold uppercase tracking-[0.12em] text-stone-500">
        Contact
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        <a
          href={telLink}
          className="rounded-2xl bg-stone-900 px-4 py-3 text-sm font-bold text-white"
        >
          Call
        </a>
      </div>
    </section>
  )
}

function DetailRow({ label, value }) {
  if (value === undefined || value === null || value === '') {
    return null
  }

  const displayValue =
    typeof value === 'boolean' ? (value ? 'Yes' : 'No') : String(value)

  return (
    <div className="rounded-xl bg-white px-3 py-2 ring-1 ring-stone-200">
      <p className="text-[11px] font-bold uppercase tracking-[0.1em] text-stone-500">
        {label}
      </p>
      <p className="mt-1 break-words text-sm font-medium text-stone-900">{displayValue}</p>
    </div>
  )
}

function getSpecificRows(item) {
  const rowsByType = {
    subscription: [
      ['Billing cycle', formatCycleLabel(item.billingCycle)],
      ['Renewal', formatOptionalDate(item.renewalDate)],
      ['Auto-renewal', item.autoRenewal],
      ['Cancel before', formatOptionalDate(item.cancelBeforeDate)],
    ],
    bill: [
      ['Due date', formatOptionalDate(item.dueDate)],
      ['Frequency', formatCycleLabel(item.frequency)],
      ['Paid date', formatOptionalDate(item.paidDate)],
      ['Receipt', item.receiptName],
    ],
    insurance: [
      ['Policy type', item.policyType],
      ['Insurer', item.insurerName],
      ['Policy number', item.policyNumber],
      ['Premium', formatAmount(item.premiumAmount || item.amount)],
      ['Due date', formatOptionalDate(item.dueDate)],
      ['Frequency', formatCycleLabel(item.frequency)],
      ['Paid date', formatOptionalDate(item.paidDate)],
    ],
    vendor: [
      ['Vendor', item.vendorName],
      ['Service', item.serviceType],
      ['Phone', item.contactNumber],
      ['UPI ID', item.upiId],
      ['Usual amount', formatAmount(item.usualAmount || item.monthlyAmount)],
      ['Payment frequency', formatCycleLabel(item.paymentFrequency)],
      ['Payment month', item.paymentMonth],
      ['Payment date', formatOptionalDate(item.paymentDate)],
      ['Amount due', formatAmount(item.amountDue || item.amount)],
      ['Adjustment', formatAmount(item.adjustmentAmount)],
      ['Advance', formatAmount(item.advanceGiven)],
      ['Advance adjusted', formatAmount(item.advanceAdjusted)],
      ['Amount paid', formatAmount(item.amountPaid)],
      ['Balance', formatAmount(item.balancePayable)],
    ],
    complaint: [
      ['Complaint ID', item.complaintId],
      ['Company / dept', item.companyOrDepartment],
      ['Raised', formatOptionalDate(item.dateRaised)],
      ['Expected', formatOptionalDate(item.expectedResolutionDate)],
      ['Follow-up', formatOptionalDate(item.followUpDate)],
      ['Phone', item.contactNumber],
    ],
    expense: [
      ['Date', formatOptionalDate(item.date)],
      ['Paid date', formatOptionalDate(item.paidDate)],
      ['Recurring', item.recurring],
    ],
    income: [
      ['Date', formatOptionalDate(item.date)],
      ['Received date', formatOptionalDate(item.receivedDate)],
      ['Source', item.sourceName],
      ['Recurring', item.recurring],
      ['Frequency', formatCycleLabel(item.frequency)],
    ],
    document: [
      ['Record type', item.recordType || item.documentType || 'Receipt'],
      ['Related to', item.relatedTo],
      ['Amount', formatAmount(item.amount)],
      ['Status', item.status],
      ['Document date', formatOptionalDate(item.documentDate)],
      ['Service date', formatOptionalDate(item.serviceDate)],
      [
        'Next service due',
        formatDateWithInterval(item.nextServiceDate, item.nextServiceInterval),
      ],
      ['Expiry', formatDateWithInterval(item.expiryDate, item.expiryInterval)],
      [
        'Warranty till',
        formatDateWithInterval(item.warrantyTill, item.warrantyInterval),
      ],
      ['Service interval', formatCycleLabel(item.serviceInterval)],
      ['Vendor/service person', item.vendorName],
      ['Contact number', item.contactNumber],
      ['Parts replaced', item.partsReplaced],
      ['Reference number', item.referenceNumber],
      ['Attachment note', item.attachmentNote],
    ],
  }

  return (rowsByType[item.type] ?? []).map(([label, value]) => ({ label, value }))
}

function formatOptionalDate(value) {
  return value ? formatDisplayDate(value) : ''
}

function formatDateWithInterval(dateValue, interval) {
  const formattedDate = formatOptionalDate(dateValue)
  const intervalLabel = getIntervalLabel(interval)

  return [formattedDate, intervalLabel].filter(Boolean).join(' - ')
}

function getIntervalLabel(interval) {
  const labels = {
    '3m': '3 months',
    '6m': '6 months',
    '9m': '9 months',
    '1y': '1 year',
    '2y': '2 years',
    '3y': '3 years',
    '5y': '5 years',
  }

  return labels[interval] || ''
}

export default ItemDetailSheet
