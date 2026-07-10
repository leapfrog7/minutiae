export const formatCurrency = (amount) => {
  if (amount === null || amount === undefined || amount === '') {
    return ''
  }

  return new Intl.NumberFormat('en-IN', {
    maximumFractionDigits: 0,
    style: 'currency',
    currency: 'INR',
  }).format(amount)
}

export const formatDate = (dateValue) => {
  if (!dateValue) {
    return 'No date'
  }

  return new Intl.DateTimeFormat('en-IN', {
    day: 'numeric',
    month: 'short',
  }).format(new Date(`${dateValue}T00:00:00`))
}

export const getCurrentMonthKey = () => new Date().toISOString().slice(0, 7)
