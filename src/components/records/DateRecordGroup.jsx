import ItemCard from '../common/ItemCard'

function DateRecordGroup({ dateGroup, onOpenItem }) {
  return (
    <section className="space-y-2">
      <div className="flex items-center justify-between gap-3 px-1">
        <h3 className="text-xs font-bold uppercase tracking-wide text-stone-500">
          {dateGroup.label}
        </h3>
        <span className="shrink-0 text-xs font-semibold text-stone-400">
          {dateGroup.items.length} {dateGroup.items.length === 1 ? 'record' : 'records'}
        </span>
      </div>

      <div className="grid gap-2 md:grid-cols-2 xl:grid-cols-3">
        {dateGroup.items.map((item) => (
          <ItemCard
            key={item.id}
            dateLabel={dateGroup.label}
            item={item}
            onOpen={onOpenItem}
          />
        ))}
      </div>
    </section>
  )
}

export default DateRecordGroup
