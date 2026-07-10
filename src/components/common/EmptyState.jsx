function EmptyState({ cta, description, title }) {
  return (
    <div className="rounded-2xl border border-dashed border-stone-300 bg-stone-50 px-3 py-4 text-center">
      <p className="text-sm font-semibold text-stone-900">{title}</p>
      <p className="mx-auto mt-2 max-w-xs text-sm leading-6 text-stone-500">
        {description}
      </p>
      {cta && <div className="mt-4">{cta}</div>}
    </div>
  )
}

export default EmptyState
