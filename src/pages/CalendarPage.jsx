import { useEffect, useState } from 'react'
import AgendaGroup from '../components/calendar/AgendaGroup'
import ItemDetailSheet from '../components/common/ItemDetailSheet'
import AppHeader from '../components/layout/AppHeader'
import { groupAgendaItems } from '../features/lifeItems/lifeItemHelpers'
import {
  getLifeItems,
  seedLifeItemsIfEmpty,
} from '../features/lifeItems/lifeItemStorage'

function CalendarPage() {
  const [items, setItems] = useState([])
  const [selectedItem, setSelectedItem] = useState(null)

  useEffect(() => {
    setItems(seedLifeItemsIfEmpty())
  }, [])

  function refreshItems(nextSelectedItem) {
    setItems(getLifeItems())
    setSelectedItem(nextSelectedItem ?? null)
  }

  const agendaGroups = groupAgendaItems(items)

  return (
    <>
      <AppHeader
        title="Calendar"
        eyebrow="Agenda, not a month grid"
        description="Upcoming dues, renewals, vendor payments, complaint follow-ups, and expiries."
      />

      <div className="space-y-4">
        {agendaGroups.map((group) => (
          <AgendaGroup
            key={group.label}
            {...group}
            onOpenItem={setSelectedItem}
          />
        ))}
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
