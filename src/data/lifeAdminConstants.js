export { getItemTypeMeta, itemTypes } from './itemTypes'
export { indiaFirstCategories, paymentModes } from './categories'

export const statuses = [
  { id: 'pending', label: 'Pending', tone: 'amber' },
  { id: 'unpaid', label: 'Unpaid', tone: 'amber' },
  { id: 'due-soon', label: 'Due Soon', tone: 'amber' },
  { id: 'overdue', label: 'Overdue', tone: 'rose' },
  { id: 'paid', label: 'Paid', tone: 'emerald' },
  { id: 'open', label: 'Open', tone: 'sky' },
  { id: 'followed_up', label: 'Followed up', tone: 'violet' },
  { id: 'follow-up', label: 'Follow-up', tone: 'violet' },
  { id: 'resolved', label: 'Resolved', tone: 'emerald' },
  { id: 'closed', label: 'Closed', tone: 'slate' },
  { id: 'archived', label: 'Archived', tone: 'slate' },
]
