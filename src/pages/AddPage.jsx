import { useEffect, useState } from 'react'
import AddItemForm from '../components/add/AddItemForm'
import AddItemTypeSelector from '../components/add/AddItemTypeSelector'
import SectionCard from '../components/common/SectionCard'
import AppHeader from '../components/layout/AppHeader'
import { itemTypes } from '../data/lifeAdminConstants'
import { getItemTypeMeta } from '../data/itemTypes'
import { addLifeItemWithLinkedExpense } from '../features/lifeItems/lifeItemStorage'

function AddPage({ initialType = '', onNavigate }) {
  const [selectedType, setSelectedType] = useState(initialType)
  const [savedItem, setSavedItem] = useState(null)

  useEffect(() => {
    if (initialType) {
      setSavedItem(null)
      setSelectedType(initialType)
    }
  }, [initialType])

  useEffect(() => {
    function handleInternalBack(event) {
      if (!selectedType && !savedItem) {
        return
      }

      event.preventDefault()
      setSavedItem(null)
      setSelectedType('')
    }

    window.addEventListener('minutiae:back', handleInternalBack)
    return () => window.removeEventListener('minutiae:back', handleInternalBack)
  }, [savedItem, selectedType])

  function handleSave(item, options) {
    setSavedItem(addLifeItemWithLinkedExpense(item, options).item)
  }

  function handleAddAnother() {
    setSavedItem(null)
    setSelectedType('')
  }

  if (savedItem) {
    const typeMeta = getItemTypeMeta(savedItem.type)

    return (
      <>
        <AppHeader
          title="Add"
          eyebrow="Saved to Minutiae"
          description="This item is now available in Records and will show up in Calendar or Money where relevant."
        />

        <SectionCard title={`${typeMeta.emoji} ${savedItem.title}`}>
          <p className="text-sm text-stone-600">Saved to Minutiae</p>
          <div className="mt-4 grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={handleAddAnother}
              className="rounded-2xl bg-stone-100 px-4 py-3 text-sm font-bold text-stone-800"
            >
              Add another
            </button>
            <button
              type="button"
              onClick={() => onNavigate('records')}
              className="rounded-2xl bg-teal-700 px-4 py-3 text-sm font-bold text-white"
            >
              View records
            </button>
          </div>
        </SectionCard>
      </>
    )
  }

  return (
    <>
      <AppHeader
        title="Add"
        eyebrow="Capture a household item"
        description={
          selectedType
            ? 'Add just enough detail to make this easy to find and follow up.'
            : 'Choose what you want to track.'
        }
      />

      {selectedType ? (
        <AddItemForm
          selectedType={selectedType}
          onBack={() => setSelectedType('')}
          onSave={handleSave}
        />
      ) : (
        <AddItemTypeSelector
          itemTypes={itemTypes.map((item) => ({
            ...item,
            label:
              item.id === 'complaint'
                ? 'Complaint'
                : item.id === 'document'
                  ? 'Document'
                  : item.label,
          }))}
          onSelectType={setSelectedType}
        />
      )}
    </>
  )
}

export default AddPage
