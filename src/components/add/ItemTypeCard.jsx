function ItemTypeCard({ description, emoji, label, onSelect }) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className="w-full rounded-2xl border border-stone-200 bg-white p-3 text-left shadow-sm shadow-stone-200/50 transition hover:border-teal-200 hover:bg-teal-50/40"
    >
      <div className="flex items-start gap-3">
        <span
          aria-hidden="true"
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-white text-xl shadow-sm ring-1 ring-stone-200"
        >
          {emoji}
        </span>
        <div className="min-w-0 flex-1">
          <h2 className="text-sm font-semibold text-stone-950">{label}</h2>
          <p className="mt-1 text-xs leading-5 text-stone-500">{description}</p>
        </div>
        <span className="pt-1 text-lg text-stone-400" aria-hidden="true">
          &gt;
        </span>
      </div>
    </button>
  )
}

export default ItemTypeCard
