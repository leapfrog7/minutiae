const STORAGE_KEY = 'expense-tracker-transactions'

function createId() {
  if (window.crypto?.randomUUID) {
    return window.crypto.randomUUID()
  }

  return `transaction-${Date.now()}`
}

function normalizeTransaction(transaction) {
  const now = new Date().toISOString()

  return {
    id: transaction.id ?? createId(),
    type: transaction.type ?? 'expense',
    amount: Number(transaction.amount) || 0,
    category: transaction.category ?? 'Other Expense',
    date: transaction.date ?? now.slice(0, 10),
    paymentMode: transaction.paymentMode ?? '',
    note: transaction.note?.trim() ?? transaction.title ?? '',
    createdAt: transaction.createdAt ?? now,
    updatedAt: transaction.updatedAt ?? now,
  }
}

export function getTransactions() {
  const storedValue = window.localStorage.getItem(STORAGE_KEY)

  if (!storedValue) {
    return []
  }

  try {
    const parsedValue = JSON.parse(storedValue)
    if (!Array.isArray(parsedValue)) {
      return []
    }

    const transactions = parsedValue.map(normalizeTransaction)
    saveTransactions(transactions)
    return transactions
  } catch {
    return []
  }
}

export function saveTransactions(transactions) {
  const normalizedTransactions = transactions.map(normalizeTransaction)
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(normalizedTransactions))
  return normalizedTransactions
}

export function addTransaction(transaction) {
  const transactions = getTransactions()
  const newTransaction = normalizeTransaction(transaction)
  saveTransactions([newTransaction, ...transactions])
  return newTransaction
}

export function updateTransaction(id, updates) {
  const updatedTransactions = getTransactions().map((transaction) => {
    if (transaction.id !== id) {
      return transaction
    }

    return normalizeTransaction({
      ...transaction,
      ...updates,
      id,
      createdAt: transaction.createdAt,
      updatedAt: new Date().toISOString(),
    })
  })

  saveTransactions(updatedTransactions)
  return updatedTransactions.find((transaction) => transaction.id === id)
}

export function deleteTransaction(id) {
  const updatedTransactions = getTransactions().filter(
    (transaction) => transaction.id !== id,
  )
  saveTransactions(updatedTransactions)
  return updatedTransactions
}

export function clearTransactions() {
  window.localStorage.removeItem(STORAGE_KEY)
  return []
}
