import SummaryCard from '../components/summary/SummaryCard'

function Summary({ totals, transactions }) {
  return (
    <div className="space-y-5">
      <div className="grid gap-3">
        <SummaryCard label="Total income" value={totals.income} tone="income" />
        <SummaryCard label="Total expenses" value={totals.expense} tone="expense" />
        <SummaryCard label="Net balance" value={totals.balance} />
      </div>

      <section className="rounded-lg border border-slate-200 p-4">
        <h2 className="font-bold text-slate-950">Monthly snapshot</h2>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          Charts and category totals will live here after the transaction flow is
          in place.
        </p>
        <p className="mt-4 text-sm font-semibold text-slate-500">
          Tracking {transactions.length} starter transactions
        </p>
      </section>
    </div>
  )
}

export default Summary
