import { statuses } from '../../data/lifeAdminConstants'
import { getItemTypeMeta } from '../../data/itemTypes'
import { formatCurrency, formatDate } from '../../features/lifeItems/lifeItemFormatters'
import { getRelevantDate } from '../../features/lifeItems/lifeItemHelpers'
import StatusBadge from './StatusBadge'

function ItemCard({ item, onOpen, showStatus = true }) {
  const typeMeta = getItemTypeMeta(item.type)
  const statusMeta = statuses.find((status) => status.id === item.status) ?? {
    label: item.status,
    tone: 'slate',
  }
  const relevantDate = getRelevantDate(item)
  const Wrapper = onOpen ? 'button' : 'article'

  return (
    <Wrapper
      type={onOpen ? 'button' : undefined}
      onClick={onOpen ? () => onOpen(item) : undefined}
      className="flex w-full items-start gap-3 rounded-xl border border-stone-200 bg-white px-3 py-3 text-left shadow-sm shadow-stone-200/40 transition hover:border-teal-200 hover:bg-teal-50/30"
    >
      <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-stone-100 text-lg">
        {typeMeta.emoji}
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-stone-950">
              {item.title}
            </p>
            <p className="mt-0.5 text-xs text-stone-500">
              {typeMeta.label} · {formatDate(relevantDate)}
            </p>
          </div>
          {item.amount > 0 && (
            <p className="shrink-0 text-sm font-semibold text-stone-900">
              {formatCurrency(item.amount)}
            </p>
          )}
        </div>
        {(item.category || item.notes || item.complaintId) && (
          <p className="mt-1 truncate text-xs text-stone-500">
            {item.complaintId || item.category || item.notes}
          </p>
        )}
        {showStatus && item.status && (
          <div className="mt-2">
            <StatusBadge tone={statusMeta.tone}>{statusMeta.label}</StatusBadge>
          </div>
        )}
      </div>
    </Wrapper>
  )
}

export default ItemCard
