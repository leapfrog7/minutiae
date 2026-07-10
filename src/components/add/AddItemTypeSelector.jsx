import ItemTypeCard from './ItemTypeCard'

function AddItemTypeSelector({ itemTypes, onSelectType }) {
  return (
    <div className="grid gap-2">
      {itemTypes.map((item) => (
        <ItemTypeCard
          key={item.id}
          {...item}
          onSelect={() => onSelectType(item.id)}
        />
      ))}
    </div>
  )
}

export default AddItemTypeSelector
