import { useEffect, useMemo, useState } from 'react'
import ItemCard from '../components/common/ItemCard'
import ItemDetailSheet from '../components/common/ItemDetailSheet'
import SectionCard from '../components/common/SectionCard'
import AppHeader from '../components/layout/AppHeader'
import { getItemTypeMeta, itemTypes } from '../data/itemTypes'
import { sortItemsByRelevantDate } from '../features/lifeItems/lifeItemHelpers'
import {
  getLifeItems,
  seedLifeItemsIfEmpty,
} from '../features/lifeItems/lifeItemStorage'

const searchableFields = [
  'title',
  'category',
  'notes',
  'vendorName',
  'complaintId',
  'companyOrDepartment',
  'documentType',
]

const filterOptions = [
  { id: 'all', label: 'All' },
  { id: 'subscription', label: 'Subscriptions' },
  { id: 'bill', label: 'Bills' },
  { id: 'vendor', label: 'Vendors' },
  { id: 'complaint', label: 'Complaints' },
  { id: 'expense', label: 'Expenses' },
  { id: 'document', label: 'Documents' },
]

function RecordsPage() {
  const [items, setItems] = useState([])
  const [query, setQuery] = useState('')
  const [selectedType, setSelectedType] = useState('all')
  const [selectedItem, setSelectedItem] = useState(null)

  useEffect(() => {
    setItems(seedLifeItemsIfEmpty())
  }, [])

  function refreshItems(nextSelectedItem) {
    setItems(getLifeItems())
    setSelectedItem(nextSelectedItem ?? null)
  }

  const filteredItems = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase()
    const typeFilteredItems =
      selectedType === 'all'
        ? items
        : items.filter((item) => item.type === selectedType)

    if (!normalizedQuery) {
      return typeFilteredItems
    }

    return typeFilteredItems.filter((item) =>
      searchableFields.some((field) =>
        String(item[field] || '').toLowerCase().includes(normalizedQuery),
      ),
    )
  }, [items, query, selectedType])

  const visibleTypes =
    selectedType === 'all'
      ? itemTypes
      : itemTypes.filter((type) => type.id === selectedType)

  const groupedItems = visibleTypes.map((type) => ({
    ...getItemTypeMeta(type.id),
    items: sortItemsByRelevantDate(
      filteredItems.filter((item) => item.type === type.id),
    ),
  }))

  return (
    <>
      <AppHeader
        title="Records"
        eyebrow="Searchable archive"
        description="Receipts, documents, complaint IDs, vendor details, and payment history in one place."
      />

      <label className="mb-4 block">
        <span className="sr-only">Search records</span>
        <input
          type="search"
          placeholder="Search records"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          className="w-full rounded-2xl border border-stone-200 bg-white px-4 py-3 text-sm text-stone-900 shadow-sm shadow-stone-200/50 outline-none placeholder:text-stone-400 focus:border-teal-300 focus:ring-4 focus:ring-teal-100"
        />
      </label>

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

      <div className="space-y-3">
        {groupedItems.map((group) => (
          <SectionCard
            key={group.id}
            title={`${group.emoji} ${group.label}s`}
          >
            <div className="space-y-2">
              {group.items.length > 0 ? (
                group.items.map((item) => (
                  <ItemCard key={item.id} item={item} onOpen={setSelectedItem} />
                ))
              ) : (
                <p className="rounded-xl bg-stone-50 px-3 py-3 text-sm text-stone-500">
                  No matching records.
                </p>
              )}
            </div>
          </SectionCard>
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

export default RecordsPage
