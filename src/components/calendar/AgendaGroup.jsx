import ItemCard from '../common/ItemCard'

function AgendaGroup({ items, label, onOpenItem }) {
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
          <ItemCard key={item.id} item={item} onOpen={onOpenItem} />
        ))}
      </div>
    </section>
  )
}

export default AgendaGroup
