import { navItems } from '../../data/navigation'

function BottomNav({ activePage, onNavigate }) {
  return (
    <nav
      className="fixed bottom-0 left-1/2 z-10 w-full max-w-md -translate-x-1/2 border-t border-stone-200 bg-white/95 px-3 pb-3 pt-2 shadow-[0_-12px_30px_rgba(41,37,36,0.08)] backdrop-blur lg:hidden"
      aria-label="Main navigation"
    >
      <div className="grid grid-cols-5 gap-1">
        {navItems.map((item) => {
          const isActive = item.id === activePage

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onNavigate(item.id)}
              className={`flex min-h-14 flex-col items-center justify-center gap-1 rounded-xl text-[11px] font-semibold transition ${
                isActive
                  ? 'bg-teal-50 text-teal-800'
                  : 'text-stone-500 hover:bg-stone-100 hover:text-stone-900'
              }`}
              aria-current={isActive ? 'page' : undefined}
              aria-label={item.label}
            >
              <span
                className={`flex h-5 items-center justify-center ${
                  item.id === 'add' ? 'text-lg font-bold' : 'text-lg'
                }`}
                aria-hidden="true"
              >
                {item.icon}
              </span>
              <span className="h-3 leading-3">{item.label}</span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}

export default BottomNav
