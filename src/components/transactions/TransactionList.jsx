import { formatCurrency } from '../../features/transactions/formatCurrency'

function formatDate(date) {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
  }).format(new Date(date))
}

function TransactionList({ transactions }) {
  if (transactions.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-5 text-center">
        <p className="font-semibold text-slate-950">No transactions yet</p>
        <p className="mt-1 text-sm text-slate-500">
          Add your first income or expense to begin tracking.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {transactions.map((transaction) => {
        const isIncome = transaction.type === 'income'
        const title = transaction.note || transaction.category

        return (
          <article
            key={transaction.id}
            className="flex items-center justify-between gap-4 rounded-lg border border-slate-200 bg-white p-4"
          >
            <div className="min-w-0">
              <p className="truncate font-semibold text-slate-950">{title}</p>
              <p className="mt-1 text-sm text-slate-500">
                {transaction.category} - {formatDate(transaction.date)}
              </p>
            </div>
            <p
              className={`shrink-0 font-bold ${
                isIncome ? 'text-emerald-700' : 'text-rose-600'
              }`}
            >
              {isIncome ? '+' : '-'}
              {formatCurrency(transaction.amount)}
            </p>
          </article>
        )
      })}
    </div>
  )
}

export default TransactionList
