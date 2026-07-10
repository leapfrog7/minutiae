import BottomNav from './BottomNav'

const pageTitles = {
  dashboard: 'Dashboard',
  add: 'Add Transaction',
  transactions: 'Transactions',
  summary: 'Summary',
  settings: 'Settings',
}

function AppShell({ activePage, children, onNavigate }) {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-950">
      <div className="mx-auto flex min-h-screen w-full max-w-md flex-col bg-white shadow-2xl shadow-slate-200/70">
        <header className="border-b border-slate-200 px-5 pb-4 pt-6">
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-emerald-700">
            Expense Tracker
          </p>
          <h1 className="mt-2 text-2xl font-bold text-slate-950">
            {pageTitles[activePage]}
          </h1>
        </header>

        <main className="flex-1 px-5 py-5 pb-28">{children}</main>

        <BottomNav activePage={activePage} onNavigate={onNavigate} />
      </div>
    </div>
  )
}

export default AppShell
