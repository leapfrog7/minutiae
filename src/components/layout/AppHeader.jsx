function AppHeader({
  action,
  description = "Track small, precise, or trivial details of everyday life",
  eyebrow = "",
  title = "Minutiae",
}) {
  return (
    <header className="pb-4 pt-1">
      <div className=" p-2">
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 items-start gap-3">
            {title === "Minutiae" && (
              <div
                aria-hidden="true"
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-zinc-100 text-lg font-black text-white shadow-sm shadow-teal-zinc/20 ring-1 ring-zinc-600/20"
              >
                🗃️
              </div>
            )}

            <div className="min-w-0">
              {eyebrow && (
                <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-teal-700">
                  {eyebrow}
                </p>
              )}

              <div className="mt-1 flex min-w-0 items-center gap-2">
                <h1 className="truncate text-2xl font-black tracking-tight text-stone-950">
                  {title}
                </h1>

                {title === "Minutiae" && (
                  <span className="hidden rounded-full bg-teal-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-teal-700 ring-1 ring-teal-100 sm:inline-flex">
                    Life admin
                  </span>
                )}
              </div>
            </div>
          </div>

          {action && <div className="shrink-0">{action}</div>}
        </div>

        {description && (
          <p className="mt-3 max-w-xl text-[13px] leading-5 text-stone-600">
            {description}
          </p>
        )}

        {title === "Minutiae" && (
          <div className="mt-3 flex flex-wrap gap-2">
            <span className="rounded-full bg-stone-50 px-2.5 py-1 text-[11px] font-semibold text-stone-700 ring-1 ring-stone-200">
              Bills
            </span>
            <span className="rounded-full bg-stone-50 px-2.5 py-1 text-[11px] font-semibold text-stone-700 ring-1 ring-stone-200">
              Renewals
            </span>
            <span className="rounded-full bg-stone-50 px-2.5 py-1 text-[11px] font-semibold text-stone-700 ring-1 ring-stone-200">
              Follow-ups
            </span>
          </div>
        )}
      </div>
    </header>
  );
}

export default AppHeader;
