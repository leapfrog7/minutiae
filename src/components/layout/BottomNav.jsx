const navItems = [
  {
    id: 'dashboard',
    label: 'Home',
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M4 10.5 12 4l8 6.5V20a1 1 0 0 1-1 1h-5v-6h-4v6H5a1 1 0 0 1-1-1v-9.5Z" />
      </svg>
    ),
  },
  {
    id: 'add',
    label: 'Add',
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M11 5h2v6h6v2h-6v6h-2v-6H5v-2h6V5Z" />
      </svg>
    ),
  },
  {
    id: 'transactions',
    label: 'List',
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M5 5h14v2H5V5Zm0 6h14v2H5v-2Zm0 6h14v2H5v-2Z" />
      </svg>
    ),
  },
  {
    id: 'summary',
    label: 'Summary',
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M5 19V9h3v10H5Zm5 0V5h3v14h-3Zm5 0v-7h3v7h-3Z" />
      </svg>
    ),
  },
  {
    id: 'settings',
    label: 'Settings',
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8Zm8.7 5.4-2 .4a7 7 0 0 1-.7 1.7l1.1 1.7-1.9 1.9-1.7-1.1c-.5.3-1.1.5-1.7.7l-.4 2h-2.8l-.4-2a7 7 0 0 1-1.7-.7l-1.7 1.1-1.9-1.9 1.1-1.7a7 7 0 0 1-.7-1.7l-2-.4v-2.8l2-.4c.2-.6.4-1.2.7-1.7L4.9 6.8l1.9-1.9 1.7 1.1c.5-.3 1.1-.5 1.7-.7l.4-2h2.8l.4 2c.6.2 1.2.4 1.7.7l1.7-1.1 1.9 1.9L18 8.5c.3.5.5 1.1.7 1.7l2 .4v2.8Z" />
      </svg>
    ),
  },
]

function BottomNav({ activePage, onNavigate }) {
  return (
    <nav className="fixed bottom-0 left-1/2 z-10 w-full max-w-md -translate-x-1/2 border-t border-slate-200 bg-white/95 px-3 py-2 shadow-[0_-12px_30px_rgba(15,23,42,0.08)] backdrop-blur">
      <div className="grid grid-cols-5 gap-1">
        {navItems.map((item) => {
          const isActive = item.id === activePage

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onNavigate(item.id)}
              className={`flex min-h-14 flex-col items-center justify-center gap-1 rounded-md text-xs font-semibold transition ${
                isActive
                  ? 'bg-emerald-50 text-emerald-700'
                  : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900'
              }`}
              aria-current={isActive ? 'page' : undefined}
            >
              <span className="h-5 w-5 [&_svg]:h-5 [&_svg]:w-5 [&_svg]:fill-current">
                {item.icon}
              </span>
              <span>{item.label}</span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}

export default BottomNav
