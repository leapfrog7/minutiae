import { getStatusMeta } from '../../data/lifeAdminConstants'
import {
  formatAmount,
  formatDisplayDate,
  getItemEmoji,
  getItemTypeLabel,
  getRelevantDate,
} from '../../features/lifeItems/lifeItemHelpers'
import StatusBadge from './StatusBadge'

function ItemCard({ dateLabel, framed = true, item, onOpen, showStatus = true }) {
  const statusMeta = getStatusMeta(item.status)
  const relevantDate = getRelevantDate(item)
  const Wrapper = onOpen ? 'button' : 'article'
  const amount = getDisplayAmount(item)
  const subtitle = getSubtitle(item, dateLabel || formatDisplayDate(relevantDate))
  const detail = getDetail(item)

  return (
    <Wrapper
      type={onOpen ? 'button' : undefined}
      onClick={onOpen ? () => onOpen(item) : undefined}
      className={`flex w-full items-start gap-3 rounded-xl bg-white px-3 py-3 text-left transition hover:bg-teal-50/30 ${
        framed
          ? 'border border-stone-200 shadow-sm shadow-stone-200/40'
          : ''
      }`}
    >
      <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-stone-100 text-lg">
        {getItemEmoji(item)}
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="line-clamp-2 break-words text-sm font-semibold text-stone-950">
              {item.type === 'vendor' ? item.vendorName || item.title : item.title}
            </p>
            <p className="mt-0.5 text-xs text-stone-500">
              {subtitle}
            </p>
          </div>
          {amount > 0 && (
            <p className="max-w-[38%] shrink-0 break-words text-right text-sm font-semibold text-stone-900">
              {formatAmount(amount)}
            </p>
          )}
        </div>
        {(detail ||
          item.sourceName ||
          item.vendorName ||
          item.companyOrDepartment ||
          item.category ||
          item.complaintId ||
          item.notes) && (
          <p className="mt-1 line-clamp-1 break-words text-xs text-stone-500">
            {detail ||
              item.sourceName ||
              item.vendorName ||
              item.companyOrDepartment ||
              item.complaintId ||
              item.category ||
              item.notes}
          </p>
        )}
        {showStatus && item.status && (
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-teal-50 px-2.5 py-1 text-xs font-semibold text-teal-700">
              {getItemTypeLabel(item.type)}
            </span>
            <StatusBadge tone={statusMeta.tone}>{statusMeta.label}</StatusBadge>
          </div>
        )}
      </div>
    </Wrapper>
  )
}

function getDisplayAmount(item) {
  if (item.type === 'vendor') {
    return item.status === 'paid'
      ? Number(item.amountPaid || item.amount || 0)
      : Number(item.amountDue || item.usualAmount || item.monthlyAmount || item.amount || 0)
  }

  return Number(item.amount || 0)
}

function getSubtitle(item, dateLabel) {
  if (item.type === 'vendor') {
    return `${item.serviceType || 'Vendor'} - ${dateLabel}`
  }

  if (item.type === 'income') {
    return `${item.category || 'Income'} - ${dateLabel}`
  }

  return `${getItemTypeLabel(item.type)} - ${dateLabel}`
}

function getDetail(item) {
  if (item.type !== 'vendor') {
    if (item.type === 'income') {
      return item.sourceName || item.category || ''
    }

    return ''
  }

  const bits = []

  if (Number(item.balancePayable || 0) > 0) {
    bits.push(`Balance ${formatAmount(item.balancePayable)}`)
  }

  if (item.contactNumber) {
    bits.push(`Phone ${item.contactNumber}`)
  }

  if (item.upiId) {
    bits.push(`UPI ${item.upiId}`)
  }

  return bits.join(' - ')
}

export default ItemCard
