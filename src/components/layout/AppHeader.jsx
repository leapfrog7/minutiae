function AppHeader({
  action,
  description = 'Track everything you need to pay, renew, remember, follow up, or settle.',
  eyebrow = 'Your household command centre.',
  title = 'Minutiae',
}) {
  return (
    <header className="pb-5 pt-2">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-teal-700">{eyebrow}</p>
          <h1 className="mt-2 text-3xl font-bold tracking-normal text-stone-950">
            {title}
          </h1>
        </div>
        {action}
      </div>
      {description && (
        <p className="mt-3 max-w-sm text-sm leading-6 text-stone-600">
          {description}
        </p>
      )}
    </header>
  )
}

export default AppHeader
