import BottomNav from './BottomNav'

function AppShell({ activePage, children, onNavigate }) {
  const showBottomNav = activePage !== 'settings'

  return (
    <div className="min-h-screen bg-stone-100 text-stone-950">
      <div className="mx-auto flex min-h-screen w-full max-w-md flex-col bg-stone-50 shadow-2xl shadow-stone-300/50">
        <main className={`flex-1 px-4 pt-4 ${showBottomNav ? 'pb-28' : 'pb-6'}`}>
          {children}
        </main>
        {showBottomNav && (
          <BottomNav activePage={activePage} onNavigate={onNavigate} />
        )}
      </div>
    </div>
  )
}

export default AppShell
