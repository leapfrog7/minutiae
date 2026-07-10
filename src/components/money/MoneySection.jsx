import EmptyState from '../common/EmptyState'
import SectionCard from '../common/SectionCard'

function MoneySection({ description, title }) {
  return (
    <SectionCard title={title}>
      <EmptyState
        title="Ready for entries"
        description={description}
      />
    </SectionCard>
  )
}

export default MoneySection
