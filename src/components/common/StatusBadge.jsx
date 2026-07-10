const toneClasses = {
  amber: 'bg-amber-100 text-amber-800 ring-amber-200',
  emerald: 'bg-emerald-100 text-emerald-800 ring-emerald-200',
  rose: 'bg-rose-100 text-rose-800 ring-rose-200',
  sky: 'bg-sky-100 text-sky-800 ring-sky-200',
  slate: 'bg-stone-100 text-stone-700 ring-stone-200',
  violet: 'bg-violet-100 text-violet-800 ring-violet-200',
}

function StatusBadge({ children, tone = 'slate' }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${toneClasses[tone] ?? toneClasses.slate}`}
    >
      {children}
    </span>
  )
}

export default StatusBadge
