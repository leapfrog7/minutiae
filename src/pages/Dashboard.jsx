import BalanceCard from '../components/dashboard/BalanceCard'
import TransactionList from '../components/transactions/TransactionList'

function Dashboard({ totals, transactions }) {
  return (
    <div className="space-y-6">
      <BalanceCard totals={totals} />

      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-950">Recent activity</h2>
          <span className="text-sm font-semibold text-emerald-700">
            {transactions.length} items
          </span>
        </div>
        <TransactionList transactions={transactions.slice(0, 3)} />
      </section>
    </div>
  )
}

export default Dashboard
