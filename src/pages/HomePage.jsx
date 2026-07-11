import { useEffect, useMemo, useState } from "react";
import ActionItemCard from "../components/common/ActionItemCard";
import EmptyState from "../components/common/EmptyState";
import ItemDetailSheet from "../components/common/ItemDetailSheet";
import MarkPaidDialog from "../components/common/MarkPaidDialog";
import SectionCard from "../components/common/SectionCard";
import SummaryPreviewSheet from "../components/dashboard/SummaryPreviewSheet";
import SummaryTile from "../components/dashboard/SummaryTile";
import AppHeader from "../components/layout/AppHeader";
import {
  dismissBackupReminder,
  exportLifeItemsBackup,
  getBackupReminderState,
} from "../features/backup/backupReminder";
import {
  formatAmount,
  formatRelativeDueLabel,
  canRecordPaymentAsExpense,
  getCurrentMonthKey,
  getExpenseItemsForMonth,
  getItemsDueSoon,
  getMonthlyExpenseTotal,
  getOpenComplaints,
  getOverdueItems,
  getPriorityItems,
  getQuickStatusAction,
  getRelevantDate,
  getUpcomingRenewals,
  hasLinkedExpense,
  getTodayActionSummary,
} from "../features/lifeItems/lifeItemHelpers";
import {
  getLifeItems,
  markLifeItemPaid,
  updateLifeItem,
} from "../features/lifeItems/lifeItemStorage";

function HomePage({ onNavigate }) {
  const [items, setItems] = useState(() => getLifeItems());
  const [pendingPaidItem, setPendingPaidItem] = useState(null);
  const [preview, setPreview] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [backupRefreshKey, setBackupRefreshKey] = useState(0);

  function refreshItems(nextSelectedItem) {
    setItems(getLifeItems());
    setSelectedItem(nextSelectedItem ?? null);
  }

  function handleQuickAction(item) {
    const quickAction = getQuickStatusAction(item);

    if (!quickAction) {
      return;
    }

    if (quickAction.status === "paid" && canRecordPaymentAsExpense(item)) {
      setPendingPaidItem(item);
      return;
    }

    if (quickAction.status === "paid") {
      markLifeItemPaid(item);
      refreshItems(null);
      return;
    }

    updateLifeItem(item.id, { status: quickAction.status });
    refreshItems(null);
  }

  function handleConfirmPaid({ recordExpense, updates }) {
    markLifeItemPaid(pendingPaidItem, { recordExpense, updates });
    setPendingPaidItem(null);
    refreshItems(null);
  }

  const priorityItems = useMemo(() => getPriorityItems(items, 5), [items]);
  const todaySummary = useMemo(() => getTodayActionSummary(items), [items]);
  const currentMonth = getCurrentMonthKey();
  const monthlyTotal = useMemo(
    () => getMonthlyExpenseTotal(items, currentMonth),
    [items, currentMonth],
  );
  const previewData = useMemo(
    () => getSummaryPreviewData(items, currentMonth),
    [items, currentMonth],
  );
  const activePreview = preview ? previewData[preview] : null;
  const todayPreview = previewData.today;
  const todayCount = todayPreview.items.length;
  const todayAmount = formatAmount(todaySummary.amountDue);
  const summaries = [
    {
      detail: "Next 7 days",
      id: "dueSoon",
      status: "pending",
      title: "Due soon",
      value: previewData.dueSoon.items.length,
    },
    {
      detail: "Needs action",
      id: "overdue",
      status: "overdue",
      title: "Overdue",
      value: previewData.overdue.items.length,
    },
    {
      detail: "Follow-up pending",
      id: "complaints",
      status: "open",
      title: "Open complaints",
      value: previewData.complaints.items.length,
    },
    {
      detail: "Next 30 days",
      id: "renewals",
      status: "followed_up",
      title: "Renewals",
      value: previewData.renewals.items.length,
    },
    {
      detail: "Paid expenses this month",
      id: "spending",
      status: "paid",
      title: "Month spend",
      value: formatAmount(monthlyTotal),
    },
  ];
  const hasItems = items.length > 0;
  const backupState = useMemo(
    () => getBackupReminderState(items.length),
    [items.length, backupRefreshKey],
  );

  useEffect(() => {
    function handleInternalBack(event) {
      if (!preview || selectedItem) {
        return;
      }

      event.preventDefault();
      setPreview(null);
    }

    window.addEventListener("minutiae:back", handleInternalBack);
    return () =>
      window.removeEventListener("minutiae:back", handleInternalBack);
  }, [preview, selectedItem]);

  const settingsAction = (
    <button
      type="button"
      onClick={() => onNavigate("settings")}
      className="flex h-10 shrink-0 items-center justify-center rounded-full border border-stone-200 bg-white px-3 text-xs font-bold text-stone-600 shadow-sm shadow-stone-200/70"
      aria-label="Open settings"
    >
      Settings
    </button>
  );

  function openPreview(id) {
    setPreview(id);
  }

  function openPreviewItem(item) {
    setSelectedItem(item);
  }

  function handleExportBackup() {
    exportLifeItemsBackup();
    setBackupRefreshKey((current) => current + 1);
  }

  function handleDismissBackup() {
    dismissBackupReminder();
    setBackupRefreshKey((current) => current + 1);
  }

  return (
    <>
      <AppHeader
        action={settingsAction}
        description="Track small but important things of everyday life."
      />

      {backupState.due && (
        <BackupDueCard
          onDismiss={handleDismissBackup}
          onExport={handleExportBackup}
        />
      )}

      {!hasItems ? (
        <EmptyState
          title="Start your household command centre"
          description="Add bills, subscriptions, vendors, complaints, insurance, documents or expenses to keep track of what needs paying, renewing or follow-up."
          cta={
            <>
              <button
                type="button"
                onClick={() => onNavigate("add")}
                className="rounded-2xl bg-teal-700 px-4 py-3 text-sm font-bold text-white"
              >
                Add your first item
              </button>
              <p className="mt-3 text-xs font-semibold text-stone-500">
                Your data stays on this device unless you export a backup.
              </p>
            </>
          }
        />
      ) : (
        <div className="space-y-3 md:space-y-4">
          <div className="grid gap-3 lg:grid-cols-[minmax(0,1.35fr)_minmax(280px,0.65fr)] lg:items-start">
            <SectionCard title="Needs attention" eyebrow="Priority">
              {priorityItems.length > 0 ? (
                <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-1">
                  {priorityItems.map((item) => (
                    <ActionItemCard
                      key={item.id}
                      item={item}
                      dateLabel={formatRelativeDueLabel(getRelevantDate(item))}
                      onOpen={setSelectedItem}
                      onQuickAction={handleQuickAction}
                    />
                  ))}
                </div>
              ) : (
                <p className="rounded-xl bg-stone-50 px-3 py-3 text-sm font-semibold text-stone-600">
                  Nothing needs attention right now.
                </p>
              )}
            </SectionCard>

            <SectionCard title="Today">
              <button
                type="button"
                onClick={() => openPreview("today")}
                className="w-full rounded-xl bg-stone-50 px-2 py-2 text-left transition hover:bg-teal-50/50"
              >
                {todayCount > 0 ? (
                  <div className="grid grid-cols-3 gap-2 lg:grid-cols-1 xl:grid-cols-3">
                    <TodayMetric label="Due" value={todaySummary.dueCount} />
                    <TodayMetric
                      label="Follow-ups"
                      value={todaySummary.followUpCount}
                    />
                    <TodayMetric label="Amount" value={todayAmount} />
                  </div>
                ) : (
                  <p className="px-1 py-1 text-sm font-semibold text-stone-600">
                    Nothing due today.
                  </p>
                )}
                <p className="mt-2 px-1 text-xs font-bold text-teal-700">
                  View -&gt;
                </p>
              </button>
            </SectionCard>
          </div>

          <div className="grid grid-cols-2 gap-2 md:grid-cols-3 lg:gap-3">
            {summaries.map((summary) => (
              <SummaryTile
                key={summary.id}
                {...summary}
                onClick={() => openPreview(summary.id)}
              />
            ))}
          </div>
        </div>
      )}

      {activePreview && (
        <SummaryPreviewSheet
          {...activePreview}
          count={activePreview.items.length}
          onClose={() => setPreview(null)}
          onOpenItem={openPreviewItem}
          suspendBack={Boolean(selectedItem)}
        />
      )}

      <ItemDetailSheet
        item={selectedItem}
        onClose={() => setSelectedItem(null)}
        onItemDeleted={() => refreshItems(null)}
        onItemUpdated={refreshItems}
      />

      {pendingPaidItem && (
        <MarkPaidDialog
          duplicateExpense={hasLinkedExpense(items, pendingPaidItem)}
          item={pendingPaidItem}
          onCancel={() => setPendingPaidItem(null)}
          onConfirm={handleConfirmPaid}
        />
      )}
    </>
  );
}

function BackupDueCard({ onDismiss, onExport }) {
  return (
    <SectionCard
      className="mb-3 border-rose-300 bg-rose-50 ring-1 ring-rose-700"
      eyebrow="Local data warning"
      title="Backup due"
    >
      <p className="text-sm font-semibold leading-6 text-stone-800">
        Your Minutiae records live only in this browser. If browser data,
        storage, or device memory is cleared, they can be wiped unless you have
        exported a backup.
      </p>
      <p className="mt-2 rounded-xl bg-white/70 px-3 py-2 text-xs font-semibold leading-5 text-amber-900 ring-1 ring-amber-200">
        Export regularly so bills, records, maintenance history, and money
        entries can be restored later.
      </p>
      <div className="mt-3 grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={onExport}
          className="rounded-2xl bg-teal-700 px-4 py-3 text-sm font-bold text-white"
        >
          Export now
        </button>
        <button
          type="button"
          onClick={onDismiss}
          className="rounded-2xl bg-white px-4 py-3 text-sm font-bold text-stone-700 ring-1 ring-stone-200"
        >
          Remind me later
        </button>
      </div>
    </SectionCard>
  );
}

function getSummaryPreviewData(items, currentMonth) {
  const todayItems = getTodayActionSummary(items).items;
  const spendingItems = getExpenseItemsForMonth(items, currentMonth);

  return {
    complaints: {
      description: "Complaints that still need a follow-up or resolution.",
      emptyText: "No open complaints.",
      items: getOpenComplaints(items),
      title: "Open complaints",
    },
    dueSoon: {
      description: "Items needing attention in the next 7 days.",
      emptyText: "Nothing due in the next 7 days.",
      items: getItemsDueSoon(items, 7),
      title: "Due soon",
    },
    overdue: {
      description: "Items past their relevant date and still open.",
      emptyText: "No overdue items.",
      items: getOverdueItems(items),
      title: "Overdue",
    },
    renewals: {
      description: "Renewals and expiries coming up in the next 30 days.",
      emptyText: "No renewals coming up.",
      items: getUpcomingRenewals(items, 30),
      title: "Upcoming renewals",
    },
    spending: {
      description: `Paid expenses recorded this month. Total ${formatAmount(
        spendingItems.reduce(
          (total, item) => total + Number(item.amount || 0),
          0,
        ),
      )}.`,
      emptyText: "No paid expenses recorded this month.",
      items: spendingItems,
      title: "Monthly spending",
    },
    today: {
      description: "Items due or needing follow-up today.",
      emptyText: "Nothing due today.",
      items: todayItems,
      title: "Today",
    },
  };
}

function TodayMetric({ label, value }) {
  return (
    <div className="rounded-xl bg-white px-2 py-2 text-center ring-1 ring-stone-200">
      <p className="text-[10px] font-bold uppercase tracking-[0.08em] text-stone-500">
        {label}
      </p>
      <p className="mt-1 text-sm font-bold text-stone-950">{value}</p>
    </div>
  );
}

export default HomePage;
