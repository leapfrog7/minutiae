import EmptyState from '../common/EmptyState'
import SectionCard from '../common/SectionCard'

function RecordSection({ description, title }) {
  return (
    <SectionCard title={title}>
      <EmptyState title="Nothing saved yet" description={description} />
    </SectionCard>
  )
}

export default RecordSection
