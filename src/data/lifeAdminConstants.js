export { getItemTypeMeta, itemTypes } from './itemTypes'
export {
  billCategories,
  expenseCategories,
  incomeCategories,
  indiaFirstCategories,
  paymentModes,
} from './categories'

export const statuses = [
  { id: 'pending', label: 'Pending', tone: 'amber' },
  { id: 'unpaid', label: 'Unpaid', tone: 'amber' },
  { id: 'paid', label: 'Paid', tone: 'emerald' },
  { id: 'received', label: 'Received', tone: 'emerald' },
  { id: 'expected', label: 'Expected', tone: 'sky' },
  { id: 'overdue', label: 'Overdue', tone: 'rose' },
  { id: 'open', label: 'Open', tone: 'sky' },
  { id: 'followed_up', label: 'Followed up', tone: 'violet' },
  { id: 'resolved', label: 'Resolved', tone: 'emerald' },
  { id: 'closed', label: 'Closed', tone: 'slate' },
]

const legacyStatusLabels = {
  archived: { id: 'archived', label: 'Archived', tone: 'slate' },
  'due-soon': { id: 'due-soon', label: 'Due soon', tone: 'amber' },
  'follow-up': { id: 'follow-up', label: 'Followed up', tone: 'violet' },
}

export function getStatusMeta(status) {
  return (
    statuses.find((item) => item.id === status) ??
    legacyStatusLabels[status] ?? {
      id: status,
      label: String(status || 'Pending'),
      tone: 'slate',
    }
  )
}
