export const itemTypeEmojis = {
  bill: '\u{1F9FE}',
  complaint: '\u{1F6E0}\uFE0F',
  document: '\u{1F9F0}',
  expense: '\u{1F4B8}',
  income: '\u{1F4B0}',
  investment: '\u{1F4C8}',
  insurance: '\u{1F6E1}\uFE0F',
  reminder: '\u23F0',
  subscription: '\u{1F501}',
  vendor: '\u{1F464}',
}

export const fallbackItemEmoji = '\u2795'

export const itemTypes = [
  {
    id: 'expense',
    label: 'Expense',
    emoji: itemTypeEmojis.expense,
    description: 'Money already spent, such as groceries, fuel, eating out or shopping',
  },
  {
    id: 'bill',
    label: 'Bill',
    emoji: itemTypeEmojis.bill,
    description: 'Payments with a due date, such as electricity, EMI, tax or broadband',
  },
  {
    id: 'vendor',
    label: 'Vendor Payment',
    emoji: itemTypeEmojis.vendor,
    description: 'Maid, milkman, ironing, cook or local service',
  },
  {
    id: 'subscription',
    label: 'Subscription',
    emoji: itemTypeEmojis.subscription,
    description: 'Fixed renewals like OTT, cloud or apps',
  },
  {
    id: 'income',
    label: 'Income',
    emoji: itemTypeEmojis.income,
    description: 'Salary or other money received',
  },
  {
    id: 'investment',
    label: 'Investment',
    emoji: itemTypeEmojis.investment,
    description: 'SIP, PPF, NPS, fixed deposits and other money set aside for the future',
  },
  {
    id: 'insurance',
    label: 'Insurance',
    emoji: itemTypeEmojis.insurance,
    description: 'Premium due or paid',
  },
  {
    id: 'reminder',
    label: 'Reminder',
    emoji: itemTypeEmojis.reminder,
    description: 'Tasks, deadlines, filings, follow-ups or personal commitments',
  },
  {
    id: 'complaint',
    label: 'Complaint',
    emoji: itemTypeEmojis.complaint,
    description: 'Service request or follow-up',
  },
  {
    id: 'document',
    label: 'Record / Maintenance',
    emoji: itemTypeEmojis.document,
    description: 'Receipts, warranties, repairs, servicing or expiry reminders',
  },
]

export const getItemTypeMeta = (type) =>
  itemTypes.find((itemType) => itemType.id === type) ?? {
    id: type,
    label: type,
    emoji: fallbackItemEmoji,
  }
