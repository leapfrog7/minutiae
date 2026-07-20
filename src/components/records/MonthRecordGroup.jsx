import DateRecordGroup from "./DateRecordGroup";

function MonthRecordGroup({
  badge,
  collapsible = true,
  isOpen,
  month,
  onOpenItem,
  onToggle,
}) {
  return (
    <section className="overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm shadow-stone-200/50">
      <button
        type="button"
        disabled={!collapsible}
        onClick={collapsible ? onToggle : undefined}
        className="group flex w-full items-center justify-between gap-3 px-4 py-3.5 text-left transition enabled:hover:bg-stone-50/80 disabled:cursor-default"
        aria-expanded={isOpen}
      >
        <span className="min-w-0">
          <span className="flex flex-wrap items-center gap-2">
            <span className="truncate text-[15px] font-black tracking-tight text-stone-950">
              {month.label}
            </span>
            {badge && (
              <span className="rounded-full bg-teal-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-teal-700">
                {badge}
              </span>
            )}
          </span>

          <span className="mt-1 block truncate text-xs font-semibold text-stone-500">
            {month.summary}
          </span>
        </span>

        {collapsible && (
          <span
            aria-hidden="true"
            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-slate-100 text-base font-extrabold leading-none text-teal-700 ring-1 ring-teal-200 transition duration-200 group-hover:bg-teal-100 ${
              isOpen ? "rotate-90" : ""
            }`}
          >
          ➤
          </span>
        )}
      </button>

      {isOpen && (
        <div className="space-y-4 border-t border-stone-100 bg-stone-50/40 px-3 py-3">
          {month.dates.map((dateGroup) => (
            <DateRecordGroup
              key={dateGroup.dateKey}
              dateGroup={dateGroup}
              onOpenItem={onOpenItem}
            />
          ))}
        </div>
      )}
    </section>
  );
}

export default MonthRecordGroup;
