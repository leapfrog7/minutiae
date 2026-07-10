import { getItemTypeMeta } from '../../data/itemTypes'

const inactiveStatuses = new Set(['paid', 'archived', 'resolved', 'closed'])

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

const monthKeyFromDateValue = (dateValue) => {
  const date = toDate(dateValue)
  return date ? getMonthKey(date) : ''
}

export function isCompletedItem(item) {
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
    return item.expiryDate || item.documentDate || item.dueDate
  }

  return item.dueDate || item.date
}

export function getQuickStatusAction(item) {
  if (item.type === 'bill' && ['unpaid', 'overdue'].includes(item.status)) {
    return { label: 'Mark Paid', status: 'paid' }
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
    return { label: 'Mark Closed', status: 'closed' }
  }

  return null
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

      const aDate = toDate(getRelevantDate(a.item))?.getTime() ?? 0
      const bDate = toDate(getRelevantDate(b.item))?.getTime() ?? 0
      return aDate - bDate
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
        item.type === 'document' ||
        item.type === 'insurance'
      const itemDate = toDate(getRelevantDate(item))
      return isRenewal && itemDate && isActive(item) && itemDate >= today && itemDate <= endDate
    }),
  )
}

export function getMonthlyExpenseItems(items, monthKey) {
  return getExpenseItemsForMonth(items, monthKey)
}

export function getExpenseItemsForMonth(items, monthKey) {
  return getItemsForMonth(
    items.filter((item) => item.type === 'expense' && Number(item.amount) > 0),
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
  const obligationTypes = new Set(['subscription', 'bill', 'vendor', 'insurance'])
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
