const commonResetFields = [
  'id',
  'createdAt',
  'updatedAt',
  'linkedExpenseId',
  'linkedItemId',
  'linkedItemType',
  'addToMoney',
  'status',
  'paidDate',
  'receivedDate',
  'completedAt',
  'date',
  'dueDate',
  'renewalDate',
  'paymentDate',
  'paymentMonth',
  'dateRaised',
  'expectedResolutionDate',
  'followUpDate',
  'documentDate',
  'serviceDate',
  'nextServiceDate',
  'expiryDate',
  'warrantyTill',
  'cancelBeforeDate',
  'receiptName',
]

const resetFieldsByType = {
  complaint: ['complaintId'],
  document: [
    'attachmentNote',
    'partsReplaced',
    'referenceNumber',
  ],
  vendor: [
    'amount',
    'amountDue',
    'adjustmentAmount',
    'advanceAdjusted',
    'advanceGiven',
    'amountPaid',
    'balancePayable',
  ],
}

export function createSimilarItemDraft(item) {
  if (!item?.type) {
    return null
  }

  const draft = { ...item }
  const resetFields = [
    ...commonResetFields,
    ...(resetFieldsByType[item.type] ?? []),
  ]

  resetFields.forEach((field) => delete draft[field])

  if (draft.notes) {
    draft.notes = stripGeneratedCycleNotes(draft.notes)
  }

  return draft
}

function stripGeneratedCycleNotes(notes) {
  return String(notes)
    .replace(/\nCreated from previous cycle\.$/i, '')
    .replace(/\nNext reminder created from previous record\.$/i, '')
    .trim()
}
