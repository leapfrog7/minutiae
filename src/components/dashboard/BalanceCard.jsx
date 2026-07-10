import { formatCurrency } from '../../features/transactions/formatCurrency'

function BalanceCard({ totals }) {
  return (
    <section className="rounded-lg bg-slate-950 p-5 text-white">
      <p className="text-sm font-medium text-slate-300">Current balance</p>
      <p className="mt-3 text-4xl font-bold">{formatCurrency(totals.balance)}</p>
      <div className="mt-6 grid grid-cols-2 gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Income
          </p>
          <p className="mt-1 text-lg font-bold text-emerald-300">
            {formatCurrency(totals.income)}
          </p>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Expense
          </p>
          <p className="mt-1 text-lg font-bold text-rose-300">
            {formatCurrency(totals.expense)}
          </p>
        </div>
      </div>
    </section>
  )
}

export default BalanceCard
