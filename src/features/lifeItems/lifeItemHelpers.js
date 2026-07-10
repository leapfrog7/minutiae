import { getItemTypeMeta } from '../../data/itemTypes'

const inactiveStatuses = new Set(['paid', 'archived', 'resolved', 'closed'])

const toDate = (value) => {
  if (!value) {
    return null
  }

  const date = new Date(`${value}T00:00:00`)
  return Number.isNaN(date.getTime()) ? null : date
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

const monthFromDate = (date) => date.toISOString().slice(0, 7)

export function isCompletedItem(item) {
  return inactiveStatuses.has(item.status)
}

const isActive = (item) => !isCompletedItem(item)

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

export function getItemEmoji(itemOrType) {
  const type = typeof itemOrType === 'string' ? itemOrType : itemOrType?.type
  return getItemTypeMeta(type).emoji
}

export function getItemTypeLabel(type) {
  return getItemTypeMeta(type).label
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
  if (item.type === 'subscription') {
    return item.renewalDate || item.dueDate || item.date
  }

  if (item.type === 'bill') {
    return item.dueDate || item.date
  }

  if (item.type === 'vendor') {
    return item.paymentDate || item.dueDate || item.date
  }

  if (item.type === 'complaint') {
    return item.followUpDate || item.expectedResolutionDate || item.dateRaised
  }

  if (item.type === 'expense') {
    return item.date
  }

  if (item.type === 'document') {
    return item.expiryDate || item.documentDate || item.dueDate
  }

  return item.dueDate || item.date
}

export function sortItemsByRelevantDate(items) {
  return [...items].sort((a, b) => {
    const aDate = toDate(getRelevantDate(a))?.getTime() ?? Number.MAX_SAFE_INTEGER
    const bDate = toDate(getRelevantDate(b))?.getTime() ?? Number.MAX_SAFE_INTEGER
    return aDate - bDate
  })
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
        ['open', 'follow-up', 'followed_up', 'overdue', 'due-soon'].includes(
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
      const isRenewal = item.type === 'subscription' || item.type === 'document'
      const itemDate = toDate(getRelevantDate(item))
      return isRenewal && itemDate && isActive(item) && itemDate >= today && itemDate <= endDate
    }),
  )
}

export function getMonthlyExpenseItems(items, monthKey) {
  return sortItemsByRelevantDate(
    items.filter((item) => {
      const itemDate = toDate(getRelevantDate(item))
      return (
        itemDate &&
        monthFromDate(itemDate) === monthKey &&
        item.type === 'expense' &&
        Number(item.amount) > 0
      )
    }),
  )
}

export function getMonthlyExpenseTotal(items, monthKey) {
  return getMonthlyExpenseItems(items, monthKey).reduce(
    (total, item) => total + Number(item.amount || 0),
    0,
  )
}

export function getRecurringMonthlyCost(items, monthKey) {
  return sortItemsByRelevantDate(items)
    .filter((item) => {
      const itemDate = toDate(getRelevantDate(item))
      const isRecurring =
        item.type === 'subscription' ||
        item.recurring ||
        item.frequency?.toLowerCase() === 'monthly' ||
        item.billingCycle?.toLowerCase() === 'monthly'

      return (
        itemDate &&
        monthFromDate(itemDate) === monthKey &&
        isRecurring &&
        Number(item.amount) > 0
      )
    })
    .reduce((total, item) => total + Number(item.amount || 0), 0)
}

export function getOneTimeMonthlyExpenseTotal(items, monthKey) {
  return getMonthlyExpenseItems(items, monthKey)
    .filter((item) => item.type === 'expense' && !item.recurring)
    .reduce((total, item) => total + Number(item.amount || 0), 0)
}

export function getCategoryBreakdown(items, monthKey) {
  const totals = getMonthlyExpenseItems(items, monthKey).reduce((summary, item) => {
    const category = item.category || 'Miscellaneous'
    summary[category] = (summary[category] || 0) + Number(item.amount || 0)
    return summary
  }, {})

  return Object.entries(totals)
    .map(([category, total]) => ({ category, total }))
    .sort((a, b) => b.total - a.total)
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

  sortItemsByRelevantDate(items)
    .filter((item) => isActive(item) && getRelevantDate(item))
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
