import { getStatusMeta } from '../../data/lifeAdminConstants'
import StatusBadge from '../common/StatusBadge'

function SummaryTile({ detail, status, title, value }) {
  const statusMeta = status ? getStatusMeta(status) : null

  return (
    <article className="rounded-2xl border border-stone-200 bg-white p-3 shadow-sm shadow-stone-200/60">
      <div className="flex items-start justify-between gap-3">
        <h3 className="text-sm font-semibold text-stone-700">{title}</h3>
        {statusMeta && (
          <StatusBadge tone={statusMeta.tone}>{statusMeta.label}</StatusBadge>
        )}
      </div>
      <p className="mt-3 text-2xl font-bold text-stone-950">{value}</p>
      <p className="mt-1 text-xs leading-5 text-stone-500">{detail}</p>
    </article>
  )
}

export default SummaryTile
