import { getStatusMeta } from '../../data/lifeAdminConstants'
import StatusBadge from '../common/StatusBadge'

function SummaryTile({ detail, onClick, status, title, value }) {
  const statusMeta = status ? getStatusMeta(status) : null
  const Component = onClick ? 'button' : 'article'

  return (
    <Component
      type={onClick ? 'button' : undefined}
      onClick={onClick}
      className={`w-full rounded-2xl border border-stone-200 bg-white p-3 text-left shadow-sm shadow-stone-200/60 ${
        onClick ? 'transition hover:bg-teal-50/30 active:scale-[0.99]' : ''
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <h3 className="text-sm font-semibold text-stone-700">{title}</h3>
        {statusMeta && (
          <StatusBadge tone={statusMeta.tone}>{statusMeta.label}</StatusBadge>
        )}
      </div>
      <p className="mt-3 text-2xl font-bold text-stone-950">{value}</p>
      <div className="mt-1 flex items-center justify-between gap-2">
        <p className="text-xs leading-5 text-stone-500">{detail}</p>
        {onClick && (
          <span className="shrink-0 text-xs font-bold text-teal-700">View -&gt;</span>
        )}
      </div>
    </Component>
  )
}

export default SummaryTile
