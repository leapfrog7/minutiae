import BottomNav, { navItems } from './BottomNav'

function AppShell({ activePage, children, onNavigate }) {
  const showBottomNav = activePage !== 'settings'

  return (
    <div className="min-h-screen bg-stone-100 text-stone-950 lg:bg-stone-200/70">
      <div className="mx-auto flex min-h-screen w-full max-w-md flex-col bg-stone-50 shadow-2xl shadow-stone-300/50 md:max-w-3xl lg:max-w-7xl lg:flex-row lg:bg-transparent lg:px-6 lg:py-6 lg:shadow-none xl:px-8">
        {showBottomNav && (
          <DesktopNav activePage={activePage} onNavigate={onNavigate} />
        )}
        <main className={`min-w-0 flex-1 px-4 pt-4 md:px-6 md:pt-6 lg:mx-auto lg:max-w-5xl lg:rounded-3xl lg:border lg:border-stone-200 lg:bg-stone-50 lg:px-8 lg:py-7 lg:shadow-xl lg:shadow-stone-300/40 ${showBottomNav ? 'pb-28 lg:pb-8' : 'pb-6 lg:pb-8'}`}>
          {children}
        </main>
        {showBottomNav && (
          <BottomNav activePage={activePage} onNavigate={onNavigate} />
        )}
      </div>
    </div>
  )
}

function DesktopNav({ activePage, onNavigate }) {
  return (
    <aside className="sticky top-6 hidden h-[calc(100vh-3rem)] w-56 shrink-0 pr-5 lg:block">
      <div className="flex h-full flex-col rounded-3xl border border-stone-200 bg-white/85 p-3 shadow-xl shadow-stone-300/40 backdrop-blur">
        <div className="px-3 py-3">
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-teal-700">
            Minutiae
          </p>
          <p className="mt-1 text-sm font-semibold text-stone-600">
            Life admin
          </p>
        </div>
        <nav className="mt-2 grid gap-1" aria-label="Main navigation">
          {navItems.map((item) => {
            const isActive = item.id === activePage

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onNavigate(item.id)}
                className={`flex items-center gap-3 rounded-2xl px-3 py-3 text-left text-sm font-bold transition ${
                  isActive
                    ? 'bg-teal-700 text-white shadow-sm shadow-teal-900/20'
                    : 'text-stone-600 hover:bg-stone-100 hover:text-stone-950'
                }`}
                aria-current={isActive ? 'page' : undefined}
              >
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white/70 text-base text-stone-900">
                  {item.icon}
                </span>
                <span>{item.label}</span>
              </button>
            )
          })}
        </nav>
      </div>
    </aside>
  )
}

export default AppShell
