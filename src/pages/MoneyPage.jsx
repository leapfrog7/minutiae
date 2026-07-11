import { useMemo, useState } from 'react'
import CollapsibleSection from '../components/common/CollapsibleSection'
import EmptyState from '../components/common/EmptyState'
import ItemCard from '../components/common/ItemCard'
import ItemDetailSheet from '../components/common/ItemDetailSheet'
import SectionCard from '../components/common/SectionCard'
import AppHeader from '../components/layout/AppHeader'
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
  const [items, setItems] = useState(() => getLifeItems())
  const [selectedItem, setSelectedItem] = useState(null)
  const [selectedMonth, setSelectedMonth] = useState(getCurrentMonthKey())

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
  const paidExpenseItems = useMemo(
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
  const scheduledAutoPayItems = useMemo(
    () => obligations.items.filter(isScheduledAutoPay),
    [obligations],
  )
  const scheduledAutoPayTotal = scheduledAutoPayItems.reduce(
    (total, item) => total + Number(item.amount || item.amountDue || 0),
    0,
  )
  const unpaidExpenseItems = useMemo(
    () => getUnpaidExpenseItemsForMonth(items, selectedMonth),
    [items, selectedMonth],
  )
  const unpaidExpenseTotal = unpaidExpenseItems.reduce(
    (total, item) => total + Number(item.amount || 0),
    0,
  )
  const hasIncome = incomeItems.length > 0
  const hasPaidExpenses = paidExpenseItems.length > 0
  const hasMonthlyPicture = hasIncome || hasPaidExpenses

  return (
    <>
      <AppHeader
        title="Money"
        eyebrow="Household spending view"
        description="Income received, paid expenses, and balance for the selected month."
      />

      <div className="space-y-3 md:space-y-4">
        <SectionCard className="md:max-w-xl">
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

        <MonthlyPicture
          incomeTotal={incomeTotal}
          monthlyBalance={monthlyBalance}
          paidExpenseTotal={expenseStats.total}
        />

        {!hasMonthlyPicture && (
          <EmptyState
            title="No money records for this month"
            description="Add income or paid expenses to see your monthly picture."
            cta={
              <div className="grid grid-cols-2 gap-2 md:max-w-md">
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

        <div className="grid gap-2 md:grid-cols-3">
          <InsightCard
            title="Top category"
            value={
              expenseStats.topCategory
                ? expenseStats.topCategory.category
                : 'No paid expenses yet'
            }
            detail={
              expenseStats.topCategory
                ? `${formatAmount(expenseStats.topCategory.total)} of paid expenses`
                : 'Add paid expenses to see this.'
            }
          />
          <InsightCard
            title="Largest expense"
            value={getLargestExpenseValue(expenseStats.largestExpense)}
            detail={getLargestExpenseDetail(expenseStats.largestExpense)}
          />
          <InsightCard
            title="Savings rate"
            value={savingsRate === null ? 'Not available yet' : `${savingsRate}%`}
            detail={
              savingsRate === null
                ? 'Add received income to calculate this.'
                : 'Of received income after paid expenses.'
            }
          />
        </div>

        <CollapsibleSection
          title="Category breakdown"
          subtitle="Paid expenses only."
          badge={hasPaidExpenses ? formatAmount(expenseStats.total) : undefined}
          defaultOpen
        >
          {categoryBreakdown.length > 0 ? (
            <div className="space-y-3">
              {categoryBreakdown.map((item) => (
                <CategoryBar key={item.category} item={item} />
              ))}
            </div>
          ) : (
            <QuietNote>No paid expenses to break down yet.</QuietNote>
          )}
        </CollapsibleSection>

        {paidExpenseItems.length > 0 && (
          <CollapsibleSection
            title="Recent paid expenses"
            subtitle="Newest paid expenses in this month."
            badge={`${paidExpenseItems.length} item${paidExpenseItems.length === 1 ? '' : 's'}`}
            defaultOpen={paidExpenseItems.length <= 3}
          >
            <div className="space-y-2">
              {paidExpenseItems.map((item) => (
                <ItemCard key={item.id} item={item} onOpen={setSelectedItem} />
              ))}
            </div>
          </CollapsibleSection>
        )}

        {(incomeItems.length > 0 || expectedIncomeItems.length > 0) && (
          <CollapsibleSection
            title="Income details"
            subtitle="Received income is counted in Balance. Expected income is separate."
            badge={formatAmount(incomeTotal)}
            defaultOpen={incomeItems.length <= 2 && expectedIncomeItems.length === 0}
          >
            <IncomeDetails
              expectedIncomeItems={expectedIncomeItems}
              expectedIncomeTotal={expectedIncomeTotal}
              incomeBreakdown={incomeBreakdown}
              incomeItems={incomeItems}
              onOpenItem={setSelectedItem}
            />
          </CollapsibleSection>
        )}

        {unpaidExpenseItems.length > 0 && (
          <CollapsibleSection
            title="Unpaid expenses"
            subtitle="Not included in paid expenses."
            badge={formatAmount(unpaidExpenseTotal)}
          >
            <QuietNote>Open any item to mark it paid.</QuietNote>
            <div className="mt-3 space-y-2">
              {unpaidExpenseItems.map((item) => (
                <ItemCard key={item.id} item={item} onOpen={setSelectedItem} />
              ))}
            </div>
          </CollapsibleSection>
        )}

        {scheduledAutoPayItems.length > 0 && (
          <CollapsibleSection
            title="Scheduled auto-pay"
            subtitle="Projected, not counted as paid expenses."
            badge={formatAmount(scheduledAutoPayTotal)}
          >
            <div className="space-y-2">
              {scheduledAutoPayItems.map((item) => (
                <ItemCard key={item.id} item={item} onOpen={setSelectedItem} />
              ))}
            </div>
          </CollapsibleSection>
        )}

        {obligations.count > 0 && (
          <CollapsibleSection
            title="Recurring obligations"
            subtitle="Scheduled obligations, not actual spending until recorded as paid expenses."
            badge={formatAmount(obligations.total)}
          >
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
          </CollapsibleSection>
        )}
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

function MonthlyPicture({ incomeTotal, monthlyBalance, paidExpenseTotal }) {
  return (
    <section className="rounded-3xl border border-teal-100 bg-white p-4 shadow-sm shadow-stone-200/70 md:p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.12em] text-teal-700">
            Monthly picture
          </p>
          <h2 className="mt-1 text-lg font-bold text-stone-950">
            Money in, money out
          </h2>
        </div>
      </div>
      <div className="mt-4 grid gap-2 md:grid-cols-3">
        <MoneyMetric
          label="Income received"
          value={formatAmount(incomeTotal)}
          tone="income"
        />
        <MoneyMetric
          label="Paid expenses"
          value={formatAmount(paidExpenseTotal)}
          tone="expense"
        />
        <MoneyMetric
          label="Balance"
          value={formatAmount(monthlyBalance)}
          tone={monthlyBalance >= 0 ? 'balance' : 'shortfall'}
        />
      </div>
    </section>
  )
}

function MoneyMetric({ label, tone, value }) {
  const toneClass = {
    balance: 'bg-teal-50 text-teal-800',
    expense: 'bg-rose-50 text-rose-800',
    income: 'bg-emerald-50 text-emerald-800',
    shortfall: 'bg-amber-50 text-amber-800',
  }[tone]

  return (
    <div className={`rounded-2xl px-3 py-3 ${toneClass}`}>
      <p className="text-[11px] font-bold uppercase tracking-[0.1em]">
        {label}
      </p>
      <p className="mt-2 break-words text-xl font-black text-stone-950">
        {value}
      </p>
    </div>
  )
}

function InsightCard({ detail, title, value }) {
  return (
    <article className="rounded-2xl border border-stone-200 bg-white px-3 py-3 shadow-sm shadow-stone-200/50">
      <p className="text-xs font-bold uppercase tracking-[0.1em] text-stone-500">
        {title}
      </p>
      <p className="mt-2 break-words text-sm font-bold text-stone-950">
        {value}
      </p>
      <p className="mt-1 text-xs leading-5 text-stone-500">{detail}</p>
    </article>
  )
}

function CategoryBar({ item }) {
  return (
    <div>
      <div className="mb-1 flex items-center justify-between gap-3 text-sm">
        <span className="font-semibold text-stone-800">{item.category}</span>
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
  )
}

function IncomeDetails({
  expectedIncomeItems,
  expectedIncomeTotal,
  incomeBreakdown,
  incomeItems,
  onOpenItem,
}) {
  return (
    <div className="space-y-4">
      {incomeBreakdown.length > 0 && (
        <div>
          <h3 className="mb-2 text-xs font-bold uppercase tracking-[0.12em] text-stone-500">
            Income received
          </h3>
          <div className="space-y-2">
            {incomeBreakdown.map((item) => (
              <div
                key={item.category}
                className="flex items-center justify-between gap-3 rounded-xl bg-emerald-50 px-3 py-2 text-sm"
              >
                <span className="font-semibold text-emerald-800">
                  {item.category}
                </span>
                <span className="font-bold text-stone-950">
                  {formatAmount(item.total)} - {item.percentage}%
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {incomeItems.length > 0 && (
        <div>
          <h3 className="mb-2 text-xs font-bold uppercase tracking-[0.12em] text-stone-500">
            Received entries
          </h3>
          <div className="space-y-2">
            {incomeItems.map((item) => (
              <ItemCard key={item.id} item={item} onOpen={onOpenItem} />
            ))}
          </div>
        </div>
      )}

      {expectedIncomeItems.length > 0 && (
        <div>
          <h3 className="mb-2 text-xs font-bold uppercase tracking-[0.12em] text-stone-500">
            Expected income
          </h3>
          <QuietNote>
            {formatAmount(expectedIncomeTotal)} expected. This is not included
            in received income or Balance.
          </QuietNote>
          <div className="mt-3 space-y-2">
            {expectedIncomeItems.map((item) => (
              <ItemCard key={item.id} item={item} onOpen={onOpenItem} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function QuietNote({ children }) {
  return (
    <p className="rounded-xl bg-stone-50 px-3 py-3 text-sm font-semibold text-stone-600">
      {children}
    </p>
  )
}

function getLargestExpenseValue(item) {
  if (!item) {
    return 'No paid expenses yet'
  }

  return `${formatAmount(item.amount)} - ${item.title || item.category || 'Expense'}`
}

function getLargestExpenseDetail(item) {
  if (!item) {
    return 'Add paid expenses to see this.'
  }

  const date = item.date ? formatDisplayDate(item.date) : ''
  const category = item.category || 'Expense'

  return [category, date].filter(Boolean).join(' - ')
}

function isScheduledAutoPay(item) {
  return (
    item.autoPay === true ||
    item.autoPay === 'yes' ||
    item.autoRenewal === true ||
    item.paymentMode === 'Auto Debit'
  )
}

export default MoneyPage
