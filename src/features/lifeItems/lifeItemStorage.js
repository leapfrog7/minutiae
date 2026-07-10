const STORAGE_KEY = 'minutiae-life-items'

const toDateInput = (date) => date.toISOString().slice(0, 10)

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
        id: 'sample-house-tax',
        type: 'document',
        title: 'House tax receipt',
        amount: 9250,
        date: addDays(-10),
        dueDate: addDays(25),
        status: 'paid',
        paymentMode: 'Bank Transfer',
        category: 'House Tax',
        documentType: 'Receipt',
        relatedTo: 'Municipal corporation',
        documentDate: addDays(-10),
        expiryDate: addDays(355),
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
    return JSON.parse(storedItems)
  } catch {
    return []
  }
}

export function saveLifeItems(items) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
  return items
}

export function addLifeItem(item) {
  const timestamp = new Date().toISOString()
  const nextItem = withTimestamps(item, timestamp)
  saveLifeItems([nextItem, ...getLifeItems()])
  return nextItem
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

export function deleteLifeItem(id) {
  const nextItems = getLifeItems().filter((item) => item.id !== id)
  saveLifeItems(nextItems)
  return nextItems
}

export function clearLifeItems() {
  saveLifeItems([])
}

export function loadDemoLifeItems() {
  return saveLifeItems(createSampleLifeItems())
}
