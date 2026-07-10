export const dashboardSummaries = [
  {
    title: 'Due Soon',
    value: '7',
    detail: 'Bills and renewals in the next 7 days',
    status: 'due-soon',
  },
  {
    title: 'Overdue',
    value: '2',
    detail: 'Needs attention before the weekend',
    status: 'overdue',
  },
  {
    title: 'Open Complaints',
    value: '3',
    detail: 'Service requests waiting for follow-up',
    status: 'open',
  },
  {
    title: 'Monthly Spending',
    value: 'Rs 48.2k',
    detail: 'Placeholder total for July household spends',
    status: 'paid',
  },
  {
    title: 'Upcoming Renewals',
    value: '5',
    detail: 'Policies, warranties, and subscriptions',
    status: 'follow-up',
  },
]

export const agendaGroups = [
  {
    label: 'Overdue',
    items: [
      {
        title: 'BSES electricity bill',
        meta: 'Due 08 Jul',
        type: 'Bill',
        status: 'overdue',
      },
      {
        title: 'Water purifier service',
        meta: 'Complaint follow-up pending',
        type: 'Complaint',
        status: 'follow-up',
      },
    ],
  },
  {
    label: 'Today',
    items: [
      {
        title: 'Maid salary',
        meta: 'UPI payment planned',
        type: 'Vendor',
        status: 'due-soon',
      },
    ],
  },
  {
    label: 'Tomorrow',
    items: [
      {
        title: 'Broadband renewal',
        meta: 'Auto debit expected',
        type: 'Subscription',
        status: 'due-soon',
      },
    ],
  },
  {
    label: 'This Week',
    items: [
      {
        title: 'Cook monthly payment',
        meta: 'Cash or UPI',
        type: 'Vendor',
        status: 'due-soon',
      },
      {
        title: 'Laptop warranty expiry',
        meta: 'Upload receipt later',
        type: 'Document',
        status: 'follow-up',
      },
    ],
  },
  {
    label: 'Later This Month',
    items: [
      {
        title: 'Health insurance premium',
        meta: 'Renewal reminder',
        type: 'Bill',
        status: 'due-soon',
      },
    ],
  },
]
