import DateRecordGroup from "./DateRecordGroup";

function MonthRecordGroup({ isOpen, month, onOpenItem, onToggle }) {
  return (
    <section className="overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm shadow-stone-200/50">
      <button
        type="button"
        onClick={onToggle}
        className="group flex w-full items-center justify-between gap-3 px-4 py-3.5 text-left transition hover:bg-stone-50/80"
        aria-expanded={isOpen}
      >
        <span className="min-w-0">
          <span className="block truncate text-[15px] font-black tracking-tight text-stone-950">
            {month.label}
          </span>

          <span className="mt-1 block truncate text-xs font-semibold text-stone-500">
            {month.summary}
          </span>
        </span>

        <span
          aria-hidden="true"
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-slate-100 text-base font-extrabold leading-none text-teal-700 ring-1 ring-teal-200 transition duration-200 group-hover:bg-teal-100 ${
            isOpen ? "rotate-90" : ""
          }`}
        >
          ➤
        </span>
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
