import {
  buildNextCycleItemDraft,
  createExpenseFromSourceItem,
  getDateInputValue,
  getSnoozeUpdates,
  hasLinkedExpense,
  hasDuplicateNextCycleItem,
  shouldOfferRecordExpense,
} from './lifeItemHelpers'

const STORAGE_KEY = 'minutiae-life-items'
const CORRUPT_STORAGE_BACKUP_KEY = 'minutiae-life-items-corrupt-backup'
const ITEMS_CHANGED_EVENT = 'minutiae:life-items-changed'

const toDateInput = (date) => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

const addDays = (days) => {
  const date = new Date()
  date.setHours(0, 0, 0, 0)
  date.setDate(date.getDate() + days)
  return toDateInput(date)
}

const createId = () => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID()
  }

  return `item-${Date.now()}-${Math.random().toString(16).slice(2)}`
}

const withTimestamps = (item, timestamp) => ({
  amount: 0,
  date: '',
  dueDate: '',
  paymentMode: '',
  notes: '',
  ...item,
  id: item.id ?? createId(),
  createdAt: item.createdAt ?? timestamp,
  updatedAt: item.updatedAt ?? timestamp,
})

const createSampleLifeItems = () => {
  const now = new Date().toISOString()

  return [
    withTimestamps(
      {
        id: 'sample-chatgpt',
        type: 'subscription',
        title: 'ChatGPT subscription',
        amount: 1999,
        dueDate: addDays(3),
        renewalDate: addDays(3),
        status: 'pending',
        paymentMode: 'Card',
        category: 'Subscription',
        billingCycle: 'monthly',
        autoRenewal: true,
        cancelBeforeDate: addDays(1),
        notes: 'Personal productivity subscription.',
      },
      now,
    ),
    withTimestamps(
      {
        id: 'sample-youtube-premium',
        type: 'subscription',
        title: 'YouTube Premium family',
        amount: 299,
        dueDate: addDays(18),
        renewalDate: addDays(18),
        status: 'pending',
        paymentMode: 'Auto Debit',
        category: 'Subscription',
        billingCycle: 'quarterly',
        autoRenewal: true,
        notes: 'Family plan renewal.',
      },
      now,
    ),
    withTimestamps(
      {
        id: 'sample-google-one',
        type: 'subscription',
        title: 'Google One storage',
        amount: 1300,
        dueDate: addDays(45),
        renewalDate: addDays(45),
        status: 'paid',
        paymentMode: 'Card',
        category: 'Subscription',
        billingCycle: 'yearly',
        autoRenewal: true,
        notes: 'Annual storage plan.',
      },
      now,
    ),
    withTimestamps(
      {
        id: 'sample-electricity',
        type: 'bill',
        title: 'Electricity bill',
        amount: 2860,
        dueDate: addDays(-2),
        status: 'overdue',
        paymentMode: 'UPI',
        category: 'Electricity',
        frequency: 'monthly',
        receiptName: '',
        notes: 'Check meter reading before paying.',
      },
      now,
    ),
    withTimestamps(
      {
        id: 'sample-igl-gas',
        type: 'bill',
        title: 'IGL gas bill',
        amount: 760,
        dueDate: addDays(5),
        status: 'unpaid',
        paymentMode: 'UPI',
        category: 'IGL / Gas',
        frequency: 'monthly',
        notes: 'Pay after salary credit.',
      },
      now,
    ),
    withTimestamps(
      {
        id: 'sample-society-maintenance',
        type: 'bill',
        title: 'Society maintenance',
        amount: 5200,
        dueDate: addDays(8),
        paidDate: addDays(-1),
        status: 'paid',
        paymentMode: 'Bank Transfer',
        category: 'Society Maintenance',
        frequency: 'monthly',
        receiptName: 'maintenance-july.pdf',
      },
      now,
    ),
    withTimestamps(
      {
        id: 'sample-health-insurance',
        type: 'insurance',
        title: 'Family health insurance',
        amount: 18500,
        premiumAmount: 18500,
        dueDate: addDays(12),
        status: 'unpaid',
        paymentMode: 'UPI',
        category: 'Insurance',
        policyType: 'Health',
        insurerName: 'HDFC Ergo',
        policyNumber: 'HEALTH-28491',
        frequency: 'yearly',
        notes: 'Renew before grace period starts.',
      },
      now,
    ),
    withTimestamps(
      {
        id: 'sample-maid-salary',
        type: 'vendor',
        title: 'Maid salary',
        amount: 4500,
        dueDate: addDays(0),
        paymentDate: addDays(0),
        status: 'unpaid',
        paymentMode: 'UPI',
        category: 'Maid',
        vendorName: 'Sunita',
        serviceType: 'House help',
        contactNumber: '9876543210',
        upiId: 'sunita@upi',
        advanceGiven: 500,
        balancePayable: 4000,
      },
      now,
    ),
    withTimestamps(
      {
        id: 'sample-ironing',
        type: 'vendor',
        title: 'Ironing person payment',
        amount: 620,
        dueDate: addDays(1),
        paymentDate: addDays(1),
        status: 'unpaid',
        paymentMode: 'Cash',
        category: 'Ironing',
        vendorName: 'Ramesh Presswala',
        serviceType: 'Ironing',
        contactNumber: '9811111111',
      },
      now,
    ),
    withTimestamps(
      {
        id: 'sample-milkman',
        type: 'vendor',
        title: 'Milkman payment',
        amount: 2100,
        dueDate: addDays(-4),
        paymentDate: addDays(-4),
        paidDate: addDays(-3),
        status: 'paid',
        paymentMode: 'UPI',
        category: 'Milkman',
        vendorName: 'Mother Dairy booth',
        serviceType: 'Daily milk',
        upiId: 'milkbooth@upi',
      },
      now,
    ),
    withTimestamps(
      {
        id: 'sample-broadband-complaint',
        type: 'complaint',
        title: 'Broadband speed issue',
        amount: 0,
        status: 'open',
        category: 'Broadband',
        complaintId: 'ACT-482917',
        companyOrDepartment: 'ACT Fibernet',
        dateRaised: addDays(-3),
        expectedResolutionDate: addDays(1),
        followUpDate: addDays(0),
        contactNumber: '18001022836',
        notes: 'Technician visit promised by evening.',
      },
      now,
    ),
    withTimestamps(
      {
        id: 'sample-amazon-return',
        type: 'complaint',
        title: 'Amazon return pickup',
        amount: 1299,
        status: 'followed_up',
        category: 'Complaint',
        complaintId: 'AMZ-RTRN-7731',
        companyOrDepartment: 'Amazon',
        dateRaised: addDays(-6),
        expectedResolutionDate: addDays(-1),
        followUpDate: addDays(-1),
        contactNumber: '180030009009',
        notes: 'Pickup missed twice.',
      },
      now,
    ),
    withTimestamps(
      {
        id: 'sample-grocery',
        type: 'expense',
        title: 'Weekend grocery run',
        amount: 3420,
        date: addDays(-2),
        status: 'paid',
        paymentMode: 'UPI',
        category: 'Grocery',
        recurring: false,
        notes: 'BigBasket and local kirana.',
      },
      now,
    ),
    withTimestamps(
      {
        id: 'sample-salary',
        type: 'income',
        title: 'Salary',
        amount: 125000,
        date: addDays(-6),
        status: 'received',
        paymentMode: 'Bank Transfer',
        category: 'Salary',
        sourceName: 'Employer',
        recurring: true,
        frequency: 'monthly',
        notes: 'Monthly salary credit.',
      },
      now,
    ),
    withTimestamps(
      {
        id: 'sample-bank-interest',
        type: 'income',
        title: 'Bank interest',
        amount: 850,
        date: addDays(-9),
        status: 'received',
        paymentMode: 'Bank Transfer',
        category: 'Interest',
        sourceName: 'Savings account',
        recurring: false,
        frequency: 'quarterly',
        notes: 'Quarterly interest credit.',
      },
      now,
    ),
    withTimestamps(
      {
        id: 'sample-fuel',
        type: 'expense',
        title: 'Fuel expense',
        amount: 2500,
        date: addDays(-5),
        status: 'paid',
        paymentMode: 'Card',
        category: 'Fuel',
        recurring: false,
        notes: 'Office commute refill.',
      },
      now,
    ),
    withTimestamps(
      {
        id: 'sample-ro-filter',
        type: 'document',
        title: 'RO filter changed',
        amount: 1850,
        status: 'completed',
        paymentMode: 'UPI',
        category: 'Household',
        recordType: 'Service / Maintenance',
        documentType: 'Service / Maintenance',
        relatedTo: 'Aquaguard RO',
        serviceDate: addDays(-20),
        nextServiceDate: addDays(160),
        serviceInterval: 'six_monthly',
        vendorName: 'RO service person',
        contactNumber: '9876501234',
        partsReplaced: 'RO filter kit',
        referenceNumber: 'RO-JOB-1024',
        attachmentNote: 'WhatsApp with RO service person',
        notes: 'Next filter change due in about six months.',
      },
      now,
    ),
    withTimestamps(
      {
        id: 'sample-bedroom-ac-service',
        type: 'document',
        title: 'Bedroom AC service',
        amount: 1200,
        status: 'completed',
        paymentMode: 'Cash',
        category: 'Household',
        recordType: 'Service / Maintenance',
        documentType: 'Service / Maintenance',
        relatedTo: 'Bedroom AC',
        serviceDate: addDays(-35),
        nextServiceDate: addDays(150),
        serviceInterval: 'six_monthly',
        vendorName: 'AC technician',
        partsReplaced: 'General service and cleaning',
        referenceNumber: 'AC-SVC-338',
        notes: 'Cooling improved after service.',
      },
      now,
    ),
    withTimestamps(
      {
        id: 'sample-house-tax',
        type: 'document',
        title: 'House tax receipt',
        amount: 9250,
        date: addDays(-10),
        dueDate: addDays(25),
        status: 'paid',
        paymentMode: 'Bank Transfer',
        category: 'House Tax',
        recordType: 'Tax Receipt',
        documentType: 'Tax Receipt',
        relatedTo: 'Municipal corporation',
        documentDate: addDays(-10),
        expiryDate: addDays(355),
        referenceNumber: 'MCD-TAX-2026',
        attachmentNote: 'Email PDF',
        notes: 'Receipt metadata saved; upload later.',
      },
      now,
    ),
  ]
}

export function getLifeItems() {
  const storedItems = localStorage.getItem(STORAGE_KEY)

  if (!storedItems) {
    return []
  }

  try {
    const parsedItems = JSON.parse(storedItems)

    if (!Array.isArray(parsedItems)) {
      preserveCorruptStorage(storedItems)
      return []
    }

    return parsedItems
  } catch {
    preserveCorruptStorage(storedItems)
    return []
  }
}

function preserveCorruptStorage(storedItems) {
  try {
    if (!localStorage.getItem(CORRUPT_STORAGE_BACKUP_KEY)) {
      localStorage.setItem(CORRUPT_STORAGE_BACKUP_KEY, storedItems)
    }
  } catch {
    // Reading remains available even when the browser refuses another write.
  }
}

export function saveLifeItems(items) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
  window.dispatchEvent(new CustomEvent(ITEMS_CHANGED_EVENT))
  return items
}

export function subscribeToLifeItems(onChange) {
  function handleLocalChange() {
    onChange(getLifeItems())
  }

  function handleStorageChange(event) {
    if (event.key === STORAGE_KEY) {
      handleLocalChange()
    }
  }

  window.addEventListener(ITEMS_CHANGED_EVENT, handleLocalChange)
  window.addEventListener('storage', handleStorageChange)

  return () => {
    window.removeEventListener(ITEMS_CHANGED_EVENT, handleLocalChange)
    window.removeEventListener('storage', handleStorageChange)
  }
}

export function addLifeItem(item) {
  const timestamp = new Date().toISOString()
  const nextItem = withTimestamps(item, timestamp)
  saveLifeItems([nextItem, ...getLifeItems()])
  return nextItem
}

export function addLifeItemWithLinkedExpense(item, { recordExpense = false } = {}) {
  const timestamp = new Date().toISOString()
  const paidDate = item.status === 'paid' ? item.paidDate || getDateInputValue() : item.paidDate
  const nextItem = withTimestamps(
    {
      ...item,
      ...(paidDate ? { paidDate } : {}),
    },
    timestamp,
  )
  const expenseDraft =
    recordExpense && shouldOfferRecordExpense(nextItem, [])
      ? createExpenseFromSourceItem(nextItem, paidDate)
      : null
  const expenseItem = expenseDraft ? withTimestamps(expenseDraft, timestamp) : null

  saveLifeItems(expenseItem ? [expenseItem, nextItem, ...getLifeItems()] : [nextItem, ...getLifeItems()])
  return {
    expenseCreated: Boolean(expenseItem),
    expenseItem,
    item: nextItem,
  }
}

export function updateLifeItem(id, updates) {
  const nextItems = getLifeItems().map((item) =>
    item.id === id
      ? { ...item, ...updates, updatedAt: new Date().toISOString() }
      : item,
  )

  saveLifeItems(nextItems)
  return nextItems.find((item) => item.id === id)
}

export function updateLifeItemWithLinkedExpense(
  id,
  updates,
  { recordExpense = false } = {},
) {
  const timestamp = new Date().toISOString()
  const paidDate =
    updates.status === 'paid' ? updates.paidDate || getDateInputValue() : updates.paidDate
  const currentItems = getLifeItems()
  let updatedItem = null
  const nextItems = currentItems.map((item) => {
    if (item.id !== id) {
      return item
    }

    updatedItem = {
      ...item,
      ...updates,
      ...(paidDate ? { paidDate } : {}),
      updatedAt: timestamp,
    }
    return updatedItem
  })
  const duplicateExpense = updatedItem ? hasLinkedExpense(currentItems, updatedItem) : false
  const reconciliation = reconcileLinkedExpense(
    nextItems,
    updatedItem,
    timestamp,
    { createIfMissing: recordExpense },
  )

  saveLifeItems(reconciliation.items)
  return {
    duplicateSkipped: recordExpense && duplicateExpense,
    expenseCreated: reconciliation.created,
    expenseItem: reconciliation.expenseItem,
    updatedItem,
  }
}

export function markLifeItemPaid(item, { recordExpense = false, updates = {} } = {}) {
  const timestamp = new Date().toISOString()
  const paidDate = getDateInputValue()
  const currentItems = getLifeItems()
  const sourceForExpense = {
    ...item,
    ...updates,
    status: 'paid',
    paidDate,
  }
  const duplicateExpense = hasLinkedExpense(currentItems, sourceForExpense)
  let updatedItem = null
  const nextItems = currentItems.map((currentItem) => {
    if (currentItem.id !== item.id) {
      return currentItem
    }

    updatedItem = {
      ...currentItem,
      ...updates,
      status: 'paid',
      paidDate,
      updatedAt: timestamp,
    }
    return updatedItem
  })

  const reconciliation = reconcileLinkedExpense(
    nextItems,
    updatedItem,
    timestamp,
    { createIfMissing: recordExpense },
  )

  saveLifeItems(reconciliation.items)

  return {
    duplicateSkipped: recordExpense && duplicateExpense,
    expenseCreated: reconciliation.created,
    expenseItem: reconciliation.expenseItem,
    updatedItem,
  }
}

function reconcileLinkedExpense(
  items,
  sourceItem,
  timestamp,
  { createIfMissing = false } = {},
) {
  if (!sourceItem) {
    return { created: false, expenseItem: null, items }
  }

  const linkedExpenses = items.filter(
    (item) => item.type === 'expense' && item.linkedItemId === sourceItem.id,
  )
  const existingExpense = linkedExpenses[0]
  const itemsWithoutExisting = existingExpense
    ? items.filter(
        (item) =>
          !(item.type === 'expense' && item.linkedItemId === sourceItem.id),
      )
    : items
  const canHaveExpense = shouldOfferRecordExpense(
    sourceItem,
    itemsWithoutExisting,
  )

  if (!canHaveExpense) {
    return {
      created: false,
      expenseItem: null,
      items: existingExpense ? itemsWithoutExisting : items,
    }
  }

  if (!existingExpense && !createIfMissing) {
    return { created: false, expenseItem: null, items }
  }

  const expenseDraft = createExpenseFromSourceItem(
    sourceItem,
    sourceItem.type === 'document'
      ? undefined
      : sourceItem.paidDate || getDateInputValue(),
  )
  const expenseItem = existingExpense
    ? {
        ...existingExpense,
        ...expenseDraft,
        id: existingExpense.id,
        createdAt: existingExpense.createdAt,
        updatedAt: timestamp,
      }
    : withTimestamps(expenseDraft, timestamp)

  return {
    created: !existingExpense,
    expenseItem,
    items: [expenseItem, ...itemsWithoutExisting],
  }
}

export function recordExpenseForLifeItem(item, dateOverride) {
  const currentItems = getLifeItems()
  const duplicateExpense = hasLinkedExpense(currentItems, item)

  if (duplicateExpense) {
    return {
      duplicateSkipped: true,
      expenseCreated: false,
      expenseItem: null,
      sourceItem: item,
    }
  }

  const timestamp = new Date().toISOString()
  const expenseDraft = createExpenseFromSourceItem(
    item,
    dateOverride || item.paidDate || getDateInputValue(),
  )
  const expenseItem = expenseDraft ? withTimestamps(expenseDraft, timestamp) : null

  if (expenseItem) {
    saveLifeItems([expenseItem, ...currentItems])
  }

  return {
    duplicateSkipped: false,
    expenseCreated: Boolean(expenseItem),
    expenseItem,
    sourceItem: item,
  }
}

export function createNextCycleItem(item) {
  const currentItems = getLifeItems()
  const draft = buildNextCycleItemDraft(item)

  if (!draft) {
    return {
      duplicateSkipped: false,
      item: null,
    }
  }

  if (hasDuplicateNextCycleItem(currentItems, draft)) {
    return {
      duplicateSkipped: true,
      item: null,
    }
  }

  const timestamp = new Date().toISOString()
  const nextItem = withTimestamps(draft, timestamp)
  saveLifeItems([nextItem, ...currentItems])

  return {
    duplicateSkipped: false,
    item: nextItem,
  }
}

export function snoozeLifeItem(item, days) {
  const updates = getSnoozeUpdates(item, days)

  if (!updates) {
    return item
  }

  return updateLifeItem(item.id, updates)
}

export function deleteLifeItem(id) {
  const nextItems = getLifeItems().filter(
    (item) => item.id !== id && item.linkedItemId !== id,
  )
  saveLifeItems(nextItems)
  return nextItems
}

export function clearLifeItems() {
  saveLifeItems([])
}

export function loadDemoLifeItems() {
  return saveLifeItems(createSampleLifeItems())
}
