function SectionCard({ action, children, className = '', eyebrow, title }) {
  return (
    <section
      className={`rounded-2xl border border-stone-200 bg-white p-3 shadow-sm shadow-stone-200/60 ${className}`}
    >
      {(eyebrow || title || action) && (
        <div className="mb-2 flex items-start justify-between gap-3">
          <div>
            {eyebrow && (
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-teal-700">
                {eyebrow}
              </p>
            )}
            {title && (
              <h2 className="mt-1 text-sm font-semibold text-stone-950">
                {title}
              </h2>
            )}
          </div>
          {action}
        </div>
      )}
      {children}
    </section>
  )
}

export default SectionCard
