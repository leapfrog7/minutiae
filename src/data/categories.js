export const indiaFirstCategories = [
  'Electricity',
  'IGL / Gas',
  'Water',
  'Mobile',
  'Broadband',
  'Society Maintenance',
  'House Tax',
  'School Fee',
  'Insurance',
  'EMI',
  'Maid',
  'Cook',
  'Milkman',
  'Newspaper',
  'Ironing',
  'Car Cleaner',
  'Tutor',
  'Grocery',
  'Eating Out / Restaurant',
  'Medical',
  'Fuel',
  'Shopping',
  'Subscription',
  'Complaint',
  'Document',
  'Miscellaneous',
]

export const billCategories = indiaFirstCategories.filter(
  (category) => category !== 'Insurance',
)

export const expenseCategories = indiaFirstCategories

export const incomeCategories = [
  'Salary',
  'Interest',
  'Rent',
  'Dividend',
  'Refund',
  'Reimbursement',
  'Freelance',
  'Gift',
  'Pension',
  'Other',
]

export const paymentModes = [
  'UPI',
  'Cash',
  'Card',
  'Bank Transfer',
  'Auto Debit',
  'Other',
]

export const transactionTypes = [
  { value: 'income', label: 'Income' },
  { value: 'expense', label: 'Expense' },
]

export const transactionCategories = {
  income: incomeCategories,
  expense: expenseCategories,
}
