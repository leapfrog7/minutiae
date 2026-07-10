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
  getExpectedIncomeItemsForMonth,
  getExpectedIncomeTotalForMonth,
  getIncomeBreakdown,
  getIncomeTotalForMonth,
  getMonthLabel,
  getMonthlyBalance,
  getRecurringObligationsForMonth,
  getReceivedIncomeItemsForMonth,
  getSavingsRate,
  getUnpaidExpenseItemsForMonth,
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
  const incomeItems = useMemo(
    () => getReceivedIncomeItemsForMonth(items, selectedMonth),
    [items, selectedMonth],
  )
  const expectedIncomeItems = useMemo(
    () => getExpectedIncomeItemsForMonth(items, selectedMonth),
    [items, selectedMonth],
  )
  const incomeTotal = useMemo(
    () => getIncomeTotalForMonth(items, selectedMonth),
    [items, selectedMonth],
  )
  const expectedIncomeTotal = useMemo(
    () => getExpectedIncomeTotalForMonth(items, selectedMonth),
    [items, selectedMonth],
  )
  const monthlyBalance = useMemo(
    () => getMonthlyBalance(items, selectedMonth),
    [items, selectedMonth],
  )
  const savingsRate = useMemo(
    () => getSavingsRate(items, selectedMonth),
    [items, selectedMonth],
  )
  const incomeBreakdown = useMemo(
    () => getIncomeBreakdown(items, selectedMonth),
    [items, selectedMonth],
  )
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
  const unpaidExpenseItems = useMemo(
    () => getUnpaidExpenseItemsForMonth(items, selectedMonth),
    [items, selectedMonth],
  )
  const unpaidExpenseTotal = unpaidExpenseItems.reduce(
    (total, item) => total + Number(item.amount || 0),
    0,
  )
  const hasExpenses = expenseStats.count > 0
  const hasIncome = incomeItems.length > 0
  const hasMoneyRecords = hasIncome || hasExpenses

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
        <div className="grid grid-cols-2 gap-2">
          <SummaryTile
            title="Income received"
            value={formatAmount(incomeTotal)}
            detail={`${incomeItems.length} entries`}
            status="received"
          />
          <SummaryTile
            title="Paid expenses"
            value={formatAmount(expenseStats.total)}
            detail={`${expenseStats.count} entries`}
            status="paid"
          />
          <SummaryTile
            title="Balance"
            value={formatAmount(monthlyBalance)}
            detail="Income minus expenses"
            status={monthlyBalance >= 0 ? 'received' : 'overdue'}
          />
          <SummaryTile
            title="Savings rate"
            value={savingsRate === null ? '-' : `${savingsRate}%`}
            detail="Of received income"
            status="open"
          />
        </div>

        {!hasMoneyRecords && (
          <EmptyState
            title="No money records yet"
            description="Add salary, other income, or expenses to see your monthly balance."
            cta={
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => onNavigate({ page: 'add', type: 'income' })}
                  className="rounded-2xl bg-teal-700 px-4 py-3 text-sm font-bold text-white"
                >
                  Add income
                </button>
                <button
                  type="button"
                  onClick={() => onNavigate({ page: 'add', type: 'expense' })}
                  className="rounded-2xl bg-stone-900 px-4 py-3 text-sm font-bold text-white"
                >
                  Add expense
                </button>
              </div>
            }
          />
        )}

        {hasIncome ? (
          <SectionCard title="Income">
            <div className="mb-3 rounded-xl bg-emerald-50 px-3 py-2">
              <p className="text-[11px] font-bold uppercase tracking-[0.1em] text-emerald-700">
                Total income
              </p>
              <p className="mt-1 text-lg font-bold text-stone-950">
                {formatAmount(incomeTotal)}
              </p>
            </div>
            {incomeBreakdown.length > 0 && (
              <div className="mb-3 space-y-2">
                {incomeBreakdown.map((item) => (
                  <div key={item.category} className="flex items-center justify-between gap-3 rounded-xl bg-stone-50 px-3 py-2 text-sm">
                    <span className="font-semibold text-stone-700">{item.category}</span>
                    <span className="font-bold text-stone-950">
                      {formatAmount(item.total)} - {item.percentage}%
                    </span>
                  </div>
                ))}
              </div>
            )}
            <div className="space-y-2">
              {incomeItems.map((item) => (
                <ItemCard key={item.id} item={item} onOpen={setSelectedItem} />
              ))}
            </div>
          </SectionCard>
        ) : (
          hasMoneyRecords && (
            <EmptyState
              title="No income recorded for this month"
              description="Add salary or other income to compare money in and money out."
              cta={
                <button
                  type="button"
                  onClick={() => onNavigate({ page: 'add', type: 'income' })}
                  className="rounded-2xl bg-teal-700 px-4 py-3 text-sm font-bold text-white"
                >
                  Add income
                </button>
              }
            />
          )
        )}

        {expectedIncomeItems.length > 0 && (
          <SectionCard title="Expected income">
            <div className="mb-3 grid grid-cols-2 gap-2">
              <div className="rounded-xl bg-sky-50 px-3 py-2">
                <p className="text-[11px] font-bold uppercase tracking-[0.1em] text-sky-700">
                  Expected
                </p>
                <p className="mt-1 text-lg font-bold text-stone-950">
                  {formatAmount(expectedIncomeTotal)}
                </p>
              </div>
              <div className="rounded-xl bg-sky-50 px-3 py-2">
                <p className="text-[11px] font-bold uppercase tracking-[0.1em] text-sky-700">
                  Count
                </p>
                <p className="mt-1 text-lg font-bold text-stone-950">
                  {expectedIncomeItems.length}
                </p>
              </div>
            </div>
            <div className="space-y-2">
              {expectedIncomeItems.map((item) => (
                <ItemCard key={item.id} item={item} onOpen={setSelectedItem} />
              ))}
            </div>
          </SectionCard>
        )}

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
          hasMoneyRecords && (
          <EmptyState
            title="No paid expenses recorded yet"
            description="Add grocery, fuel, eating out, medical, shopping or household expenses as paid to see where the month went."
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
          )
        )}

        {unpaidExpenseItems.length > 0 && (
          <SectionCard title="Unpaid expenses">
            <div className="mb-3 grid grid-cols-2 gap-2">
              <div className="rounded-xl bg-amber-50 px-3 py-2">
                <p className="text-[11px] font-bold uppercase tracking-[0.1em] text-amber-700">
                  Total pending
                </p>
                <p className="mt-1 text-lg font-bold text-stone-950">
                  {formatAmount(unpaidExpenseTotal)}
                </p>
              </div>
              <div className="rounded-xl bg-amber-50 px-3 py-2">
                <p className="text-[11px] font-bold uppercase tracking-[0.1em] text-amber-700">
                  Count
                </p>
                <p className="mt-1 text-lg font-bold text-stone-950">
                  {unpaidExpenseItems.length}
                </p>
              </div>
            </div>
            <div className="space-y-2">
              {unpaidExpenseItems.map((item) => (
                <ItemCard key={item.id} item={item} onOpen={setSelectedItem} />
              ))}
            </div>
          </SectionCard>
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
