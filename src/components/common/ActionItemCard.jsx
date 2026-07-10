import { getQuickStatusAction } from '../../features/lifeItems/lifeItemHelpers'
import ItemCard from './ItemCard'

function ActionItemCard({ dateLabel, item, onOpen, onQuickAction }) {
  const quickAction = getQuickStatusAction(item)

  return (
    <div className="overflow-hidden rounded-xl border border-stone-200 bg-white shadow-sm shadow-stone-200/40">
      <ItemCard
        dateLabel={dateLabel}
        framed={false}
        item={item}
        onOpen={onOpen}
        showStatus={false}
      />
      <div className="flex items-center justify-between gap-2 border-t border-stone-100 px-3 py-2">
        <span className="truncate text-xs font-semibold text-stone-500">
          {dateLabel}
        </span>
        {quickAction && (
          <button
            type="button"
            onClick={() => onQuickAction(item)}
            className="shrink-0 rounded-full bg-teal-700 px-3 py-2 text-xs font-bold text-white"
          >
            {quickAction.label}
          </button>
        )}
      </div>
    </div>
  )
}

export default ActionItemCard
