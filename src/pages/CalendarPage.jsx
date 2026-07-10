import { useEffect, useMemo, useState } from 'react'
import AgendaGroup from '../components/calendar/AgendaGroup'
import EmptyState from '../components/common/EmptyState'
import ItemDetailSheet from '../components/common/ItemDetailSheet'
import AppHeader from '../components/layout/AppHeader'
import {
  getCalendarItems,
  getQuickStatusAction,
  groupAgendaItems,
} from '../features/lifeItems/lifeItemHelpers'
import {
  getLifeItems,
  updateLifeItem,
} from '../features/lifeItems/lifeItemStorage'

const today = () => new Date().toISOString().slice(0, 10)

const filterOptions = [
  { id: 'all', label: 'All' },
  { id: 'bill', label: 'Bills' },
  { id: 'subscription', label: 'Subscriptions' },
  { id: 'vendor', label: 'Vendors' },
  { id: 'insurance', label: 'Insurance' },
  { id: 'complaint', label: 'Complaints' },
  { id: 'document', label: 'Documents' },
]

function CalendarPage({ onNavigate }) {
  const [items, setItems] = useState([])
  const [selectedItem, setSelectedItem] = useState(null)
  const [selectedType, setSelectedType] = useState('all')

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

  const filteredItems = useMemo(() => {
    const calendarItems = getCalendarItems(items)

    return selectedType === 'all'
      ? calendarItems
      : calendarItems.filter((item) => item.type === selectedType)
  }, [items, selectedType])
  const agendaGroups = groupAgendaItems(filteredItems)
  const hasItems = items.length > 0
  const hasAgendaItems = agendaGroups.some((group) => group.items.length > 0)

  return (
    <>
      <AppHeader
        title="🗓️ Calendar"
        eyebrow="Agenda, not a month grid"
        description="Upcoming dues, renewals, vendor payments, complaint follow-ups, and expiries."
      />

      {hasItems && (
        <div className="-mx-4 mb-3 flex gap-2 overflow-x-auto px-4 pb-1">
          {filterOptions.map((option) => {
            const isActive = option.id === selectedType

            return (
              <button
                key={option.id}
                type="button"
                onClick={() => setSelectedType(option.id)}
                className={`shrink-0 rounded-full px-3 py-2 text-xs font-bold ${
                  isActive
                    ? 'bg-teal-700 text-white'
                    : 'bg-white text-stone-600 ring-1 ring-stone-200'
                }`}
              >
                {option.label}
              </button>
            )
          })}
        </div>
      )}

      <div className="space-y-4">
        {hasAgendaItems ? (
          agendaGroups.map((group) => (
            <AgendaGroup
              key={group.label}
              {...group}
              onOpenItem={setSelectedItem}
              onQuickAction={handleQuickAction}
            />
          ))
        ) : !hasItems ? (
          <EmptyState
            title="Nothing scheduled yet"
            description="Add a bill, subscription, vendor payment, complaint follow-up, insurance due date or document expiry to see your household timeline here."
            cta={
              <button
                type="button"
                onClick={() => onNavigate('add')}
                className="rounded-2xl bg-teal-700 px-4 py-3 text-sm font-bold text-white"
              >
                Add item
              </button>
            }
          />
        ) : (
          <EmptyState
            title="No pending dates"
            description="You are clear for now. Completed records remain available in Records."
          />
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

export default CalendarPage
