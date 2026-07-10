import { useEffect, useMemo, useState } from 'react'
import ItemCard from '../components/common/ItemCard'
import ItemDetailSheet from '../components/common/ItemDetailSheet'
import SectionCard from '../components/common/SectionCard'
import SummaryTile from '../components/dashboard/SummaryTile'
import AppHeader from '../components/layout/AppHeader'
import {
  getItemsDueSoon,
  getMonthlyExpenseTotal,
  getOpenComplaints,
  getOverdueItems,
  getUpcomingRenewals,
} from '../features/lifeItems/lifeItemHelpers'
import { formatCurrency, getCurrentMonthKey } from '../features/lifeItems/lifeItemFormatters'
import {
  getLifeItems,
  seedLifeItemsIfEmpty,
} from '../features/lifeItems/lifeItemStorage'

const previewLimit = 3

function HomePage() {
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
  const dueSoonItems = useMemo(() => getItemsDueSoon(items), [items])
  const overdueItems = useMemo(() => getOverdueItems(items), [items])
  const openComplaints = useMemo(() => getOpenComplaints(items), [items])
  const upcomingRenewals = useMemo(() => getUpcomingRenewals(items), [items])
  const monthlyTotal = useMemo(
    () => getMonthlyExpenseTotal(items, monthKey),
    [items, monthKey],
  )

  const summaries = [
    { title: 'Due Soon', value: dueSoonItems.length, detail: 'Next 7 days', status: 'due-soon' },
    { title: 'Overdue', value: overdueItems.length, detail: 'Needs attention', status: 'overdue' },
    { title: 'Open Complaints', value: openComplaints.length, detail: 'Awaiting follow-up', status: 'open' },
    { title: 'Monthly Spending', value: formatCurrency(monthlyTotal), detail: 'Current month', status: 'paid' },
    { title: 'Upcoming Renewals', value: upcomingRenewals.length, detail: 'Next 30 days', status: 'follow-up' },
  ]

  const settingsAction = (
    <button
      type="button"
      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-stone-200 bg-white text-stone-600 shadow-sm shadow-stone-200/70"
      aria-label="Open settings"
    >
      ⚙️
    </button>
  )

  return (
    <>
      <AppHeader action={settingsAction} />

      <div className="grid grid-cols-2 gap-2">
        {summaries.map((summary) => (
          <SummaryTile key={summary.title} {...summary} />
        ))}
      </div>

      <div className="mt-3 space-y-3">
        <SectionCard title="Due soon">
          <div className="space-y-2">
            {dueSoonItems.slice(0, previewLimit).map((item) => (
              <ItemCard key={item.id} item={item} onOpen={setSelectedItem} />
            ))}
          </div>
        </SectionCard>

        <SectionCard title="Overdue">
          <div className="space-y-2">
            {overdueItems.slice(0, previewLimit).map((item) => (
              <ItemCard key={item.id} item={item} onOpen={setSelectedItem} />
            ))}
          </div>
        </SectionCard>

        <SectionCard title="Open complaints">
          <div className="space-y-2">
            {openComplaints.slice(0, previewLimit).map((item) => (
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

export default HomePage
