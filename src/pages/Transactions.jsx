import TransactionList from '../components/transactions/TransactionList'

function Transactions({ transactions }) {
  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-lg font-bold text-slate-950">All transactions</h2>
        <p className="mt-1 text-sm text-slate-500">
          A simple list view for income and expenses.
        </p>
      </div>
      <TransactionList transactions={transactions} />
    </section>
  )
}

export default Transactions
