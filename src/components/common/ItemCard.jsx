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
              {item.title}
            </p>
            <p className="mt-0.5 text-xs text-stone-500">
              {getItemTypeLabel(item.type)} - {dateLabel || formatDisplayDate(relevantDate)}
            </p>
          </div>
          {item.amount > 0 && (
            <p className="max-w-[38%] shrink-0 break-words text-right text-sm font-semibold text-stone-900">
              {formatAmount(item.amount)}
            </p>
          )}
        </div>
        {(item.vendorName ||
          item.companyOrDepartment ||
          item.category ||
          item.complaintId ||
          item.notes) && (
          <p className="mt-1 line-clamp-1 break-words text-xs text-stone-500">
            {item.vendorName ||
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

export default ItemCard
