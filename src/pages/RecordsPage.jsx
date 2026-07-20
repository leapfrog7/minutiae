import { useEffect, useMemo, useState } from "react";
import EmptyState from "../components/common/EmptyState";
import ItemDetailSheet from "../components/common/ItemDetailSheet";
import AppHeader from "../components/layout/AppHeader";
import MonthRecordGroup from "../components/records/MonthRecordGroup";
import { getCurrentMonthKey } from "../features/lifeItems/lifeItemHelpers";
import {
  groupRecordsByYearMonthAndDate,
  isVisibleRecord,
} from "../features/lifeItems/recordArchiveHelpers";
import {
  getLifeItems,
  subscribeToLifeItems,
} from "../features/lifeItems/lifeItemStorage";

const searchableFields = [
  "title",
  "type",
  "category",
  "status",
  "amount",
  "paymentMode",
  "notes",
  "vendorName",
  "serviceType",
  "contactNumber",
  "upiId",
  "complaintId",
  "companyOrDepartment",
  "policyNumber",
  "insurerName",
  "sourceName",
  "investmentType",
  "institutionName",
  "accountOrFolio",
  "relatedPerson",
  "priority",
  "billingCycle",
  "autoRenewal",
  "premiumAmount",
  "frequency",
  "recordType",
  "documentType",
  "relatedTo",
  "referenceNumber",
  "partsReplaced",
  "attachmentNote",
  "policyType",
  "serviceInterval",
  "date",
  "dueDate",
  "paidDate",
  "renewalDate",
  "paymentDate",
  "serviceDate",
  "nextServiceDate",
  "documentDate",
  "expiryDate",
  "warrantyTill",
];

const filterOptions = [
  { id: "all", label: "All" },
  { id: "bill", label: "Bills" },
  { id: "expense", label: "Expenses" },
  { id: "vendor", label: "Vendors" },
  { id: "subscription", label: "Subscriptions" },
  { id: "income", label: "Income" },
  { id: "investment", label: "Investments" },
  { id: "reminder", label: "Reminders" },
  { id: "insurance", label: "Insurance" },
  { id: "complaint", label: "Complaints" },
  { id: "document", label: "Records / Maintenance" },
];

function RecordsPage({ onNavigate }) {
  const [items, setItems] = useState(() => getLifeItems().filter(isVisibleRecord));
  const [query, setQuery] = useState("");
  const [selectedType, setSelectedType] = useState("all");
  const [selectedItem, setSelectedItem] = useState(null);
  const [selectedYear, setSelectedYear] = useState(() =>
    getCurrentMonthKey().slice(0, 4),
  );
  const [openMonthKeys, setOpenMonthKeys] = useState(() => new Set());
  const [closedMonthKeys, setClosedMonthKeys] = useState(() => new Set());
  const [openUpcomingYears, setOpenUpcomingYears] = useState(() => new Set());

  useEffect(
    () =>
      subscribeToLifeItems((nextItems) =>
        {
          const visibleItems = nextItems.filter(isVisibleRecord);
          setItems(visibleItems);
          setSelectedItem((current) =>
            current
              ? visibleItems.find((item) => item.id === current.id) ?? null
              : null,
          );
        },
      ),
    [],
  );

  function refreshItems(nextSelectedItem) {
    setItems(getLifeItems().filter(isVisibleRecord));
    setSelectedItem(nextSelectedItem ?? null);
  }

  const filteredItems = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    const typeFilteredItems =
      selectedType === "all"
        ? items
        : items.filter((item) => item.type === selectedType);

    if (!normalizedQuery) {
      return typeFilteredItems;
    }

    return typeFilteredItems.filter((item) =>
      searchableFields.some((field) =>
        String(item[field] || "")
          .toLowerCase()
          .includes(normalizedQuery),
      ),
    );
  }, [items, query, selectedType]);

  const yearGroups = useMemo(
    () => groupRecordsByYearMonthAndDate(filteredItems),
    [filteredItems],
  );
  const currentMonthKey = getCurrentMonthKey();
  const currentYearKey = currentMonthKey.slice(0, 4);
  const orderedYearKeys = getOrderedYearKeys(yearGroups, currentYearKey);
  const yearGroupByKey = new Map(
    yearGroups.map((year) => [year.yearKey, year]),
  );
  const isSearchActive = query.trim().length > 0;
  const activeYearKey = orderedYearKeys.includes(selectedYear)
    ? selectedYear
    : currentYearKey;
  const selectedYearGroup = yearGroupByKey.get(activeYearKey);
  const selectedMonths = selectedYearGroup?.months ?? [];
  const historyMonths = selectedMonths.filter(
    (month) => month.monthKey <= currentMonthKey,
  );
  const upcomingMonths = [...selectedMonths]
    .filter((month) => month.monthKey > currentMonthKey)
    .sort((a, b) => a.monthKey.localeCompare(b.monthKey));
  const hasCurrentMonth = historyMonths.some(
    (month) => month.monthKey === currentMonthKey,
  );
  const activeFilterLabel =
    filterOptions.find((option) => option.id === selectedType)?.label ??
    "records";
  const hasItems = items.length > 0;
  const hasFilteredItems = filteredItems.length > 0;

  function isMonthOpen(month, index, isUpcoming = false) {
    if (isSearchActive) {
      return true;
    }

    if (closedMonthKeys.has(month.monthKey)) {
      return false;
    }

    if (openMonthKeys.has(month.monthKey)) {
      return true;
    }

    if (isUpcoming) {
      return false;
    }

    if (month.monthKey === currentMonthKey) {
      return true;
    }

    return index === 0 && !hasCurrentMonth;
  }

  function toggleMonth(month, index, isUpcoming = false) {
    const isOpen = isMonthOpen(month, index, isUpcoming);

    if (isOpen) {
      setOpenMonthKeys((currentKeys) => {
        const nextKeys = new Set(currentKeys);
        nextKeys.delete(month.monthKey);
        return nextKeys;
      });
      setClosedMonthKeys((currentKeys) => {
        const nextKeys = new Set(currentKeys);
        nextKeys.add(month.monthKey);
        return nextKeys;
      });
      return;
    }

    setClosedMonthKeys((currentKeys) => {
      const nextKeys = new Set(currentKeys);
      nextKeys.delete(month.monthKey);
      return nextKeys;
    });
    setOpenMonthKeys((currentKeys) => {
      const nextKeys = new Set(currentKeys);
      nextKeys.add(month.monthKey);
      return nextKeys;
    });
  }

  function selectYear(yearKey) {
    setSelectedYear(yearKey);

    if (yearKey > currentYearKey) {
      setOpenUpcomingYears((currentYears) => {
        const nextYears = new Set(currentYears);
        nextYears.add(yearKey);
        return nextYears;
      });
    }
  }

  function toggleUpcomingYear(yearKey) {
    setOpenUpcomingYears((currentYears) => {
      const nextYears = new Set(currentYears);

      if (nextYears.has(yearKey)) {
        nextYears.delete(yearKey);
      } else {
        nextYears.add(yearKey);
      }

      return nextYears;
    });
  }

  return (
    <>
      <AppHeader
        title="📖 Records"
        eyebrow="Searchable archive"
        description="Receipts, maintenance history, complaint IDs, vendor details, and payment records in one place."
      />

      {!hasItems ? (
        <EmptyState
          title="No records yet"
          description="Your bills, expenses, income, investments, reminders, vendors, complaints and maintenance records will appear here once added."
          cta={
            <button
              type="button"
              onClick={() => onNavigate("add")}
              className="rounded-2xl bg-teal-700 px-4 py-3 text-sm font-bold text-white"
            >
              Add item
            </button>
          }
        />
      ) : (
        <>
          <label className="mb-4 block md:max-w-xl">
            <span className="sr-only">Search records</span>
            <span className="flex rounded-2xl border border-stone-200 bg-white shadow-sm shadow-stone-200/50 focus-within:border-teal-300 focus-within:ring-4 focus-within:ring-teal-100">
              <input
                type="search"
                placeholder="Search records"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                className="min-w-0 flex-1 rounded-2xl bg-transparent px-4 py-3 text-sm text-stone-900 outline-none placeholder:text-stone-400"
              />
              {query.trim() && (
                <button
                  type="button"
                  onClick={() => setQuery("")}
                  className="shrink-0 px-4 text-xs font-bold text-teal-700"
                >
                  Clear
                </button>
              )}
            </span>
          </label>

          <div className="-mx-4 mb-3 flex flex-wrap gap-2 px-4 py-1 md:mx-0 md:px-0">
            {filterOptions.map((option) => {
              const isActive = option.id === selectedType;

              return (
                <button
                  key={option.id}
                  type="button"
                  aria-pressed={isActive}
                  onClick={() => setSelectedType(option.id)}
                  className={`rounded-full px-3 py-2 text-xs font-bold ${
                    isActive
                      ? "bg-teal-700 text-white"
                      : "bg-white text-stone-600 ring-1 ring-stone-200"
                  }`}
                >
                  {option.label}
                </button>
              );
            })}
          </div>

          {!isSearchActive && (
            <div className="-mx-4 mb-4 overflow-x-auto px-4 pb-1 md:mx-0 md:px-0">
              <div className="flex min-w-max gap-2" role="tablist" aria-label="Record year">
                {orderedYearKeys.map((yearKey) => {
                  const year = yearGroupByKey.get(yearKey);
                  const isActive = yearKey === activeYearKey;

                  return (
                    <button
                      key={yearKey}
                      type="button"
                      role="tab"
                      aria-selected={isActive}
                      onClick={() => selectYear(yearKey)}
                      className={`rounded-2xl px-4 py-2.5 text-sm font-black transition ${
                        isActive
                          ? "bg-stone-900 text-white shadow-sm shadow-stone-900/20"
                          : "bg-white text-stone-600 ring-1 ring-stone-200"
                      }`}
                    >
                      {yearKey}
                      {year && (
                        <span className={`ml-2 text-xs ${isActive ? "text-stone-300" : "text-stone-400"}`}>
                          {year.recordCount}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {isSearchActive && hasFilteredItems && (
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
              <p className="text-xs font-semibold text-stone-500">
                {filteredItems.length}{" "}
                {filteredItems.length === 1 ? "result" : "results"} across all years
              </p>
              <span className="rounded-full bg-teal-50 px-2.5 py-1 text-[11px] font-bold text-teal-700">
                All years
              </span>
            </div>
          )}

          {!hasFilteredItems ? (
            <EmptyState
              title={
                isSearchActive
                  ? `No results for "${query.trim()}"`
                  : "No matching records"
              }
              description={
                isSearchActive
                  ? "Try another search or clear filters."
                  : selectedType === "all"
                    ? "Try another search."
                    : `No ${activeFilterLabel.toLowerCase()} matched. Try another type or clear search.`
              }
            />
          ) : isSearchActive ? (
            <div className="space-y-6">
              {orderedYearKeys.map((yearKey) => {
                const year = yearGroupByKey.get(yearKey);

                if (!year) {
                  return null;
                }

                return (
                  <section key={yearKey}>
                    <YearSectionHeading count={year.recordCount} yearKey={yearKey} />
                    <div className="space-y-3">
                      {orderMonthsForRecords(year.months, currentMonthKey).map((month, index) => (
                        <MonthRecordGroup
                          key={month.monthKey}
                          badge={getMonthBadge(month.monthKey, currentMonthKey)}
                          collapsible={false}
                          isOpen={isMonthOpen(month, index)}
                          month={month}
                          onOpenItem={setSelectedItem}
                          onToggle={() => toggleMonth(month, index)}
                        />
                      ))}
                    </div>
                  </section>
                );
              })}
            </div>
          ) : selectedMonths.length > 0 ? (
            <div className="space-y-5">
              {historyMonths.length > 0 && (
                <section>
                  <div className="space-y-3">
                    {historyMonths.map((month, index) => (
                      <MonthRecordGroup
                        key={month.monthKey}
                        badge={getMonthBadge(month.monthKey, currentMonthKey)}
                        isOpen={isMonthOpen(month, index)}
                        month={month}
                        onOpenItem={setSelectedItem}
                        onToggle={() => toggleMonth(month, index)}
                      />
                    ))}
                  </div>
                </section>
              )}

              {upcomingMonths.length > 0 && (
                <UpcomingMonthsSection
                  isOpen={openUpcomingYears.has(activeYearKey)}
                  months={upcomingMonths}
                  onToggle={() => toggleUpcomingYear(activeYearKey)}
                  renderMonth={(month, index) => (
                    <MonthRecordGroup
                      key={month.monthKey}
                      badge="Scheduled"
                      isOpen={isMonthOpen(month, index, true)}
                      month={month}
                      onOpenItem={setSelectedItem}
                      onToggle={() => toggleMonth(month, index, true)}
                    />
                  )}
                  yearKey={activeYearKey}
                />
              )}
            </div>
          ) : (
            <EmptyState
              title={`No ${activeFilterLabel.toLowerCase()} in ${activeYearKey}`}
              description="Choose another year or change the record type filter."
            />
          )}
        </>
      )}

      <ItemDetailSheet
        item={selectedItem}
        onClose={() => setSelectedItem(null)}
        onItemDeleted={() => refreshItems(null)}
        onItemUpdated={refreshItems}
        onNavigate={onNavigate}
      />
    </>
  );
}

function getOrderedYearKeys(yearGroups, currentYearKey) {
  const yearKeys = new Set([
    currentYearKey,
    ...yearGroups.map((year) => year.yearKey),
  ]);
  const pastYears = [...yearKeys]
    .filter((yearKey) => yearKey < currentYearKey)
    .sort((a, b) => b.localeCompare(a));
  const futureYears = [...yearKeys]
    .filter((yearKey) => yearKey > currentYearKey)
    .sort((a, b) => a.localeCompare(b));

  return [currentYearKey, ...pastYears, ...futureYears];
}

function getMonthBadge(monthKey, currentMonthKey) {
  if (monthKey === currentMonthKey) {
    return "Current";
  }

  if (monthKey > currentMonthKey) {
    return "Scheduled";
  }

  return "";
}

function orderMonthsForRecords(months, currentMonthKey) {
  const currentMonths = months.filter(
    (month) => month.monthKey === currentMonthKey,
  );
  const pastMonths = months
    .filter((month) => month.monthKey < currentMonthKey)
    .sort((a, b) => b.monthKey.localeCompare(a.monthKey));
  const futureMonths = months
    .filter((month) => month.monthKey > currentMonthKey)
    .sort((a, b) => a.monthKey.localeCompare(b.monthKey));

  return [...currentMonths, ...pastMonths, ...futureMonths];
}

function YearSectionHeading({ count, yearKey }) {
  return (
    <div className="mb-2 flex items-center justify-between gap-3 px-1">
      <h2 className="text-sm font-black text-stone-950">{yearKey}</h2>
      <span className="text-xs font-semibold text-stone-500">
        {count} {count === 1 ? "record" : "records"}
      </span>
    </div>
  );
}

function UpcomingMonthsSection({
  isOpen,
  months,
  onToggle,
  renderMonth,
  yearKey,
}) {
  const recordCount = months.reduce(
    (total, month) => total + month.recordCount,
    0,
  );

  return (
    <section className="overflow-hidden rounded-2xl border border-amber-200 bg-amber-50/60">
      <button
        type="button"
        aria-expanded={isOpen}
        onClick={onToggle}
        className="flex w-full items-center justify-between gap-3 px-4 py-3.5 text-left"
      >
        <span>
          <span className="block text-sm font-black text-stone-950">
            Upcoming in {yearKey}
          </span>
          <span className="mt-1 block text-xs font-semibold text-stone-600">
            {months.length} {months.length === 1 ? "month" : "months"} - {recordCount}{" "}
            {recordCount === 1 ? "scheduled item" : "scheduled items"}
          </span>
        </span>
        <span className="rounded-full bg-white px-3 py-1.5 text-xs font-black text-amber-800 ring-1 ring-amber-200">
          {isOpen ? "Hide" : "Show"}
        </span>
      </button>

      {isOpen && (
        <div className="space-y-3 border-t border-amber-200/70 px-3 py-3">
          {months.map((month, index) => renderMonth(month, index))}
        </div>
      )}
    </section>
  );
}

export default RecordsPage;
