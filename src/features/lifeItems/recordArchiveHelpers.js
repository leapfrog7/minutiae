import {
  formatAmount,
  formatDisplayDate,
  getDateInputValue,
  getMonthLabel,
} from './lifeItemHelpers'

const todayKey = () => getDateInputValue()

const toDate = (value) => {
  if (!value) {
    return null
  }

  const normalizedValue = String(value).slice(0, 10)
  const date = new Date(`${normalizedValue}T00:00:00`)
  return Number.isNaN(date.getTime()) ? null : date
}

const firstValidDate = (item, fields) => {
  const field = fields.find((fieldName) => toDate(item?.[fieldName]))
  return field ? String(item[field]).slice(0, 10) : ''
}

export function getRecordDate(item) {
  if (!item) {
    return todayKey()
  }

  if (item.type === 'income' && item.status === 'received') {
    return (
      firstValidDate(item, ['receivedDate', 'date', 'createdAt']) ||
      todayKey()
    ).slice(0, 10)
  }

  const fieldsByType = {
    bill: ['paidDate', 'dueDate', 'createdAt'],
    complaint: [
      'dateRaised',
      'followUpDate',
      'expectedResolutionDate',
      'createdAt',
    ],
    document: [
      'serviceDate',
      'documentDate',
      'nextServiceDate',
      'expiryDate',
      'warrantyTill',
      'createdAt',
    ],
    expense: ['date', 'paidDate', 'createdAt'],
    income: ['date', 'createdAt'],
    insurance: ['paidDate', 'dueDate', 'createdAt'],
    subscription: ['paidDate', 'renewalDate', 'dueDate', 'createdAt'],
    vendor: ['paidDate', 'paymentDate', 'dueDate', 'createdAt'],
  }

  return (
    firstValidDate(item, fieldsByType[item.type] ?? []) ||
    firstValidDate(item, ['createdAt', 'updatedAt']) ||
    todayKey()
  ).slice(0, 10)
}

export function getRecordMonthKey(item) {
  return getRecordDate(item).slice(0, 7)
}

export function getRecordDateKey(item) {
  return getRecordDate(item)
}

export function isVisibleRecord(item) {
  return !(item?.type === 'expense' && item.linkedItemId)
}

export function sortRecordMonths(months) {
  return [...months].sort((a, b) => b.monthKey.localeCompare(a.monthKey))
}

export function sortRecordDates(dates) {
  return [...dates].sort((a, b) => b.dateKey.localeCompare(a.dateKey))
}

export function groupRecordsByMonthAndDate(items) {
  const monthMap = items.reduce((months, item) => {
    const monthKey = getRecordMonthKey(item)
    const dateKey = getRecordDateKey(item)

    if (!months.has(monthKey)) {
      months.set(monthKey, {
        dates: new Map(),
        incomeTotal: 0,
        monthKey,
        recordCount: 0,
        expenseTotal: 0,
      })
    }

    const month = months.get(monthKey)
    month.recordCount += 1

    if (item.type === 'expense' && item.status === 'paid') {
      month.expenseTotal += Number(item.amount || 0)
    }

    if (item.type === 'income' && item.status === 'received') {
      month.incomeTotal += Number(item.amount || 0)
    }

    if (!month.dates.has(dateKey)) {
      month.dates.set(dateKey, {
        dateKey,
        items: [],
      })
    }

    month.dates.get(dateKey).items.push(item)
    return months
  }, new Map())

  return sortRecordMonths(
    Array.from(monthMap.values()).map((month) => ({
      ...month,
      dates: sortRecordDates(
        Array.from(month.dates.values()).map((dateGroup) => ({
          ...dateGroup,
          items: sortRecordsWithinDate(dateGroup.items),
          label: formatDisplayDate(dateGroup.dateKey),
        })),
      ),
      label: getMonthLabel(month.monthKey),
      summary: getMonthSummaryText(month),
    })),
  )
}

export function sortRecordsWithinDate(items) {
  return [...items].sort((a, b) => {
    const aTime = new Date(a.updatedAt || a.createdAt || 0).getTime() || 0
    const bTime = new Date(b.updatedAt || b.createdAt || 0).getTime() || 0
    return bTime - aTime
  })
}

function getMonthSummaryText(month) {
  const parts = [`${month.recordCount} ${month.recordCount === 1 ? 'record' : 'records'}`]

  if (month.expenseTotal > 0) {
    parts.push(`${formatAmount(month.expenseTotal)} out`)
  }

  if (month.incomeTotal > 0) {
    parts.push(`${formatAmount(month.incomeTotal)} in`)
  }

  return parts.join(' - ')
}
