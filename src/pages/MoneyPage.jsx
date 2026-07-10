import { useEffect, useMemo, useState } from 'react'
import EmptyState from '../components/common/EmptyState'
import ItemCard from '../components/common/ItemCard'
import ItemDetailSheet from '../components/common/ItemDetailSheet'
import SectionCard from '../components/common/SectionCard'
import AppHeader from '../components/layout/AppHeader'
import SummaryTile from '../components/dashboard/SummaryTile'
import {
  formatAmount,
  formatDisplayDate,
  getCategoryBreakdown,
  getCurrentMonthKey,
  getExpenseItemsForMonth,
  getExpenseStatsForMonth,
  getMonthLabel,
  getRecurringObligationsForMonth,
} from '../features/lifeItems/lifeItemHelpers'
import { getLifeItems } from '../features/lifeItems/lifeItemStorage'

const obligationGroups = [
  ['subscription', 'Subscriptions'],
  ['bill', 'Bills'],
  ['vendor', 'Vendors'],
  ['insurance', 'Insurance'],
]

function MoneyPage({ onNavigate }) {
  const [items, setItems] = useState([])
  const [selectedItem, setSelectedItem] = useState(null)
  const [selectedMonth, setSelectedMonth] = useState(getCurrentMonthKey())

  useEffect(() => {
    setItems(getLifeItems())
  }, [])

  function refreshItems(nextSelectedItem) {
    setItems(getLifeItems())
    setSelectedItem(nextSelectedItem ?? null)
  }

  function moveMonth(offset) {
    const date = new Date(`${selectedMonth}-01T00:00:00`)
    date.setMonth(date.getMonth() + offset)
    setSelectedMonth(
      `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`,
    )
  }

  const currentMonth = getCurrentMonthKey()
  const expenseItems = useMemo(
    () => getExpenseItemsForMonth(items, selectedMonth),
    [items, selectedMonth],
  )
  const expenseStats = useMemo(
    () => getExpenseStatsForMonth(items, selectedMonth),
    [items, selectedMonth],
  )
  const categoryBreakdown = useMemo(
    () => getCategoryBreakdown(items, selectedMonth),
    [items, selectedMonth],
  )
  const obligations = useMemo(
    () => getRecurringObligationsForMonth(items, selectedMonth),
    [items, selectedMonth],
  )
  const hasExpenses = expenseStats.count > 0

  return (
    <>
      <AppHeader
        title="💸 Money"
        eyebrow="Household spending view"
        description="Explicit expenses only, with obligations shown separately."
      />

      <SectionCard>
        <div className="flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={() => moveMonth(-1)}
            className="rounded-full bg-stone-100 px-3 py-2 text-sm font-bold text-stone-700"
            aria-label="Previous month"
          >
            Prev
          </button>
          <div className="text-center">
            <p className="text-xs font-bold uppercase tracking-[0.12em] text-stone-500">
              Month
            </p>
            <p className="text-base font-bold text-stone-950">
              {getMonthLabel(selectedMonth)}
            </p>
          </div>
          <button
            type="button"
            onClick={() => moveMonth(1)}
            className="rounded-full bg-stone-100 px-3 py-2 text-sm font-bold text-stone-700"
            aria-label="Next month"
          >
            Next
          </button>
        </div>
        {selectedMonth !== currentMonth && (
          <button
            type="button"
            onClick={() => setSelectedMonth(currentMonth)}
            className="mt-3 w-full rounded-2xl bg-teal-50 px-4 py-2.5 text-sm font-bold text-teal-800"
          >
            This month
          </button>
        )}
      </SectionCard>

      <div className="mt-3 space-y-3">
        {hasExpenses ? (
          <>
            <div className="grid grid-cols-2 gap-2">
              <SummaryTile
                title="Total expenses"
                value={formatAmount(expenseStats.total)}
                detail={`${expenseStats.count} entries`}
                status="paid"
              />
              <SummaryTile
                title="Daily average"
                value={formatAmount(Math.round(expenseStats.averageDailyExpense))}
                detail="Across the month"
                status="open"
              />
              <SummaryTile
                title="Largest"
                value={formatAmount(expenseStats.largestExpense?.amount)}
                detail={expenseStats.largestExpense?.title || 'No expense'}
                status="pending"
              />
              <SummaryTile
                title="Recurring"
                value={formatAmount(expenseStats.recurringTotal)}
                detail="Explicit recurring expenses"
                status="followed_up"
              />
            </div>

            <SectionCard title="Insights">
              <div className="grid gap-2">
                <InsightText>
                  {expenseStats.topCategory
                    ? `${expenseStats.topCategory.category} is your top category this month.`
                    : 'No top category yet.'}
                </InsightText>
                <InsightText>
                  {expenseStats.largestExpense
                    ? `Your largest expense was ${formatAmount(
                        expenseStats.largestExpense.amount,
                      )} for ${expenseStats.largestExpense.title}.`
                    : 'No largest expense yet.'}
                </InsightText>
                <InsightText>
                  {expenseStats.recurringShare > 0
                    ? `Recurring expenses are ${expenseStats.recurringShare}% of explicit spending.`
                    : 'No recurring expenses recorded for this month.'}
                </InsightText>
                {expenseStats.highestSpendingDay && (
                  <InsightText>
                    Highest spending day was{' '}
                    {formatDisplayDate(expenseStats.highestSpendingDay.date)}.
                  </InsightText>
                )}
              </div>
            </SectionCard>

            <SectionCard title="Category breakdown">
              <div className="space-y-3">
                {categoryBreakdown.map((item) => (
                  <div key={item.category}>
                    <div className="mb-1 flex items-center justify-between gap-3 text-sm">
                      <span className="font-semibold text-stone-800">
                        {item.category}
                      </span>
                      <span className="shrink-0 font-bold text-stone-950">
                        {formatAmount(item.total)} - {item.percentage}%
                      </span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-stone-100">
                      <div
                        className="h-full rounded-full bg-teal-600"
                        style={{ width: `${item.percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </SectionCard>

            <SectionCard title="Recent expenses">
              <div className="space-y-2">
                {expenseItems.map((item) => (
                  <ItemCard key={item.id} item={item} onOpen={setSelectedItem} />
                ))}
              </div>
            </SectionCard>
          </>
        ) : (
          <EmptyState
            title="No expenses recorded yet"
            description="Add grocery, fuel, eating out, medical, shopping or household expenses to see where the month went."
            cta={
              <button
                type="button"
                onClick={() => onNavigate({ page: 'add', type: 'expense' })}
                className="rounded-2xl bg-teal-700 px-4 py-3 text-sm font-bold text-white"
              >
                Add expense
              </button>
            }
          />
        )}

        <SectionCard title="Recurring obligations">
          <div className="mb-3 grid grid-cols-2 gap-2">
            <div className="rounded-xl bg-stone-50 px-3 py-2">
              <p className="text-[11px] font-bold uppercase tracking-[0.1em] text-stone-500">
                Total due
              </p>
              <p className="mt-1 text-lg font-bold text-stone-950">
                {formatAmount(obligations.total)}
              </p>
            </div>
            <div className="rounded-xl bg-stone-50 px-3 py-2">
              <p className="text-[11px] font-bold uppercase tracking-[0.1em] text-stone-500">
                Count
              </p>
              <p className="mt-1 text-lg font-bold text-stone-950">
                {obligations.count}
              </p>
            </div>
          </div>

          {obligations.count > 0 ? (
            <div className="space-y-3">
              {obligationGroups.map(([type, label]) => {
                const groupItems = obligations.groupedItems[type]

                if (groupItems.length === 0) {
                  return null
                }

                return (
                  <div key={type}>
                    <h3 className="mb-2 text-xs font-bold uppercase tracking-[0.12em] text-stone-500">
                      {label}
                    </h3>
                    <div className="space-y-2">
                      {groupItems.map((item) => (
                        <ItemCard
                          key={item.id}
                          item={item}
                          onOpen={setSelectedItem}
                        />
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <p className="rounded-xl bg-stone-50 px-3 py-3 text-sm text-stone-500">
              No subscriptions, bills, insurance premiums, or vendor payments due in{' '}
              {getMonthLabel(selectedMonth)}.
            </p>
          )}
          <p className="mt-3 text-xs leading-5 text-stone-500">
            These are obligations, not expenses. Add an expense when money is
            actually spent.
          </p>
        </SectionCard>
      </div>

      <ItemDetailSheet
        item={selectedItem}
        onClose={() => setSelectedItem(null)}
        onItemDeleted={() => refreshItems(null)}
        onItemUpdated={refreshItems}
      />
    </>
  )
}

function InsightText({ children }) {
  return (
    <p className="rounded-xl bg-stone-50 px-3 py-2 text-sm font-semibold text-stone-700">
      {children}
    </p>
  )
}

export default MoneyPage
