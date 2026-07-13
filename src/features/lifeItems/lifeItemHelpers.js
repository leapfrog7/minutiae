import { getItemTypeMeta } from '../../data/itemTypes'

const inactiveStatuses = new Set([
  'paid',
  'completed',
  'received',
  'archived',
  'resolved',
  'closed',
])
const expenseSourceTypes = new Set([
  'bill',
  'subscription',
  'vendor',
  'insurance',
  'investment',
  'document',
])

const toDate = (value) => {
  if (!value) {
    return null
  }

  const date = new Date(`${value}T00:00:00`)
  return Number.isNaN(date.getTime()) ? null : date
}

const dayDifferenceFromToday = (dateValue) => {
  const itemDate = toDate(dateValue)

  if (!itemDate) {
    return null
  }

  const today = startOfToday()
  return Math.round((itemDate.getTime() - today.getTime()) / 86400000)
}

const startOfToday = () => {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return today
}

const addDays = (date, days) => {
  const nextDate = new Date(date)
  nextDate.setDate(nextDate.getDate() + days)
  return nextDate
}

const toDateInput = (date) => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

const addMonthsClamped = (date, months) => {
  const nextDate = new Date(date)
  const targetDay = nextDate.getDate()

  nextDate.setDate(1)
  nextDate.setMonth(nextDate.getMonth() + months)
  const lastDay = new Date(
    nextDate.getFullYear(),
    nextDate.getMonth() + 1,
    0,
  ).getDate()
  nextDate.setDate(Math.min(targetDay, lastDay))
  return nextDate
}

const monthKeyFromDateValue = (dateValue) => {
  const date = toDate(dateValue)
  return date ? getMonthKey(date) : ''
}

export function isCompletedItem(item) {
  if (
    item?.type === 'document' &&
    (item.nextServiceDate || item.expiryDate || item.warrantyTill)
  ) {
    return item.status === 'closed'
  }

  return inactiveStatuses.has(item.status)
}

const isActive = (item) => !isCompletedItem(item)

export function isActionableItem(item) {
  return !isCompletedItem(item) && Boolean(getRelevantDate(item))
}

export function formatAmount(value) {
  if (value === null || value === undefined || value === '') {
    return ''
  }

  return new Intl.NumberFormat('en-IN', {
    currency: 'INR',
    maximumFractionDigits: 0,
    style: 'currency',
  }).format(value)
}

export function formatDisplayDate(dateString) {
  if (!dateString) {
    return 'No date'
  }

  return new Intl.DateTimeFormat('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date(`${dateString}T00:00:00`))
}

export function formatRelativeDueLabel(dateString) {
  const diff = dayDifferenceFromToday(dateString)

  if (diff === null) {
    return 'No date'
  }

  if (diff === 0) {
    return 'Today'
  }

  if (diff === 1) {
    return 'Tomorrow'
  }

  if (diff === -1) {
    return 'Yesterday'
  }

  if (diff < 0) {
    return `${Math.abs(diff)} days overdue`
  }

  if (diff <= 7) {
    return `Due in ${diff} days`
  }

  return formatDisplayDate(dateString)
}

export function getMonthKey(date = new Date()) {
  const dateObject = date instanceof Date ? date : new Date(`${date}T00:00:00`)
  const year = dateObject.getFullYear()
  const month = String(dateObject.getMonth() + 1).padStart(2, '0')
  return `${year}-${month}`
}

export function getCurrentMonthKey() {
  return getMonthKey(new Date())
}

export function getMonthLabel(monthKey) {
  return new Intl.DateTimeFormat('en-IN', {
    month: 'long',
    year: 'numeric',
  }).format(new Date(`${monthKey}-01T00:00:00`))
}

export function getItemEmoji(itemOrType) {
  const type = typeof itemOrType === 'string' ? itemOrType : itemOrType?.type
  return getItemTypeMeta(type).emoji
}

export function getItemTypeLabel(type) {
  return getItemTypeMeta(type).label
}

export function formatCycleLabel(value) {
  if (!value) {
    return ''
  }

  const normalized = String(value).toLowerCase().replaceAll(' ', '_').replaceAll('-', '_')
  const labels = {
    monthly: 'Monthly',
    quarterly: 'Quarterly',
    six_monthly: 'Six-monthly',
    yearly: 'Yearly',
    one_time: 'One-time',
  }

  return labels[normalized] ?? String(value)
}

export function getLifeItemStats(items) {
  const counts = items.reduce(
    (summary, item) => {
      summary.total += 1
      summary[item.type] = (summary[item.type] || 0) + 1

      if (!isCompletedItem(item)) {
        summary.actionable += 1
      }

      if (item.updatedAt) {
        const updatedTime = new Date(item.updatedAt).getTime()

        if (!summary.lastUpdatedTime || updatedTime > summary.lastUpdatedTime) {
          summary.lastUpdatedTime = updatedTime
          summary.lastUpdated = item.updatedAt
        }
      }

      return summary
    },
    {
      actionable: 0,
      bill: 0,
      complaint: 0,
      document: 0,
      expense: 0,
      insurance: 0,
      income: 0,
      investment: 0,
      reminder: 0,
      lastUpdated: '',
      lastUpdatedTime: 0,
      subscription: 0,
      total: 0,
      vendor: 0,
    },
  )

  delete counts.lastUpdatedTime
  return counts
}

export function getRelevantDate(item) {
  if (item.type === 'reminder') {
    return item.dueDate
  }

  if (item.type === 'subscription') {
    return item.renewalDate || item.dueDate || item.date
  }

  if (item.type === 'bill') {
    return item.dueDate || item.date
  }

  if (item.type === 'vendor') {
    return item.paymentDate || item.dueDate || item.date
  }

  if (item.type === 'insurance') {
    return item.dueDate || item.date
  }

  if (item.type === 'complaint') {
    return item.followUpDate || item.expectedResolutionDate || item.dateRaised
  }

  if (item.type === 'expense') {
    return item.date
  }

  if (item.type === 'document') {
    return (
      item.nextServiceDate ||
      item.expiryDate ||
      item.warrantyTill ||
      item.documentDate ||
      item.serviceDate ||
      item.dueDate
    )
  }

  return item.dueDate || item.date
}

export function getRelevantDateLabel(item) {
  if (item?.type !== 'document') {
    return ''
  }

  const relevantDate = getRelevantDate(item)

  if (!relevantDate) {
    return ''
  }

  if (item.nextServiceDate === relevantDate) {
    return 'Service due'
  }

  if (item.expiryDate === relevantDate) {
    return 'Expiry due'
  }

  if (item.warrantyTill === relevantDate) {
    return 'Warranty ending'
  }

  return ''
}

export function getQuickStatusAction(item) {
  if (item.type === 'reminder' && item.status === 'pending') {
    return { label: 'Mark Completed', status: 'completed' }
  }

  if (item.type === 'income' && item.status === 'expected') {
    return { label: 'Mark Received', status: 'received' }
  }

  if (item.type === 'expense' && item.status === 'unpaid') {
    return { label: 'Mark Paid', status: 'paid' }
  }

  if (item.type === 'bill' && ['unpaid', 'overdue'].includes(item.status)) {
    return { label: 'Mark Paid', status: 'paid' }
  }

  if (item.type === 'investment' && ['unpaid', 'overdue'].includes(item.status)) {
    return { label: 'Mark Invested', status: 'paid' }
  }

  if (
    ['vendor', 'insurance'].includes(item.type) &&
    ['unpaid', 'overdue'].includes(item.status)
  ) {
    return { label: 'Mark Paid', status: 'paid' }
  }

  if (
    item.type === 'subscription' &&
    ['pending', 'unpaid', 'overdue', 'due-soon'].includes(item.status)
  ) {
    return { label: 'Mark Paid', status: 'paid' }
  }

  if (
    item.type === 'complaint' &&
    ['open', 'followed_up', 'follow-up'].includes(item.status)
  ) {
    return { label: 'Mark Resolved', status: 'resolved' }
  }

  if (item.type === 'document' && item.status === 'pending') {
    return { label: 'Mark Completed', status: 'completed' }
  }

  return null
}

export function canRecordPaymentAsExpense(item) {
  return isExpenseSourceType(item)
}

export function isExpenseSourceType(item) {
  return expenseSourceTypes.has(item?.type)
}

export function getItemAmount(item) {
  if (item.type === 'insurance') {
    return Number(item.premiumAmount || item.amount || 0)
  }

  if (item.type === 'vendor') {
    if (item.status === 'paid') {
      return Number(item.amountPaid || item.amount || item.monthlyAmount || item.usualAmount || 0)
    }

    return Number(item.amountDue || item.amount || item.monthlyAmount || item.usualAmount || 0)
  }

  return Number(item.amount || 0)
}

export function getExpenseCategoryForSourceItem(item) {
  const categoryByType = {
    bill: item.category || 'Bills',
    document: getDocumentExpenseCategory(item),
    insurance: 'Insurance',
    investment: 'Investment',
    subscription: 'Subscription',
    vendor: item.serviceType || 'Local Vendors',
  }

  return categoryByType[item.type] || 'Miscellaneous'
}

export function hasLinkedExpense(items, sourceItem) {
  return items.some(
    (item) => item.type === 'expense' && item.linkedItemId === sourceItem?.id,
  )
}

export function shouldOfferRecordExpense(item, items) {
  const statusCanCreateExpense =
    item?.type === 'document'
      ? ['paid', 'completed'].includes(item.status)
      : item?.status === 'paid'

  return (
    isExpenseSourceType(item) &&
    statusCanCreateExpense &&
    getItemAmount(item) > 0 &&
    !hasLinkedExpense(items, item)
  )
}

export function createExpenseFromSourceItem(sourceItem, dateOverride) {
  if (!isExpenseSourceType(sourceItem)) {
    return null
  }

  const title =
    sourceItem.type === 'vendor'
      ? getVendorTitle(sourceItem)
      : sourceItem.title
  const date =
    dateOverride ||
    (sourceItem.type === 'document'
      ? sourceItem.serviceDate || sourceItem.documentDate || ''
      : '') ||
    (sourceItem.type === 'vendor' ? sourceItem.paidDate || sourceItem.paymentDate : '') ||
    getDateInputValue()
  const notes =
    sourceItem.type === 'vendor'
      ? `Recorded from paid vendor payment: ${title}`
      : sourceItem.type === 'document'
        ? `Recorded from record/maintenance: ${title}`
      : `Recorded from paid ${sourceItem.type}: ${title}`

  return {
    type: 'expense',
    title,
    amount: getItemAmount(sourceItem),
    date,
    paidDate: date,
    category: getExpenseCategoryForSourceItem(sourceItem),
    paymentMode: sourceItem.paymentMode || '',
    recurring:
      sourceItem.type === 'document'
        ? false
        : sourceItem.type === 'investment'
          ? normalizeCycleValue(sourceItem.frequency) !== 'one_time'
        : sourceItem.type === 'vendor'
        ? ['monthly', 'weekly'].includes(sourceItem.paymentFrequency)
        : sourceItem.type !== 'bill',
    notes,
    linkedItemId: sourceItem.id,
    linkedItemType: sourceItem.type,
    status: 'paid',
  }
}

export const createExpenseFromPaidItem = createExpenseFromSourceItem

export function getNextCycleDate(dateString, frequency) {
  const normalizedFrequency = normalizeCycleValue(frequency)

  if (['one_time', 'as_needed', 'none', 'custom', ''].includes(normalizedFrequency)) {
    return null
  }

  const baseDate = dateString ? toDate(String(dateString).slice(0, 10)) : startOfToday()

  if (!baseDate) {
    return null
  }

  let nextDate = new Date(baseDate)

  if (normalizedFrequency === 'weekly') {
    nextDate.setDate(nextDate.getDate() + 7)
  } else if (normalizedFrequency === '3m') {
    nextDate = addMonthsClamped(nextDate, 3)
  } else if (normalizedFrequency === '6m') {
    nextDate = addMonthsClamped(nextDate, 6)
  } else if (normalizedFrequency === '9m') {
    nextDate = addMonthsClamped(nextDate, 9)
  } else if (normalizedFrequency === '1y') {
    nextDate = addMonthsClamped(nextDate, 12)
  } else if (normalizedFrequency === '2y') {
    nextDate = addMonthsClamped(nextDate, 24)
  } else if (normalizedFrequency === '3y') {
    nextDate = addMonthsClamped(nextDate, 36)
  } else if (normalizedFrequency === '5y') {
    nextDate = addMonthsClamped(nextDate, 60)
  } else if (normalizedFrequency === 'monthly') {
    nextDate = addMonthsClamped(nextDate, 1)
  } else if (normalizedFrequency === 'quarterly') {
    nextDate = addMonthsClamped(nextDate, 3)
  } else if (normalizedFrequency === 'six_monthly') {
    nextDate = addMonthsClamped(nextDate, 6)
  } else if (normalizedFrequency === 'yearly') {
    nextDate = addMonthsClamped(nextDate, 12)
  } else {
    return null
  }

  return toDateInput(nextDate)
}

export function getNextCycleFrequency(item) {
  if (item.type === 'reminder') {
    return item.recurring ? normalizeCycleValue(item.frequency) : ''
  }

  if (['bill', 'insurance', 'investment'].includes(item.type)) {
    return normalizeCycleValue(item.frequency)
  }

  if (item.type === 'vendor') {
    return normalizeCycleValue(item.paymentFrequency)
  }

  if (item.type === 'subscription') {
    return normalizeCycleValue(item.billingCycle)
  }

  if (item.type === 'document') {
    const reminder = getDocumentNextCycleReminder(item)
    return reminder.frequency
  }

  return ''
}

export function getNextCycleBaseDate(item) {
  if (item.type === 'reminder') {
    return item.dueDate || item.completedAt || getDateInputValue()
  }

  if (['bill', 'insurance', 'investment'].includes(item.type)) {
    return item.dueDate || item.paidDate || getDateInputValue()
  }

  if (item.type === 'vendor') {
    return item.paymentDate || item.dueDate || item.paidDate || getDateInputValue()
  }

  if (item.type === 'subscription') {
    return item.renewalDate || item.dueDate || item.paidDate || getDateInputValue()
  }

  if (item.type === 'document') {
    const reminder = getDocumentNextCycleReminder(item)
    return reminder.date || item.serviceDate || item.documentDate || getDateInputValue()
  }

  return getDateInputValue()
}

export function canCreateNextCycleReminder(item) {
  if (!['bill', 'vendor', 'subscription', 'insurance', 'investment', 'reminder', 'document'].includes(item?.type)) {
    return false
  }

  if (item.type === 'document' && !isRecurringDocumentRecord(item)) {
    return false
  }

  return Boolean(getNextCycleDate(getNextCycleBaseDate(item), getNextCycleFrequency(item)))
}

export function getNextReminderBehavior(item) {
  if (!canCreateNextCycleReminder(item)) {
    return 'none'
  }

  if (item.type !== 'bill') {
    return 'ask'
  }

  const behavior = String(item.nextReminderMode || 'auto').toLowerCase()
  return ['auto', 'ask', 'none'].includes(behavior) ? behavior : 'auto'
}

export function buildNextCycleItemDraft(item) {
  if (!canCreateNextCycleReminder(item)) {
    return null
  }

  const nextDate = getNextCycleDate(getNextCycleBaseDate(item), getNextCycleFrequency(item))
  const baseNotes = item.notes ? `${item.notes}\nCreated from previous cycle.` : 'Created from previous cycle.'
  const common = {
    ...item,
    createdAt: undefined,
    id: undefined,
    linkedExpenseId: undefined,
    linkedItemId: undefined,
    linkedItemType: undefined,
    paidDate: '',
    completedAt: '',
    updatedAt: undefined,
  }

  if (item.type === 'bill') {
    return {
      ...common,
      dueDate: nextDate,
      notes: baseNotes,
      status: 'unpaid',
    }
  }

  if (item.type === 'vendor') {
    const amountDue = Number(item.usualAmount || item.monthlyAmount || item.amountDue || item.amount || 0)

    return {
      ...common,
      adjustmentAmount: 0,
      advanceAdjusted: 0,
      amount: amountDue,
      amountDue,
      amountPaid: 0,
      balancePayable: 0,
      dueDate: nextDate,
      notes: baseNotes,
      paymentDate: nextDate,
      status: 'unpaid',
    }
  }

  if (item.type === 'subscription') {
    return {
      ...common,
      dueDate: nextDate,
      notes: baseNotes,
      renewalDate: nextDate,
      status: item.status === 'unpaid' ? 'unpaid' : 'pending',
    }
  }

  if (item.type === 'insurance') {
    return {
      ...common,
      dueDate: nextDate,
      notes: baseNotes,
      status: 'unpaid',
    }
  }

  if (item.type === 'investment') {
    return {
      ...common,
      dueDate: nextDate,
      notes: baseNotes,
      status: 'unpaid',
    }
  }

  if (item.type === 'reminder') {
    return {
      ...common,
      dueDate: nextDate,
      notes: item.notes || '',
      status: 'pending',
    }
  }

  if (item.type === 'document') {
    const reminder = getDocumentNextCycleReminder(item)
    const nextDocumentDates = {
      nextServiceDate: '',
      expiryDate: '',
      warrantyTill: '',
      [reminder.field || 'nextServiceDate']: nextDate,
    }

    return {
      ...common,
      date: '',
      documentDate: '',
      dueDate: nextDate,
      ...nextDocumentDates,
      notes: item.notes
        ? `${item.notes}\nNext reminder created from previous record.`
        : 'Next reminder created from previous record.',
      paidDate: '',
      serviceDate: '',
      status: 'pending',
    }
  }

  return null
}

export function hasDuplicateNextCycleItem(items, nextItem) {
  if (!nextItem) {
    return false
  }

  return items.some(
    (item) =>
      item.id !== nextItem.id &&
      item.type === nextItem.type &&
      getNextCycleIdentity(item) === getNextCycleIdentity(nextItem) &&
      getNextCycleTargetDate(item) === getNextCycleTargetDate(nextItem),
  )
}

export function getNextCyclePromptMessage(item) {
  const messages = {
    bill: `Create the next ${item.category || item.title || 'bill'} reminder?`,
    document: 'Create the next service reminder?',
    insurance: 'Create the next premium reminder?',
    investment: 'Create next investment reminder?',
    reminder: 'Create next reminder?',
    subscription: 'Create the next renewal reminder?',
    vendor: `Create the next ${item.vendorName || item.title || 'vendor'} payment reminder?`,
  }

  return messages[item.type] || 'Create the next reminder?'
}

export function canSnoozeItem(item) {
  return ['bill', 'vendor', 'subscription', 'insurance', 'investment', 'complaint', 'document'].includes(
    item?.type,
  )
}

export function getSnoozeUpdates(item, days) {
  if (!canSnoozeItem(item)) {
    return null
  }

  const nextDate = toDateInput(addDays(startOfToday(), days))

  if (['bill', 'insurance', 'investment'].includes(item.type)) {
    return { dueDate: nextDate }
  }

  if (item.type === 'subscription') {
    return { dueDate: nextDate, renewalDate: nextDate }
  }

  if (item.type === 'vendor') {
    return { dueDate: nextDate, paymentDate: nextDate }
  }

  if (item.type === 'complaint') {
    return { followUpDate: nextDate }
  }

  if (item.type === 'document') {
    const relevantDate = getRelevantDate(item)

    if (item.expiryDate === relevantDate) {
      return { dueDate: nextDate, expiryDate: nextDate }
    }

    if (item.warrantyTill === relevantDate) {
      return { dueDate: nextDate, warrantyTill: nextDate }
    }

    return { dueDate: nextDate, nextServiceDate: nextDate }
  }

  return null
}

export function getDuplicateWarningItems(draftItem, items) {
  if (!draftItem) {
    return []
  }

  const draftIdentity = getSimilarityIdentity(draftItem)
  const draftDate = getSimilarityDate(draftItem)
  const draftMonth = draftDate.slice(0, 7)

  if (!draftIdentity) {
    return []
  }

  return items
    .filter((item) => {
      if (item.id && item.id === draftItem.id) {
        return false
      }

      if (item.type !== draftItem.type) {
        return false
      }

      if (getSimilarityIdentity(item) !== draftIdentity) {
        return false
      }

      const itemDate = getSimilarityDate(item)
      return itemDate === draftDate || (draftMonth && itemDate.slice(0, 7) === draftMonth)
    })
    .slice(0, 3)
}

export function getBillCycleHistory(items, bill) {
  if (bill?.type !== 'bill') {
    return []
  }

  const identity = getSimilarityIdentity(bill)

  if (!identity) {
    return []
  }

  return items
    .filter((item) => item.type === 'bill' && getSimilarityIdentity(item) === identity)
    .sort((a, b) => {
      const aDate = toDate(getSimilarityDate(a))?.getTime() ?? 0
      const bDate = toDate(getSimilarityDate(b))?.getTime() ?? 0
      return bDate - aDate
    })
    .slice(0, 6)
}

function normalizeCycleValue(value) {
  return String(value || '')
    .toLowerCase()
    .replaceAll(' ', '_')
    .replaceAll('-', '_')
}

function getSimilarityIdentity(item) {
  if (
    (['bill', 'subscription', 'expense', 'income', 'investment', 'reminder'].includes(item.type) && !item.title) ||
    (item.type === 'vendor' && !item.vendorName && !item.title) ||
    (item.type === 'insurance' && !item.policyNumber && !item.title) ||
    (item.type === 'document' && !item.referenceNumber && !item.relatedTo && !item.title) ||
    (item.type === 'complaint' && !item.complaintId && !item.title)
  ) {
    return ''
  }

  const identityByType = {
    bill: [item.title, item.category],
    complaint: [item.complaintId || item.title, item.companyOrDepartment],
    document: [item.referenceNumber || item.relatedTo || item.title, item.recordType || item.documentType],
    expense: [item.title, item.category],
    income: [item.title, item.sourceName || item.category],
    insurance: [item.policyNumber || item.title, item.insurerName],
    investment: [item.title, item.investmentType],
    reminder: [item.title, item.category, item.relatedPerson],
    subscription: [item.title, item.category],
    vendor: [item.vendorName || item.title, item.serviceType],
  }

  return (identityByType[item.type] ?? [item.title, item.category])
    .filter(Boolean)
    .join('|')
    .trim()
    .toLowerCase()
}

function getSimilarityDate(item) {
  if (['bill', 'insurance', 'investment', 'reminder'].includes(item.type)) {
    return item.dueDate || item.paidDate || item.createdAt || ''
  }

  if (item.type === 'vendor') {
    return item.paymentDate || item.dueDate || item.paidDate || item.createdAt || ''
  }

  if (item.type === 'subscription') {
    return item.renewalDate || item.dueDate || item.paidDate || item.createdAt || ''
  }

  if (item.type === 'complaint') {
    return item.dateRaised || item.followUpDate || item.createdAt || ''
  }

  if (item.type === 'document') {
    return item.serviceDate || item.documentDate || item.nextServiceDate || item.createdAt || ''
  }

  return item.date || item.createdAt || ''
}

function isRecurringDocumentRecord(item) {
  const recordType = String(item.recordType || item.documentType || '').toLowerCase()
  const recurringType = ['service', 'maintenance', 'repair', 'amc', 'warranty', 'tax'].some(
    (keyword) => recordType.includes(keyword),
  )

  return recurringType && Boolean(getDocumentNextCycleReminder(item).frequency)
}

function getDocumentNextCycleReminder(item) {
  const candidates = [
    {
      date: item.nextServiceDate || item.serviceDate || item.documentDate,
      field: 'nextServiceDate',
      frequency: normalizeCycleValue(item.nextServiceInterval) !== 'none'
        ? normalizeCycleValue(item.nextServiceInterval)
        : normalizeCycleValue(item.serviceInterval),
    },
    {
      date: item.expiryDate || item.documentDate,
      field: 'expiryDate',
      frequency: normalizeCycleValue(item.expiryInterval),
    },
    {
      date: item.warrantyTill || item.documentDate,
      field: 'warrantyTill',
      frequency: normalizeCycleValue(item.warrantyInterval),
    },
  ]

  return (
    candidates.find(
      (candidate) =>
        candidate.frequency &&
        !['one_time', 'as_needed', 'none', 'custom'].includes(candidate.frequency),
    ) ?? { date: '', field: '', frequency: '' }
  )
}

function getNextCycleIdentity(item) {
  return String(
    item.vendorName ||
      item.policyNumber ||
      item.subscriptionName ||
      item.relatedTo ||
      item.title ||
      '',
  )
    .trim()
    .toLowerCase()
}

function getNextCycleTargetDate(item) {
  if (item.type === 'vendor') {
    return item.paymentDate || item.dueDate || ''
  }

  if (item.type === 'subscription') {
    return item.renewalDate || item.dueDate || ''
  }

  if (item.type === 'document') {
    return item.nextServiceDate || item.expiryDate || item.warrantyTill || item.dueDate || ''
  }

  return item.dueDate || ''
}

export function calculateVendorSettlement(item) {
  const amountDue = Number(item.amountDue || item.usualAmount || item.monthlyAmount || item.amount || 0)
  const adjustmentAmount = Number(item.adjustmentAmount || 0)
  const advanceAdjusted = Number(item.advanceAdjusted || 0)
  const amountPaid = Number(item.amountPaid || 0)
  const netDue = Math.max(amountDue - adjustmentAmount - advanceAdjusted, 0)
  const balancePayable = Math.max(netDue - amountPaid, 0)

  return {
    amountPaid,
    balancePayable,
    netDue,
  }
}

export function getVendorTitle(item) {
  const vendorName = item.vendorName || item.title || 'Vendor'
  const serviceType = item.serviceType || item.category || 'Local Vendors'
  return `${vendorName} - ${serviceType}`
}

function getDocumentExpenseCategory(item) {
  if (['Service / Maintenance', 'Repair', 'AMC'].includes(item.recordType)) {
    return 'Household'
  }

  if (item.recordType === 'Tax Receipt') {
    return 'House Tax'
  }

  if (item.recordType === 'Insurance Document') {
    return 'Insurance'
  }

  return item.category || 'Miscellaneous'
}

export function getVendorPaymentAmount(item) {
  return Number(
    item?.amountPaid ||
      item?.amountDue ||
      item?.usualAmount ||
      item?.amount ||
      item?.monthlyAmount ||
      0,
  )
}

export function createUpiPaymentLink(item) {
  const upiId = String(item?.upiId || '').trim()

  if (!upiId) {
    return ''
  }

  const amount = getVendorPaymentAmount(item)
  const params = new URLSearchParams({
    pa: upiId,
    pn: item?.vendorName || item?.title || 'Vendor',
    cu: 'INR',
  })

  if (amount > 0) {
    params.set('am', String(amount))
  }

  return `upi://pay?${params.toString()}`
}

export function createTelLink(contactNumber) {
  const trimmedNumber = String(contactNumber || '').trim()

  if (!trimmedNumber) {
    return ''
  }

  const startsWithPlus = trimmedNumber.startsWith('+')
  const digitsAndPlus = trimmedNumber.replace(/[^\d+]/g, '')
  const number = startsWithPlus
    ? `+${digitsAndPlus.replace(/\+/g, '')}`
    : digitsAndPlus.replace(/\+/g, '')

  return number ? `tel:${number}` : ''
}

export function getDateInputValue(date = new Date()) {
  return toDateInput(date)
}

export function getActionPriority(item) {
  if (!isActionableItem(item)) {
    return 99
  }

  const relevantDate = getRelevantDate(item)
  const diff = dayDifferenceFromToday(relevantDate)

  if (diff === null) {
    return 99
  }

  if (diff < 0) {
    return 1
  }

  if (diff === 0) {
    return 2
  }

  if (item.type === 'complaint' && diff <= 1) {
    return 3
  }

  if (diff <= 3) {
    return 4
  }

  if (diff <= 7) {
    return 5
  }

  return 99
}

export function getCalendarItems(items) {
  const calendarTypes = new Set([
    'subscription',
    'bill',
    'vendor',
    'insurance',
    'investment',
    'reminder',
    'complaint',
    'document',
  ])

  return sortItemsByRelevantDate(
    items.filter((item) => calendarTypes.has(item.type) && isActionableItem(item)),
  )
}

export function getPriorityItems(items, limit = 5) {
  return getCalendarItems(items)
    .map((item) => ({ item, priority: getActionPriority(item) }))
    .filter(({ priority }) => priority < 99)
    .sort((a, b) => {
      if (a.priority !== b.priority) {
        return a.priority - b.priority
      }

      return compareItemsByRelevantDateAndPriority(a.item, b.item)
    })
    .slice(0, limit)
    .map(({ item }) => item)
}

export function getTodayActionSummary(items) {
  const todayItems = getCalendarItems(items).filter(
    (item) => dayDifferenceFromToday(getRelevantDate(item)) === 0,
  )
  const followUpsDue = todayItems.filter((item) => item.type === 'complaint')
  const amountDue = todayItems.reduce(
    (total, item) => total + Number(item.amount || 0),
    0,
  )

  return {
    amountDue,
    dueCount: todayItems.length,
    followUpCount: followUpsDue.length,
    items: todayItems,
  }
}

export function getThisWeekSummary(items) {
  const dueThisWeek = getCalendarItems(items).filter((item) => {
    const diff = dayDifferenceFromToday(getRelevantDate(item))
    return diff !== null && diff >= 0 && diff <= 7
  })

  return {
    dueThisWeek: dueThisWeek.length,
    openComplaints: getOpenComplaints(items).length,
    overdue: getOverdueItems(items).length,
    upcomingRenewals: getUpcomingRenewals(items).length,
  }
}

export function getItemsForMonth(items, monthKey, dateResolver = getRelevantDate) {
  return items.filter((item) => monthKeyFromDateValue(dateResolver(item)) === monthKey)
}

export function sortItemsByRelevantDate(items) {
  return [...items].sort(compareItemsByRelevantDateAndPriority)
}

function compareItemsByRelevantDateAndPriority(a, b) {
  const aDate = toDate(getRelevantDate(a))?.getTime() ?? Number.MAX_SAFE_INTEGER
  const bDate = toDate(getRelevantDate(b))?.getTime() ?? Number.MAX_SAFE_INTEGER

  if (aDate !== bDate) {
    return aDate - bDate
  }

  return getReminderPriorityRank(a) - getReminderPriorityRank(b)
}

function getReminderPriorityRank(item) {
  if (item.type !== 'reminder') {
    return 1
  }

  return {
    high: 0,
    low: 2,
    normal: 1,
  }[item.priority] ?? 1
}

export function getItemsDueSoon(items, days = 7) {
  const today = startOfToday()
  const endDate = addDays(today, days)

  return sortItemsByRelevantDate(
    items.filter((item) => {
      const itemDate = toDate(getRelevantDate(item))
      return itemDate && isActive(item) && itemDate >= today && itemDate <= endDate
    }),
  )
}

export function getOverdueItems(items) {
  const today = startOfToday()

  return sortItemsByRelevantDate(
    items.filter((item) => {
      const itemDate = toDate(getRelevantDate(item))
      return itemDate && isActive(item) && itemDate < today
    }),
  )
}

export function getOpenComplaints(items) {
  return sortItemsByRelevantDate(
    items.filter(
      (item) =>
        item.type === 'complaint' &&
        ['open', 'follow-up', 'followed_up', 'overdue'].includes(
          item.status,
        ),
    ),
  )
}

export function getUpcomingRenewals(items, days = 30) {
  const today = startOfToday()
  const endDate = addDays(today, days)

  return sortItemsByRelevantDate(
    items.filter((item) => {
      const isRenewal =
        item.type === 'subscription' ||
        item.type === 'insurance' ||
        (item.type === 'document' &&
          Boolean(item.nextServiceDate || item.expiryDate || item.warrantyTill))
      const itemDate = toDate(getRelevantDate(item))
      return isRenewal && itemDate && isActive(item) && itemDate >= today && itemDate <= endDate
    }),
  )
}

export function getMonthlyExpenseItems(items, monthKey) {
  return getPaidExpenseItemsForMonth(items, monthKey)
}

export function getExpenseItemsForMonth(items, monthKey) {
  return getPaidExpenseItemsForMonth(items, monthKey)
}

export function isPaidExpense(item) {
  return (
    item.type === 'expense' &&
    Number(item.amount) > 0 &&
    item.status === 'paid'
  )
}

export function getPaidExpenseItemsForMonth(items, monthKey) {
  return getItemsForMonth(
    items.filter(isPaidExpense),
    monthKey,
    (item) => item.date,
  ).sort((a, b) => {
    const aDate = toDate(a.date)?.getTime() ?? 0
    const bDate = toDate(b.date)?.getTime() ?? 0
    return bDate - aDate
  })
}

export function getUnpaidExpenseItemsForMonth(items, monthKey) {
  return getItemsForMonth(
    items.filter(
      (item) =>
        item.type === 'expense' &&
        item.status === 'unpaid' &&
        Number(item.amount) > 0,
    ),
    monthKey,
    (item) => item.date,
  ).sort((a, b) => {
    const aDate = toDate(a.date)?.getTime() ?? 0
    const bDate = toDate(b.date)?.getTime() ?? 0
    return bDate - aDate
  })
}

export function getMonthlyExpenseTotal(items, monthKey) {
  return getMonthlyExpenseItems(items, monthKey).reduce(
    (total, item) => total + Number(item.amount || 0),
    0,
  )
}

export function isIncomeItem(item) {
  return item.type === 'income' && Number(item.amount) > 0
}

export function isReceivedIncome(item) {
  return isIncomeItem(item) && item.status === 'received'
}

export function isExpectedIncome(item) {
  return isIncomeItem(item) && item.status === 'expected'
}

export function getIncomeItemsForMonth(items, monthKey) {
  return getItemsForMonth(
    items.filter(isIncomeItem),
    monthKey,
    getIncomeEffectiveDate,
  ).sort((a, b) => {
    const aDate = toDate(getIncomeEffectiveDate(a))?.getTime() ?? 0
    const bDate = toDate(getIncomeEffectiveDate(b))?.getTime() ?? 0
    return bDate - aDate
  })
}

function getIncomeEffectiveDate(item) {
  return item.status === 'received'
    ? item.receivedDate || item.date
    : item.date
}

export function getReceivedIncomeItemsForMonth(items, monthKey) {
  return getIncomeItemsForMonth(items, monthKey).filter(isReceivedIncome)
}

export function getExpectedIncomeItemsForMonth(items, monthKey) {
  return getIncomeItemsForMonth(items, monthKey).filter(isExpectedIncome)
}

export function getIncomeTotalForMonth(items, monthKey) {
  return getReceivedIncomeItemsForMonth(items, monthKey).reduce(
    (total, item) => total + Number(item.amount || 0),
    0,
  )
}

export function getExpectedIncomeTotalForMonth(items, monthKey) {
  return getExpectedIncomeItemsForMonth(items, monthKey).reduce(
    (total, item) => total + Number(item.amount || 0),
    0,
  )
}

export function getIncomeBreakdown(items, monthKey) {
  const monthlyTotal = getIncomeTotalForMonth(items, monthKey)
  const totals = getReceivedIncomeItemsForMonth(items, monthKey).reduce(
    (summary, item) => {
      const category = item.category || 'Other'
      summary[category] = (summary[category] || 0) + Number(item.amount || 0)
      return summary
    },
    {},
  )

  return Object.entries(totals)
    .map(([category, total]) => ({
      category,
      percentage: monthlyTotal ? Math.round((total / monthlyTotal) * 100) : 0,
      total,
    }))
    .sort((a, b) => b.total - a.total)
}

export function getMonthlyBalance(items, monthKey) {
  return getIncomeTotalForMonth(items, monthKey) - getMonthlyExpenseTotal(items, monthKey)
}

export function getSavingsRate(items, monthKey) {
  const income = getIncomeTotalForMonth(items, monthKey)

  if (!income) {
    return null
  }

  return Math.round((getMonthlyBalance(items, monthKey) / income) * 100)
}

export function getRecurringMonthlyCost(items, monthKey) {
  return getExpenseItemsForMonth(items, monthKey)
    .filter((item) => item.recurring)
    .reduce((total, item) => total + Number(item.amount || 0), 0)
}

export function getOneTimeMonthlyExpenseTotal(items, monthKey) {
  return getMonthlyExpenseItems(items, monthKey)
    .filter((item) => item.type === 'expense' && !item.recurring)
    .reduce((total, item) => total + Number(item.amount || 0), 0)
}

export function getCategoryBreakdown(items, monthKey) {
  const monthlyTotal = getMonthlyExpenseTotal(items, monthKey)
  const totals = getMonthlyExpenseItems(items, monthKey).reduce((summary, item) => {
    const category = item.category || 'Miscellaneous'
    summary[category] = (summary[category] || 0) + Number(item.amount || 0)
    return summary
  }, {})

  return Object.entries(totals)
    .map(([category, total]) => ({
      category,
      percentage: monthlyTotal ? Math.round((total / monthlyTotal) * 100) : 0,
      total,
    }))
    .sort((a, b) => b.total - a.total)
}

export function getHighestSpendingDay(items, monthKey) {
  const totalsByDay = getExpenseItemsForMonth(items, monthKey).reduce(
    (summary, item) => {
      if (!item.date) {
        return summary
      }

      summary[item.date] = (summary[item.date] || 0) + Number(item.amount || 0)
      return summary
    },
    {},
  )

  const [date, total] =
    Object.entries(totalsByDay).sort((a, b) => b[1] - a[1])[0] ?? []

  return date ? { date, total } : null
}

export function getExpenseStatsForMonth(items, monthKey) {
  const expenseItems = getExpenseItemsForMonth(items, monthKey)
  const total = expenseItems.reduce(
    (summary, item) => summary + Number(item.amount || 0),
    0,
  )
  const largestExpense = [...expenseItems].sort(
    (a, b) => Number(b.amount || 0) - Number(a.amount || 0),
  )[0]
  const daysInMonth = new Date(
    Number(monthKey.slice(0, 4)),
    Number(monthKey.slice(5, 7)),
    0,
  ).getDate()
  const recurringTotal = expenseItems
    .filter((item) => item.recurring)
    .reduce((summary, item) => summary + Number(item.amount || 0), 0)
  const categoryBreakdown = getCategoryBreakdown(items, monthKey)

  return {
    averageDailyExpense: daysInMonth ? total / daysInMonth : 0,
    count: expenseItems.length,
    highestSpendingDay: getHighestSpendingDay(items, monthKey),
    largestExpense,
    recurringTotal,
    recurringShare: total ? Math.round((recurringTotal / total) * 100) : 0,
    topCategory: categoryBreakdown[0] ?? null,
    total,
  }
}

export function getRecurringObligationsForMonth(items, monthKey) {
  const obligationTypes = new Set(['subscription', 'bill', 'vendor', 'insurance', 'investment'])
  const itemsForMonth = sortItemsByRelevantDate(
    getItemsForMonth(
      items.filter(
        (item) => obligationTypes.has(item.type) && !isCompletedItem(item),
      ),
      monthKey,
      getRelevantDate,
    ),
  )
  const groupedItems = {
    subscription: itemsForMonth.filter((item) => item.type === 'subscription'),
    bill: itemsForMonth.filter((item) => item.type === 'bill'),
    vendor: itemsForMonth.filter((item) => item.type === 'vendor'),
    insurance: itemsForMonth.filter((item) => item.type === 'insurance'),
    investment: itemsForMonth.filter((item) => item.type === 'investment'),
  }

  return {
    count: itemsForMonth.length,
    groupedItems,
    items: itemsForMonth,
    total: itemsForMonth.reduce(
      (summary, item) => summary + Number(item.amount || 0),
      0,
    ),
  }
}

export function groupAgendaItems(items) {
  const today = startOfToday()
  const tomorrow = addDays(today, 1)
  const weekEnd = addDays(today, 7)
  const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0)
  const groups = {
    Overdue: [],
    Today: [],
    Tomorrow: [],
    'This Week': [],
    'Later This Month': [],
    Later: [],
  }

  getCalendarItems(items)
    .forEach((item) => {
      const itemDate = toDate(getRelevantDate(item))

      if (itemDate < today) {
        groups.Overdue.push(item)
      } else if (itemDate.getTime() === today.getTime()) {
        groups.Today.push(item)
      } else if (itemDate.getTime() === tomorrow.getTime()) {
        groups.Tomorrow.push(item)
      } else if (itemDate <= weekEnd) {
        groups['This Week'].push(item)
      } else if (itemDate <= monthEnd) {
        groups['Later This Month'].push(item)
      } else {
        groups.Later.push(item)
      }
    })

  return Object.entries(groups).map(([label, groupItems]) => ({
    label,
    items: groupItems,
  }))
}
