import { useEffect, useMemo, useState } from 'react'
import ActionItemCard from '../components/common/ActionItemCard'
import EmptyState from '../components/common/EmptyState'
import ItemDetailSheet from '../components/common/ItemDetailSheet'
import SectionCard from '../components/common/SectionCard'
import SummaryTile from '../components/dashboard/SummaryTile'
import AppHeader from '../components/layout/AppHeader'
import {
  formatAmount,
  formatRelativeDueLabel,
  getCurrentMonthKey,
  getMonthlyExpenseTotal,
  getPriorityItems,
  getQuickStatusAction,
  getRelevantDate,
  getThisWeekSummary,
  getTodayActionSummary,
} from '../features/lifeItems/lifeItemHelpers'
import {
  getLifeItems,
  updateLifeItem,
} from '../features/lifeItems/lifeItemStorage'

const today = () => new Date().toISOString().slice(0, 10)

function HomePage({ onNavigate }) {
  const [items, setItems] = useState([])
  const [selectedItem, setSelectedItem] = useState(null)

  useEffect(() => {
    setItems(getLifeItems())
  }, [])

  function refreshItems(nextSelectedItem) {
    setItems(getLifeItems())
    setSelectedItem(nextSelectedItem ?? null)
  }

  function handleQuickAction(item) {
    const quickAction = getQuickStatusAction(item)

    if (!quickAction) {
      return
    }

    const updates = { status: quickAction.status }

    if (['bill', 'vendor', 'subscription', 'insurance'].includes(item.type)) {
      updates.paidDate = today()
    }

    updateLifeItem(item.id, updates)
    refreshItems(null)
  }

  const priorityItems = useMemo(() => getPriorityItems(items, 5), [items])
  const todaySummary = useMemo(() => getTodayActionSummary(items), [items])
  const weekSummary = useMemo(() => getThisWeekSummary(items), [items])
  const monthlyTotal = useMemo(
    () => getMonthlyExpenseTotal(items, getCurrentMonthKey()),
    [items],
  )
  const hasItems = items.length > 0

  const summaries = [
    { title: 'Due this week', value: weekSummary.dueThisWeek, detail: 'Next 7 days', status: 'pending' },
    { title: 'Overdue', value: weekSummary.overdue, detail: 'Needs action', status: 'overdue' },
    { title: 'Open complaints', value: weekSummary.openComplaints, detail: 'Follow-ups', status: 'open' },
    { title: 'Renewals', value: weekSummary.upcomingRenewals, detail: 'Next 30 days', status: 'followed_up' },
    { title: 'Month spend', value: formatAmount(monthlyTotal), detail: 'Explicit expenses', status: 'paid' },
  ]

  const settingsAction = (
    <button
      type="button"
      onClick={() => onNavigate('settings')}
      className="flex h-10 shrink-0 items-center justify-center rounded-full border border-stone-200 bg-white px-3 text-xs font-bold text-stone-600 shadow-sm shadow-stone-200/70"
      aria-label="Open settings"
    >
      Settings
    </button>
  )

  return (
    <>
      <AppHeader
        action={settingsAction}
        description="Track small but important things of everyday life."
      />

      {!hasItems ? (
        <EmptyState
          title="Start your household command centre"
          description="Add bills, subscriptions, vendors, complaints, insurance, documents or expenses to keep track of what needs paying, renewing or follow-up."
          cta={
            <>
              <button
                type="button"
                onClick={() => onNavigate('add')}
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
        <div className="space-y-3">
          <SectionCard title="Needs attention" eyebrow="Priority">
            {priorityItems.length > 0 ? (
              <div className="space-y-2">
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
            {todaySummary.dueCount > 0 ? (
              <div className="grid grid-cols-3 gap-2">
                <TodayMetric label="Due" value={todaySummary.dueCount} />
                <TodayMetric label="Follow-ups" value={todaySummary.followUpCount} />
                <TodayMetric
                  label="Amount"
                  value={formatAmount(todaySummary.amountDue)}
                />
              </div>
            ) : (
              <p className="rounded-xl bg-stone-50 px-3 py-3 text-sm font-semibold text-stone-600">
                Nothing due today.
              </p>
            )}
          </SectionCard>

          <div className="grid grid-cols-2 gap-2">
            {summaries.map((summary) => (
              <SummaryTile key={summary.title} {...summary} />
            ))}
          </div>
        </div>
      )}

      <ItemDetailSheet
        item={selectedItem}
        onClose={() => setSelectedItem(null)}
        onItemDeleted={() => refreshItems(null)}
        onItemUpdated={refreshItems}
      />
    </>
  )
}

function TodayMetric({ label, value }) {
  return (
    <div className="rounded-xl bg-stone-50 px-2 py-2 text-center">
      <p className="text-[10px] font-bold uppercase tracking-[0.08em] text-stone-500">
        {label}
      </p>
      <p className="mt-1 text-sm font-bold text-stone-950">{value}</p>
    </div>
  )
}

export default HomePage
