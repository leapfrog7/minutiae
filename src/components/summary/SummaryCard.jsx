import { formatCurrency } from '../../features/transactions/formatCurrency'

function SummaryCard({ label, value, tone = 'neutral' }) {
  const tones = {
    neutral: 'border-slate-200 bg-white text-slate-950',
    income: 'border-emerald-200 bg-emerald-50 text-emerald-800',
    expense: 'border-rose-200 bg-rose-50 text-rose-700',
  }

  return (
    <div className={`rounded-lg border p-4 ${tones[tone]}`}>
      <p className="text-sm font-semibold text-slate-600">{label}</p>
      <p className="mt-2 text-2xl font-bold">{formatCurrency(value)}</p>
    </div>
  )
}

export default SummaryCard
