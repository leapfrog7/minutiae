function AppHeader({
  action,
  description = 'Track small, precise, or trivial details of everyday life',
  eyebrow = 'Your household command centre.',
  title = 'Minutiae',
}) {
  return (
    <header className="pb-3 pt-1">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-start gap-3">
          {title === 'Minutiae' && (
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-white text-base font-black text-white shadow-sm shadow-teal-900/20">
             🤖
            </div>
          )}
          <div className="min-w-0">
           
            <h1 className="mt-1 text-xl font-bold tracking-normal text-stone-950">
              {title}
            </h1>
          </div>
        </div>
        {action}
      </div>
      {description && (
        <p className="mt-2 max-w-sm text-sm leading-6 text-stone-600">
          {description}
        </p>
      )}
    </header>
  )
}

export default AppHeader
