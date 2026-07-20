import { useEffect, useState } from 'react'
import AddItemForm from '../add/AddItemForm'
import { getStatusMeta } from '../../data/lifeAdminConstants'
import { getItemTypeMeta } from '../../data/itemTypes'
import {
  canRecordPaymentAsExpense,
  canSnoozeItem,
  formatAmount,
  formatCycleLabel,
  formatDisplayDate,
  createTelLink,
  createUpiPaymentLink,
  getQuickStatusAction,
  getBillCycleHistory,
  getDateInputValue,
  getRelevantDate,
  hasLinkedExpense,
  shouldOfferRecordExpense,
} from '../../features/lifeItems/lifeItemHelpers'
import {
  applyNextReminderBehavior,
  getNextReminderToastMessage,
} from '../../features/lifeItems/nextReminderFlow'
import {
  deleteLifeItem,
  getLifeItems,
  markLifeItemPaid,
  recordExpenseForLifeItem,
  snoozeLifeItem,
  updateLifeItem,
  updateLifeItemWithLinkedExpense,
} from '../../features/lifeItems/lifeItemStorage'
import { createSimilarItemDraft } from '../../features/lifeItems/lifeItemDrafts'
import {
  getLifeItemShareSummary,
  getLifeItemShareTitle,
} from '../../features/lifeItems/lifeItemSharing'
import ConfirmDialog from './ConfirmDialog'
import MarkPaidDialog from './MarkPaidDialog'
import NextReminderPrompt from './NextReminderPrompt'
import StatusBadge from './StatusBadge'
import Toast from './Toast'
import { useDialogFocus } from '../../features/ui/useDialogFocus'

function ItemDetailSheet({
  item,
  onClose,
  onItemDeleted,
  onItemUpdated,
  onNavigate,
}) {
  const dialogRef = useDialogFocus(onClose, Boolean(item))
  const [isEditing, setIsEditing] = useState(false)
  const [showPaidConfirm, setShowPaidConfirm] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [copiedValue, setCopiedValue] = useState('')
  const [pendingNextReminderItem, setPendingNextReminderItem] = useState(null)
  const [toast, setToast] = useState(null)

  useEffect(() => {
    function handleInternalBack(event) {
      if (!item) {
        return
      }

      if (pendingNextReminderItem) {
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
  }, [
    isEditing,
    item,
    onClose,
    pendingNextReminderItem,
    showConfirm,
    showPaidConfirm,
  ])

  if (!item) {
    return null
  }

  const typeMeta = getItemTypeMeta(item.type)
  const statusMeta = getStatusMeta(item.status)
  const quickAction = getQuickStatusAction(item)
  const allItems = getLifeItems()
  const expenseRecorded = hasLinkedExpense(allItems, item)
  const canRecordExpense = shouldOfferRecordExpense(item, allItems)
  const billHistory = getBillCycleHistory(allItems, item)
  const showSnoozeActions = canSnoozeItem(item) && !isFinishedForSnooze(item)

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
      offerNextReminder(result.updatedItem)
      onItemUpdated(result.updatedItem)
      return
    }

    const updates =
      item.type === 'income' && quickAction.status === 'received'
        ? { status: quickAction.status, receivedDate: getDateInputValue() }
        : { status: quickAction.status }
    const updatedItem = updateLifeItem(item.id, updates)
    offerNextReminder(updatedItem)
    onItemUpdated(updatedItem)
  }

  function handleConfirmPaid({ recordExpense, updates }) {
    const result = markLifeItemPaid(item, { recordExpense, updates })
    setShowPaidConfirm(false)
    offerNextReminder(result.updatedItem)
    onItemUpdated(result.updatedItem)
  }

  function handleRecordExpense() {
    recordExpenseForLifeItem(item)
    onItemUpdated(item)
  }

  function handleEditSave(updates, options) {
    try {
      const { expenseCreated, updatedItem } = updateLifeItemWithLinkedExpense(
        item.id,
        updates,
        options,
      )
      setIsEditing(false)
      setToast({
        message: expenseCreated ? 'Changes saved and added to Money' : 'Changes saved',
        tone: 'success',
      })
      if (movedToRecurringDoneStatus(item, updatedItem)) {
        offerNextReminder(updatedItem)
      }
      onItemUpdated(updatedItem)
      return true
    } catch {
      setToast({
        message: 'Changes could not be saved. Your form is still open.',
        tone: 'error',
      })
      return false
    }
  }

  function offerNextReminder(updatedItem) {
    const result = applyNextReminderBehavior(updatedItem)

    if (result.behavior === 'ask') {
      setPendingNextReminderItem(updatedItem)
      return
    }

    if (result.behavior === 'auto') {
      setToast({
        message: getNextReminderToastMessage(result),
        tone: 'success',
      })
    }
  }

  function handleNextReminderCreated(result) {
    setToast({
      message: getNextReminderToastMessage(result),
      tone: 'success',
    })
    onItemUpdated(pendingNextReminderItem)
  }

  function handleDelete() {
    try {
      deleteLifeItem(item.id)
      setShowConfirm(false)
      onItemDeleted(item.id)
    } catch {
      setShowConfirm(false)
      setToast({
        message: 'Delete failed. Your item is still saved.',
        tone: 'error',
      })
    }
  }

  async function handleCopy(value, label) {
    if (!value) {
      return
    }

    try {
      await copyText(value)
      setCopiedValue(label)
      window.setTimeout(() => setCopiedValue(''), 1600)
    } catch {
      setToast({ message: 'Could not copy this value.', tone: 'error' })
    }
  }

  function handleCreateSimilar() {
    const initialItem = createSimilarItemDraft(item)

    if (!initialItem || !onNavigate) {
      setToast({ message: 'Could not prepare a similar item.', tone: 'error' })
      return
    }

    onClose()
    onNavigate({
      initialItem,
      page: 'add',
      type: initialItem.type,
    })
  }

  async function handleShareSummary() {
    const text = getLifeItemShareSummary(item)

    if (!text) {
      setToast({ message: 'Could not prepare this summary.', tone: 'error' })
      return
    }

    if (navigator.share) {
      try {
        await navigator.share({
          text,
          title: getLifeItemShareTitle(item),
        })
        setToast({ message: 'Summary shared.', tone: 'success' })
        return
      } catch (error) {
        if (error?.name === 'AbortError') {
          return
        }
      }
    }

    try {
      await copyText(text)
      setToast({ message: 'Summary copied. You can paste it anywhere.', tone: 'success' })
    } catch {
      setToast({ message: 'Could not share or copy this summary.', tone: 'error' })
    }
  }

  function handleSnooze(days) {
    const updatedItem = snoozeLifeItem(item, days)
    setToast({
      message: `Reminder moved to ${formatDisplayDate(getRelevantDate(updatedItem))}`,
      tone: 'success',
    })
    onItemUpdated(updatedItem)
  }

  return (
    <>
      <div className="fixed inset-0 z-20 bg-stone-950/30" onClick={onClose} />
      <aside
        ref={dialogRef}
        className="fixed inset-x-0 bottom-0 z-20 mx-auto max-h-[88vh] w-full max-w-md overflow-y-auto rounded-t-3xl bg-stone-50 p-4 shadow-2xl shadow-stone-950/20 md:inset-x-4 md:bottom-auto md:top-1/2 md:max-h-[86vh] md:max-w-2xl md:-translate-y-1/2 md:rounded-3xl md:p-5"
        aria-label="Item details"
        aria-modal="true"
        role="dialog"
      >
        <div className="mx-auto mb-3 h-1 w-12 rounded-full bg-stone-300 md:hidden" />

        {isEditing ? (
          <AddItemForm
            key={item.id}
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
                data-dialog-initial-focus
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

            {showSnoozeActions && (
              <SnoozeActions onSnooze={handleSnooze} />
            )}

            {item.type === 'bill' && billHistory.length > 1 && (
              <BillCycleHistory currentItem={item} items={billHistory} />
            )}

            <div className="mt-4 grid gap-2 md:grid-cols-2">
              {expenseRecorded && canRecordPaymentAsExpense(item) && (
                <p className="rounded-xl bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-800">
                  {item.type === 'investment'
                    ? 'Included in Money.'
                    : 'Expense recorded in Money.'}
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
                  {['document', 'investment'].includes(item.type)
                    ? 'Add to Money'
                    : 'Record expense'}
                </button>
              )}
              <div className="grid grid-cols-2 gap-2 md:col-span-2">
                <button
                  type="button"
                  onClick={handleCreateSimilar}
                  className="rounded-2xl bg-teal-50 px-3 py-3 text-sm font-bold text-teal-800 ring-1 ring-teal-200"
                >
                  Create similar
                </button>
                <button
                  type="button"
                  onClick={handleShareSummary}
                  className="rounded-2xl bg-sky-50 px-3 py-3 text-sm font-bold text-sky-800 ring-1 ring-sky-200"
                >
                  Share summary
                </button>
              </div>
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

      <NextReminderPrompt
        item={pendingNextReminderItem}
        onClose={() => setPendingNextReminderItem(null)}
        onCreated={handleNextReminderCreated}
      />

      <Toast
        message={toast?.message}
        tone={toast?.tone}
        onDismiss={() => setToast(null)}
      />
    </>
  )
}

function movedToRecurringDoneStatus(previousItem, updatedItem) {
  if (!updatedItem || previousItem?.status === updatedItem.status) {
    return false
  }

  return ['paid', 'completed', 'closed'].includes(updatedItem.status)
}

async function copyText(value) {
  if (navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(value)
      return
    } catch {
      // Fall through to the legacy copy path when clipboard permission is denied.
    }
  }

  const textArea = document.createElement('textarea')
  textArea.value = value
  textArea.setAttribute('readonly', '')
  textArea.style.position = 'fixed'
  textArea.style.opacity = '0'
  document.body.appendChild(textArea)
  textArea.select()

  const copied = document.execCommand('copy')
  textArea.remove()

  if (!copied) {
    throw new Error('Copy failed')
  }
}

function isFinishedForSnooze(item) {
  return ['paid', 'completed', 'closed', 'resolved', 'archived'].includes(item.status)
}

function SnoozeActions({ onSnooze }) {
  const options = [
    { days: 1, label: 'Tomorrow' },
    { days: 3, label: 'In 3 days' },
    { days: 7, label: 'Next week' },
  ]

  return (
    <section className="mt-4 rounded-2xl border border-stone-200 bg-white px-3 py-3">
      <p className="text-xs font-bold uppercase tracking-[0.12em] text-stone-500">
        Remind later
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        {options.map((option) => (
          <button
            key={option.days}
            type="button"
            onClick={() => onSnooze(option.days)}
            className="rounded-2xl bg-stone-100 px-4 py-3 text-sm font-bold text-stone-800"
          >
            {option.label}
          </button>
        ))}
      </div>
    </section>
  )
}

function BillCycleHistory({ currentItem, items }) {
  return (
    <section className="mt-4 rounded-2xl border border-stone-200 bg-white px-3 py-3">
      <p className="text-xs font-bold uppercase tracking-[0.12em] text-stone-500">
        Previous cycles
      </p>
      <div className="mt-3 grid gap-2">
        {items.map((bill) => {
          const isCurrent = bill.id === currentItem.id

          return (
            <div
              key={bill.id}
              className={`rounded-xl px-3 py-2 ring-1 ${
                isCurrent
                  ? 'bg-teal-50 text-teal-900 ring-teal-100'
                  : 'bg-stone-50 text-stone-700 ring-stone-100'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <p className="text-sm font-bold">
                  {formatDisplayDate(String(bill.dueDate || bill.paidDate || bill.createdAt || '').slice(0, 10))}
                </p>
                {Number(bill.amount || 0) > 0 && (
                  <p className="shrink-0 text-sm font-bold">
                    {formatAmount(bill.amount)}
                  </p>
                )}
              </div>
              <p className="mt-1 text-xs font-semibold">
                {isCurrent ? 'Current item' : getBillCycleStatusLabel(bill)}
              </p>
            </div>
          )
        })}
      </div>
    </section>
  )
}

function getBillCycleStatusLabel(bill) {
  const statusMeta = getStatusMeta(bill.status)
  const paidDate = bill.paidDate ? ` - paid ${formatDisplayDate(bill.paidDate)}` : ''
  return `${statusMeta.label}${paidDate}`
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
    investment: [
      ['Investment type', item.investmentType],
      ['Institution', item.institutionName],
      ['Account / folio', item.accountOrFolio],
      ['Due date', formatOptionalDate(item.dueDate)],
      ['Paid date', formatOptionalDate(item.paidDate)],
      ['Frequency', formatCycleLabel(item.frequency)],
      ['Auto-pay', item.autoPay],
    ],
    reminder: [
      ['Due date', formatOptionalDate(item.dueDate)],
      ['Priority', item.priority],
      ['Recurring', item.recurring],
      ['Frequency', formatCycleLabel(item.frequency)],
      ['Related person', item.relatedPerson],
      ['Completed', formatOptionalDate(item.completedAt)],
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
  return value ? formatDisplayDate(String(value).slice(0, 10)) : ''
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
