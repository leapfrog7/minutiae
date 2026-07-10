import { useMemo, useState } from 'react'
import AppShell from './components/layout/AppShell'
import AddTransaction from './pages/AddTransaction'
import Dashboard from './pages/Dashboard'
import Settings from './pages/Settings'
import Summary from './pages/Summary'
import Transactions from './pages/Transactions'
import { sampleTransactions } from './data/sampleTransactions'
import {
  addTransaction,
  getTransactions,
  saveTransactions,
} from './features/transactions/transactionStorage'

const pages = {
  dashboard: Dashboard,
  add: AddTransaction,
  transactions: Transactions,
  summary: Summary,
  settings: Settings,
}

function App() {
  const [activePage, setActivePage] = useState('dashboard')
  const [transactions, setTransactions] = useState(() => {
    const storedTransactions = getTransactions()

    if (storedTransactions.length > 0) {
      return storedTransactions
    }

    saveTransactions(sampleTransactions)
    return sampleTransactions
  })

  function handleAddTransaction(transaction) {
    const newTransaction = addTransaction(transaction)
    setTransactions((currentTransactions) => [
      newTransaction,
      ...currentTransactions,
    ])
  }

  const CurrentPage = pages[activePage]
  const totals = useMemo(() => {
    return transactions.reduce(
      (summary, transaction) => {
        if (transaction.type === 'income') {
          summary.income += transaction.amount
        } else {
          summary.expense += transaction.amount
        }

        summary.balance = summary.income - summary.expense
        return summary
      },
      { income: 0, expense: 0, balance: 0 },
    )
  }, [transactions])

  return (
    <AppShell activePage={activePage} onNavigate={setActivePage}>
      <CurrentPage
        onAddTransaction={handleAddTransaction}
        transactions={transactions}
        totals={totals}
      />
    </AppShell>
  )
}

export default App
