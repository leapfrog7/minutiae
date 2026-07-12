function FormInfoPanel({ children, title }) {
  return (
    <aside className="rounded-xl border border-stone-200 bg-stone-50 px-3 py-2.5 md:col-span-2">
      <p className="text-xs font-bold text-stone-800">{title}</p>
      <p className="mt-0.5 text-xs leading-5 text-stone-600">{children}</p>
    </aside>
  )
}

export default FormInfoPanel
