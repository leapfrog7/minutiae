import { useEffect, useMemo, useState } from 'react'
import ItemCard from '../components/common/ItemCard'
import ItemDetailSheet from '../components/common/ItemDetailSheet'
import SectionCard from '../components/common/SectionCard'
import AppHeader from '../components/layout/AppHeader'
import SummaryTile from '../components/dashboard/SummaryTile'
import {
  getCategoryBreakdown,
  getMonthlyExpenseItems,
  getMonthlyExpenseTotal,
  getOneTimeMonthlyExpenseTotal,
  getRecurringMonthlyCost,
} from '../features/lifeItems/lifeItemHelpers'
import { formatCurrency, getCurrentMonthKey } from '../features/lifeItems/lifeItemFormatters'
import {
  getLifeItems,
  seedLifeItemsIfEmpty,
} from '../features/lifeItems/lifeItemStorage'

function MoneyPage() {
  const [items, setItems] = useState([])
  const [selectedItem, setSelectedItem] = useState(null)

  useEffect(() => {
    setItems(seedLifeItemsIfEmpty())
  }, [])

  function refreshItems(nextSelectedItem) {
    setItems(getLifeItems())
    setSelectedItem(nextSelectedItem ?? null)
  }

  const monthKey = getCurrentMonthKey()
  const monthlyItems = useMemo(
    () => getMonthlyExpenseItems(items, monthKey),
    [items, monthKey],
  )
  const categoryBreakdown = useMemo(
    () => getCategoryBreakdown(items, monthKey),
    [items, monthKey],
  )
  const monthlyTotal = getMonthlyExpenseTotal(items, monthKey)
  const recurringTotal = getRecurringMonthlyCost(items, monthKey)
  const oneTimeTotal = getOneTimeMonthlyExpenseTotal(items, monthKey)

  return (
    <>
      <AppHeader
        title="Money"
        eyebrow="Household spending view"
        description="A practical money snapshot for bills, vendors, subscriptions, and daily expenses."
      />

      <div className="grid grid-cols-2 gap-2">
        <SummaryTile
          title="This Month"
          value={formatCurrency(monthlyTotal)}
          detail="All tracked spends"
          status="paid"
        />
        <SummaryTile
          title="Recurring"
          value={formatCurrency(recurringTotal)}
          detail="Bills and subscriptions"
          status="due-soon"
        />
        <SummaryTile
          title="One-time"
          value={formatCurrency(oneTimeTotal)}
          detail="Ad hoc expenses"
          status="open"
        />
      </div>

      <div className="mt-3 space-y-3">
        <SectionCard title="Category breakdown">
          <div className="space-y-2">
            {categoryBreakdown.slice(0, 6).map((item) => (
              <div
                key={item.category}
                className="flex items-center justify-between rounded-xl bg-stone-50 px-3 py-2 text-sm"
              >
                <span className="font-medium text-stone-700">{item.category}</span>
                <span className="font-semibold text-stone-950">
                  {formatCurrency(item.total)}
                </span>
              </div>
            ))}
          </div>
        </SectionCard>

        <SectionCard title="Recent expense items">
          <div className="space-y-2">
            {monthlyItems.slice(0, 5).map((item) => (
              <ItemCard key={item.id} item={item} onOpen={setSelectedItem} />
            ))}
          </div>
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

export default MoneyPage
