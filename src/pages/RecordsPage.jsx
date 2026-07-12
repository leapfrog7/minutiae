import { useEffect, useMemo, useState } from "react";
import EmptyState from "../components/common/EmptyState";
import ItemDetailSheet from "../components/common/ItemDetailSheet";
import AppHeader from "../components/layout/AppHeader";
import MonthRecordGroup from "../components/records/MonthRecordGroup";
import { getCurrentMonthKey } from "../features/lifeItems/lifeItemHelpers";
import {
  groupRecordsByMonthAndDate,
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
  { id: "insurance", label: "Insurance" },
  { id: "complaint", label: "Complaints" },
  { id: "document", label: "Records / Maintenance" },
];

const initialVisibleMonthCount = 3;
const olderMonthBatchSize = 3;

function RecordsPage({ onNavigate }) {
  const [items, setItems] = useState(() => getLifeItems().filter(isVisibleRecord));
  const [query, setQuery] = useState("");
  const [selectedType, setSelectedType] = useState("all");
  const [selectedItem, setSelectedItem] = useState(null);
  const [visibleMonthCount, setVisibleMonthCount] = useState(
    initialVisibleMonthCount,
  );
  const [openMonthKeys, setOpenMonthKeys] = useState(() => new Set());
  const [closedMonthKeys, setClosedMonthKeys] = useState(() => new Set());

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

  const monthGroups = useMemo(
    () => groupRecordsByMonthAndDate(filteredItems),
    [filteredItems],
  );
  const currentMonthKey = getCurrentMonthKey();
  const hasCurrentMonth = monthGroups.some(
    (month) => month.monthKey === currentMonthKey,
  );
  const isSearchActive = query.trim().length > 0;
  const visibleMonthGroups = isSearchActive
    ? monthGroups
    : monthGroups.slice(0, visibleMonthCount);
  const hasHiddenMonths =
    !isSearchActive && visibleMonthCount < monthGroups.length;
  const activeFilterLabel =
    filterOptions.find((option) => option.id === selectedType)?.label ??
    "records";
  const hasItems = items.length > 0;
  const hasFilteredItems = filteredItems.length > 0;

  function isMonthOpen(month, index) {
    if (isSearchActive) {
      return true;
    }

    if (closedMonthKeys.has(month.monthKey)) {
      return false;
    }

    if (openMonthKeys.has(month.monthKey)) {
      return true;
    }

    if (month.monthKey === currentMonthKey) {
      return true;
    }

    return index === 0 && !hasCurrentMonth;
  }

  function toggleMonth(month, index) {
    const isOpen = isMonthOpen(month, index);

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

  function showOlderMonths() {
    setVisibleMonthCount((count) => count + olderMonthBatchSize);
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
          description="Your bills, expenses, vendors, complaints, income and maintenance records will appear here once added."
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

          {isSearchActive && hasFilteredItems && (
            <p className="mb-3 text-xs font-semibold text-stone-500">
              {filteredItems.length}{" "}
              {filteredItems.length === 1 ? "result" : "results"}
            </p>
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
          ) : (
            <>
              <div className="space-y-3">
                {visibleMonthGroups.map((month, index) => (
                  <MonthRecordGroup
                    key={month.monthKey}
                    isOpen={isMonthOpen(month, index)}
                    month={month}
                    onOpenItem={setSelectedItem}
                    onToggle={() => toggleMonth(month, index)}
                  />
                ))}
              </div>

              {hasHiddenMonths && (
                <div className="mt-4 flex justify-center">
                  <button
                    type="button"
                    onClick={showOlderMonths}
                    className="rounded-2xl bg-white px-4 py-3 text-sm font-bold text-stone-700 shadow-sm shadow-stone-200/50 ring-1 ring-stone-200"
                  >
                    Load older months
                  </button>
                </div>
              )}
            </>
          )}
        </>
      )}

      <ItemDetailSheet
        item={selectedItem}
        onClose={() => setSelectedItem(null)}
        onItemDeleted={() => refreshItems(null)}
        onItemUpdated={refreshItems}
      />
    </>
  );
}

export default RecordsPage;
