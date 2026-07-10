import BottomNav from './BottomNav'

function AppShell({ activePage, children, onNavigate }) {
  return (
    <div className="min-h-screen bg-stone-100 text-stone-950">
      <div className="mx-auto flex min-h-screen w-full max-w-md flex-col bg-stone-50 shadow-2xl shadow-stone-300/50">
        <main className="flex-1 px-4 pb-28 pt-4">{children}</main>
        <BottomNav activePage={activePage} onNavigate={onNavigate} />
      </div>
    </div>
  )
}

export default AppShell
