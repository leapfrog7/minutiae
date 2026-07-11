import { useEffect } from 'react'
import ItemCard from '../common/ItemCard'

function SummaryPreviewSheet({
  count,
  description,
  emptyText,
  items,
  onClose,
  onOpenItem,
  suspendBack = false,
  title,
}) {
  useEffect(() => {
    function handleInternalBack(event) {
      if (suspendBack) {
        return
      }

      event.preventDefault()
      onClose()
    }

    window.addEventListener('minutiae:back', handleInternalBack)
    return () => window.removeEventListener('minutiae:back', handleInternalBack)
  }, [onClose, suspendBack])

  return (
    <>
      <div className="fixed inset-0 z-20 bg-stone-950/30" onClick={onClose} />
      <aside
        className="fixed inset-x-0 bottom-0 z-20 mx-auto max-h-[82vh] w-full max-w-md overflow-y-auto rounded-t-3xl bg-stone-50 p-4 shadow-2xl shadow-stone-950/20 md:inset-x-4 md:bottom-auto md:top-1/2 md:max-h-[82vh] md:max-w-xl md:-translate-y-1/2 md:rounded-3xl md:p-5"
        aria-label={title}
      >
        <div className="mx-auto mb-3 h-1 w-12 rounded-full bg-stone-300 md:hidden" />
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs font-bold uppercase tracking-[0.12em] text-teal-700">
              {count} item{count === 1 ? '' : 's'}
            </p>
            <h2 className="mt-1 text-lg font-bold text-stone-950">{title}</h2>
            <p className="mt-1 text-sm leading-5 text-stone-600">
              {description}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full bg-stone-200 px-3 py-2 text-xs font-bold text-stone-700"
          >
            Close
          </button>
        </div>

        <div className="mt-4 grid gap-2">
          {items.length > 0 ? (
            items.map((item) => (
              <ItemCard key={item.id} item={item} onOpen={onOpenItem} />
            ))
          ) : (
            <p className="rounded-xl bg-white px-3 py-4 text-sm font-semibold text-stone-600 ring-1 ring-stone-200">
              {emptyText}
            </p>
          )}
        </div>
      </aside>
    </>
  )
}

export default SummaryPreviewSheet
