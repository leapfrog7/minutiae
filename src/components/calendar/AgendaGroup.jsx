import {
  formatRelativeDueLabel,
  getRelevantDate,
} from '../../features/lifeItems/lifeItemHelpers'
import ActionItemCard from '../common/ActionItemCard'

function AgendaGroup({ items, label, onOpenItem, onQuickAction }) {
  if (items.length === 0) {
    return null
  }

  return (
    <section>
      <h2 className="mb-2 text-xs font-bold uppercase tracking-[0.12em] text-stone-500">
        {label}
      </h2>
      <div className="space-y-2">
        {items.map((item) => (
          <ActionItemCard
            key={item.id}
            item={item}
            dateLabel={formatRelativeDueLabel(getRelevantDate(item))}
            onOpen={onOpenItem}
            onQuickAction={onQuickAction}
          />
        ))}
      </div>
    </section>
  )
}

export default AgendaGroup
