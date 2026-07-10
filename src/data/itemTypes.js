export const itemTypes = [
  {
    id: 'subscription',
    label: 'Subscription',
    emoji: '🔁',
    description: 'OTT, cloud, apps, memberships, and auto-renewals.',
  },
  {
    id: 'bill',
    label: 'Bill',
    emoji: '🧾',
    description: 'Electricity, gas, water, mobile, broadband, and taxes.',
  },
  {
    id: 'vendor',
    label: 'Vendor Payment',
    emoji: '🤝',
    description: 'Household helpers, society vendors, tutors, and local services.',
  },
  {
    id: 'insurance',
    label: 'Insurance',
    emoji: '🛡️',
    description: 'Premiums, policies, renewal dates, and insurer details.',
  },
  {
    id: 'complaint',
    label: 'Complaint / Service Request',
    emoji: '🛠️',
    description: 'Track complaint IDs, service visits, and follow-ups.',
  },
  {
    id: 'expense',
    label: 'Expense',
    emoji: '💸',
    description: 'Small spends and one-time household purchases.',
  },
  {
    id: 'income',
    label: 'Income',
    emoji: '💰',
    description: 'Salary, refunds, rent, interest, and other money in.',
  },
  {
    id: 'document',
    label: 'Document / Receipt',
    emoji: '📄',
    description: 'Receipts, warranties, policies, IDs, and renewals.',
  },
]

export const getItemTypeMeta = (type) =>
  itemTypes.find((itemType) => itemType.id === type) ?? {
    id: type,
    label: type,
    emoji: '•',
  }
