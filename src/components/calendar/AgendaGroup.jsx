import {
  formatRelativeDueLabel,
  getRelevantDateLabel,
  getRelevantDate,
} from "../../features/lifeItems/lifeItemHelpers";
import ActionItemCard from "../common/ActionItemCard";

function AgendaGroup({ items, label, onOpenItem, onQuickAction }) {
  if (items.length === 0) {
    return null;
  }

  return (
    <section>
      <h2 className="my-2 text-xs font-bold uppercase tracking-[0.12em] text-stone-500">
        {label}
      </h2>
      <div className="space-y-2">
        {items.map((item) => {
          const contextLabel = getRelevantDateLabel(item);
          const relativeLabel = formatRelativeDueLabel(getRelevantDate(item));

          return (
            <ActionItemCard
              key={item.id}
              item={item}
              dateLabel={
                contextLabel
                  ? `${contextLabel} - ${relativeLabel}`
                  : relativeLabel
              }
              onOpen={onOpenItem}
              onQuickAction={onQuickAction}
            />
          );
        })}
      </div>
    </section>
  );
}

export default AgendaGroup;
