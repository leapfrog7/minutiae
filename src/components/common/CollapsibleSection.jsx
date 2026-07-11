import { useState } from 'react'

function CollapsibleSection({
  badge,
  children,
  defaultOpen = false,
  subtitle,
  title,
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen)

  return (
    <section className="rounded-2xl border border-stone-200 bg-white shadow-sm shadow-stone-200/60">
      <button
        type="button"
        onClick={() => setIsOpen((current) => !current)}
        className="flex w-full items-center justify-between gap-3 px-3 py-3 text-left md:px-4"
        aria-expanded={isOpen}
      >
        <span className="min-w-0">
          <span className="block text-sm font-bold text-stone-950">{title}</span>
          {subtitle && (
            <span className="mt-1 block text-xs leading-5 text-stone-500">
              {subtitle}
            </span>
          )}
        </span>
        <span className="flex shrink-0 items-center gap-2">
          {badge && (
            <span className="rounded-full bg-stone-100 px-2.5 py-1 text-xs font-bold text-stone-700">
              {badge}
            </span>
          )}
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-stone-100 text-sm font-bold text-stone-600">
            {isOpen ? '-' : '+'}
          </span>
        </span>
      </button>
      {isOpen && (
        <div className="border-t border-stone-100 px-3 py-3 md:px-4">
          {children}
        </div>
      )}
    </section>
  )
}

export default CollapsibleSection
