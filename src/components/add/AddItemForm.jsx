import { cloneElement, useId, useMemo, useState } from 'react'
import {
  BILL_CATEGORIES,
  EXPENSE_CATEGORIES,
  getStatusMeta,
  incomeCategories,
  indiaFirstCategories,
  paymentModes,
} from '../../data/lifeAdminConstants'
import { getItemTypeMeta } from '../../data/itemTypes'
import FormInfoPanel from '../common/FormInfoPanel'
import {
  calculateVendorSettlement,
  formatDisplayDate,
  getDateInputValue,
  getDuplicateWarningItems,
  hasLinkedExpense,
} from '../../features/lifeItems/lifeItemHelpers'
import { getLifeItems } from '../../features/lifeItems/lifeItemStorage'

const today = () => getDateInputValue()

const defaultValuesByType = {
  subscription: {
    title: '',
    amount: '',
    billingCycle: 'monthly',
    renewalDate: '',
    paymentMode: 'UPI',
    autoRenewal: 'yes',
    cancelBeforeDate: '',
    category: 'Subscription',
    status: 'pending',
    addToMoney: 'yes',
    notes: '',
  },
  bill: {
    title: '',
    amount: '',
    dueDate: today(),
    frequency: 'monthly',
    nextReminderMode: 'auto',
    status: 'unpaid',
    addToMoney: 'yes',
    paymentMode: 'UPI',
    category: 'Electricity',
    notes: '',
  },
  insurance: {
    title: '',
    policyType: '',
    insurerName: '',
    policyNumber: '',
    premiumAmount: '',
    dueDate: '',
    frequency: 'yearly',
    paymentMode: 'UPI',
    status: 'unpaid',
    addToMoney: 'yes',
    category: 'Insurance',
    notes: '',
  },
  vendor: {
    vendorName: '',
    serviceType: 'Maid',
    usualAmount: '',
    monthlyAmount: '',
    paymentFrequency: 'monthly',
    contactNumber: '',
    upiId: '',
    paymentDate: today(),
    paymentMonth: today().slice(0, 7),
    status: 'unpaid',
    amountDue: '',
    adjustmentAmount: '',
    advanceGiven: '',
    advanceAdjusted: '',
    balancePayable: '',
    amountPaid: '',
    autoPay: 'no',
    addToMoney: 'yes',
    paymentMode: 'UPI',
    notes: '',
  },
  complaint: {
    title: '',
    complaintId: '',
    companyOrDepartment: '',
    dateRaised: today(),
    expectedResolutionDate: '',
    followUpDate: '',
    status: 'open',
    contactNumber: '',
    notes: '',
  },
  expense: {
    title: '',
    amount: '',
    date: today(),
    category: 'Grocery',
    paymentMode: 'UPI',
    recurring: 'no',
    status: 'paid',
    notes: '',
  },
  income: {
    title: 'Salary',
    amount: '',
    date: today(),
    category: 'Salary',
    sourceName: 'Employer',
    recurring: 'yes',
    frequency: 'monthly',
    paymentMode: 'Bank Transfer',
    status: 'received',
    notes: '',
  },
  investment: {
    title: '',
    investmentType: 'SIP / Mutual Fund',
    amount: '',
    dueDate: today(),
    frequency: 'monthly',
    status: 'unpaid',
    paymentMode: 'Bank Transfer',
    autoPay: 'no',
    institutionName: '',
    accountOrFolio: '',
    addToMoney: 'yes',
    notes: '',
  },
  reminder: {
    title: '',
    dueDate: '',
    category: 'Personal',
    priority: 'normal',
    status: 'pending',
    recurring: 'no',
    frequency: 'one_time',
    relatedPerson: '',
    notes: '',
  },
  document: {
    title: '',
    recordType: 'Receipt',
    documentType: '',
    relatedTo: '',
    amount: '',
    documentDate: today(),
    serviceDate: today(),
    nextServiceInterval: 'none',
    nextServiceDate: '',
    expiryInterval: 'none',
    expiryDate: '',
    warrantyInterval: 'none',
    warrantyTill: '',
    vendorName: '',
    contactNumber: '',
    serviceInterval: 'one_time',
    partsReplaced: '',
    referenceNumber: '',
    attachmentNote: '',
    addToMoney: 'yes',
    paymentMode: 'UPI',
    category: 'Miscellaneous',
    status: 'pending',
    notes: '',
  },
}

const statusOptionsByType = {
  subscription: ['pending', 'unpaid', 'paid', 'overdue'],
  bill: ['unpaid', 'paid', 'overdue'],
  insurance: ['unpaid', 'paid', 'overdue'],
  vendor: ['unpaid', 'paid', 'overdue'],
  complaint: ['open', 'followed_up', 'resolved', 'closed'],
  expense: ['paid', 'unpaid'],
  income: ['received', 'expected'],
  investment: ['unpaid', 'paid', 'overdue'],
  reminder: ['pending', 'completed'],
  document: ['pending', 'completed', 'paid', 'closed'],
}

const frequencyOptions = [
  { value: 'monthly', label: 'Monthly' },
  { value: 'quarterly', label: 'Quarterly' },
  { value: 'six_monthly', label: 'Six-monthly' },
  { value: 'yearly', label: 'Yearly' },
  { value: 'one_time', label: 'One-time' },
]
const investmentTypeOptions = [
  'SIP / Mutual Fund',
  'PPF',
  'NPS',
  'Fixed Deposit',
  'Recurring Deposit',
  'Stocks',
  'Bonds',
  'Gold',
  'Insurance-linked Investment',
  'Other',
]
const reminderCategories = [
  'Tax / ITR',
  'Office / Work',
  'Leave',
  'Personal',
  'Family',
  'Payment',
  'Government / Compliance',
  'School / Children',
  'Health',
  'Home',
  'Follow-up',
  'Other',
]
const reminderFrequencyOptions = [
  { value: 'one_time', label: 'One-time' },
  { value: 'weekly', label: 'Weekly' },
  ...frequencyOptions.filter((option) => option.value !== 'one_time'),
]
const billNextReminderOptions = [
  { value: 'auto', label: 'Auto-create after paid' },
  { value: 'ask', label: 'Ask each time' },
  { value: 'none', label: 'Do not create' },
]
const billingCycleOptions = frequencyOptions.filter(
  (option) => option.value !== 'one_time',
)
const vendorFrequencyOptions = [
  { value: 'monthly', label: 'Monthly' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'one_time', label: 'One-time' },
  { value: 'as_needed', label: 'As needed' },
]
const vendorServiceTypes = [
  'Maid',
  'Cook',
  'Milkman',
  'Newspaper',
  'Ironing',
  'Car Cleaner',
  'Driver',
  'Tutor',
  'Garbage Collector',
  'Gardener',
  'Security / Society',
  'Plumber',
  'Electrician',
  'RO Service',
  'AC Service',
  'Appliance Repair',
  'Other',
]
const recordTypeOptions = [
  'Receipt',
  'Warranty',
  'Service / Maintenance',
  'Repair',
  'AMC',
  'Tax Receipt',
  'Insurance Document',
  'Complaint Proof',
  'Other',
]
const serviceIntervalOptions = [
  { value: 'one_time', label: 'One-time' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'quarterly', label: 'Quarterly' },
  { value: 'six_monthly', label: 'Six-monthly' },
  { value: 'yearly', label: 'Yearly' },
  { value: 'custom', label: 'Custom' },
]
const reminderIntervalOptions = [
  { value: 'none', label: 'Not needed' },
  { value: '3m', label: '3m' },
  { value: '6m', label: '6m' },
  { value: '9m', label: '9m' },
  { value: '1y', label: '1y' },
  { value: '2y', label: '2y' },
  { value: '3y', label: '3y' },
  { value: '5y', label: '5y' },
]
const toNumber = (value) => (value === '' ? 0 : Number(value))

function Field({ children, className = '', error, label }) {
  const errorId = useId()

  return (
    <label className={`block ${className}`}>
      <span className="text-xs font-semibold text-stone-700">{label}</span>
      <div className="mt-1">
        {cloneElement(children, {
          'aria-describedby': error ? errorId : undefined,
          'aria-invalid': error ? true : undefined,
        })}
      </div>
      {error && <p id={errorId} className="mt-1 text-xs font-semibold text-rose-600">{error}</p>}
    </label>
  )
}

function TextInput({ as = 'input', className = '', ...props }) {
  const Component = as
  const baseClass =
    'w-full rounded-xl border border-stone-200 bg-white px-3 py-2.5 text-sm text-stone-950 outline-none placeholder:text-stone-400 focus:border-teal-300 focus:ring-4 focus:ring-teal-100'

  return <Component className={`${baseClass} ${className}`} {...props} />
}

function SelectInput(props) {
  return (
    <select
      className="w-full rounded-xl border border-stone-200 bg-white px-3 py-2.5 text-sm text-stone-950 outline-none focus:border-teal-300 focus:ring-4 focus:ring-teal-100"
      {...props}
    />
  )
}

function AddItemForm({
  initialItem,
  mode = 'add',
  onBack,
  onCancel,
  onSave,
  selectedType,
}) {
  const typeMeta = getItemTypeMeta(selectedType)
  const initialForm = useMemo(
    () => getInitialForm(selectedType, initialItem, mode),
    [initialItem, mode, selectedType],
  )
  const [form, setForm] = useState(initialForm)
  const [submitted, setSubmitted] = useState(false)

  const errors = useMemo(() => validateForm(selectedType, form), [form, selectedType])
  const duplicateWarningItems = useMemo(() => {
    try {
      return getDuplicateWarningItems(
        buildLifeItem(selectedType, form),
        getLifeItems(),
      )
    } catch {
      return []
    }
  }, [form, selectedType])
  const statusOptions = statusOptionsByType[selectedType] ?? ['pending']

  function updateField(field, value) {
    setForm((current) => {
      const nextForm = { ...current, [field]: value }

      if (selectedType === 'income' && field === 'category') {
        if (value === 'Salary') {
          nextForm.title = current.title || 'Salary'
          nextForm.sourceName = current.sourceName || 'Employer'
          nextForm.recurring = 'yes'
          nextForm.frequency = 'monthly'
        } else if (current.title === 'Salary') {
          nextForm.title = ''
          nextForm.recurring = 'no'
        }
      }

      if (selectedType === 'document') {
        return recalculateDocumentReminderDates(nextForm, field)
      }

      return nextForm
    })
  }

  function handleSubmit(event) {
    event.preventDefault()
    setSubmitted(true)

    if (Object.keys(errors).length > 0) {
      return
    }

    const saved = onSave(
      buildLifeItem(selectedType, form),
      getSaveOptions(selectedType, form),
    )

    if (saved === false) {
      return
    }

    setForm(initialForm)
    setSubmitted(false)
  }

  const showError = (field) => (submitted ? errors[field] : '')

  return (
    <form onSubmit={handleSubmit} className="rounded-2xl border border-stone-200 bg-white p-3 shadow-sm shadow-stone-200/60 md:p-4">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-teal-700">
            {typeMeta.emoji} {typeMeta.label}
          </p>
          <h2 className="mt-1 text-base font-semibold text-stone-950">
            {mode === 'edit' ? 'Edit details' : 'Add details'}
          </h2>
        </div>
        <button
          type="button"
          onClick={mode === 'edit' ? onCancel : onBack}
          className="rounded-full bg-stone-100 px-3 py-2 text-xs font-semibold text-stone-700"
        >
          {mode === 'edit' ? 'Cancel' : 'Change'}
        </button>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        {selectedType === 'subscription' && (
          <>
            <Field label="Title" error={showError('title')}>
              <TextInput value={form.title} onChange={(event) => updateField('title', event.target.value)} placeholder="Netflix, Prime, Hotstar..." />
            </Field>
            <TwoFields>
              <Field label="Amount" error={showError('amount')}>
                <TextInput type="number" min="0" inputMode="decimal" value={form.amount} onChange={(event) => updateField('amount', event.target.value)} />
              </Field>
              <Field label="Renewal" error={showError('renewalDate')}>
                <TextInput type="date" value={form.renewalDate} onChange={(event) => updateField('renewalDate', event.target.value)} />
              </Field>
            </TwoFields>
            <TwoFields>
              <Field label="Cycle">
                <SelectInput value={form.billingCycle} onChange={(event) => updateField('billingCycle', event.target.value)}>
                  {billingCycleOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
                </SelectInput>
              </Field>
              <Field label="Auto-renew">
                <SelectInput value={form.autoRenewal} onChange={(event) => updateField('autoRenewal', event.target.value)}>
                  <option value="yes">Yes</option>
                  <option value="no">No</option>
                </SelectInput>
              </Field>
            </TwoFields>
            <CommonMoneyFields form={form} updateField={updateField} statusOptions={statusOptions} />
            <Field label="Cancel before">
              <TextInput type="date" value={form.cancelBeforeDate} onChange={(event) => updateField('cancelBeforeDate', event.target.value)} />
            </Field>
            <AddToMoneyOption
              duplicateExpense={hasExistingLinkedExpense(initialItem)}
              itemType="subscription"
              status={form.status}
              value={form.addToMoney}
              onChange={(value) => updateField('addToMoney', value)}
            />
          </>
        )}

        {selectedType === 'bill' && (
          <>
            <FormInfoPanel title="What is a Bill?">
              Use Bills for payments that have a due date, such as electricity, EMI,
              broadband, tax or maintenance. Paid bills can also be added to Money.
            </FormInfoPanel>
            <Field label="Title" error={showError('title')}>
              <TextInput value={form.title} onChange={(event) => updateField('title', event.target.value)} placeholder="Electricity bill" />
            </Field>
            <TwoFields>
              <Field label="Amount" error={showError('amount')}>
                <TextInput type="number" min="0" inputMode="decimal" value={form.amount} onChange={(event) => updateField('amount', event.target.value)} />
              </Field>
              <Field label="Due date" error={showError('dueDate')}>
                <TextInput type="date" value={form.dueDate} onChange={(event) => updateField('dueDate', event.target.value)} />
              </Field>
            </TwoFields>
            <Field label="Frequency">
              <SelectInput value={form.frequency} onChange={(event) => updateField('frequency', event.target.value)}>
                {frequencyOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
              </SelectInput>
            </Field>
            <Field label="Next reminder">
              <SelectInput value={form.nextReminderMode} onChange={(event) => updateField('nextReminderMode', event.target.value)}>
                {billNextReminderOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
              </SelectInput>
            </Field>
            <CommonMoneyFields
              categoryOptions={BILL_CATEGORIES}
              form={form}
              updateField={updateField}
              statusOptions={statusOptions}
            />
            <AddToMoneyOption
              duplicateExpense={hasExistingLinkedExpense(initialItem)}
              itemType="bill"
              status={form.status}
              value={form.addToMoney}
              onChange={(value) => updateField('addToMoney', value)}
            />
          </>
        )}

        {selectedType === 'insurance' && (
          <>
            <Field label="Title" error={showError('title')}>
              <TextInput value={form.title} onChange={(event) => updateField('title', event.target.value)} placeholder="Health insurance premium" />
            </Field>
            <TwoFields>
              <Field label="Premium" error={showError('premiumAmount')}>
                <TextInput type="number" min="0" inputMode="decimal" value={form.premiumAmount} onChange={(event) => updateField('premiumAmount', event.target.value)} />
              </Field>
              <Field label="Due date" error={showError('dueDate')}>
                <TextInput type="date" value={form.dueDate} onChange={(event) => updateField('dueDate', event.target.value)} />
              </Field>
            </TwoFields>
            <TwoFields>
              <Field label="Policy type">
                <TextInput value={form.policyType} onChange={(event) => updateField('policyType', event.target.value)} placeholder="Health, car, term" />
              </Field>
              <Field label="Frequency">
                <SelectInput value={form.frequency} onChange={(event) => updateField('frequency', event.target.value)}>
                  {frequencyOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
                </SelectInput>
              </Field>
            </TwoFields>
            <Field label="Insurer">
              <TextInput value={form.insurerName} onChange={(event) => updateField('insurerName', event.target.value)} placeholder="LIC, HDFC Ergo, etc." />
            </Field>
            <Field label="Policy number">
              <TextInput value={form.policyNumber} onChange={(event) => updateField('policyNumber', event.target.value)} />
            </Field>
            <TwoFields>
              <Field label="Status">
                <StatusSelect value={form.status} options={statusOptions} onChange={(value) => updateField('status', value)} />
              </Field>
              <Field label="Payment">
                <PaymentSelect value={form.paymentMode} onChange={(value) => updateField('paymentMode', value)} />
              </Field>
            </TwoFields>
            <AddToMoneyOption
              duplicateExpense={hasExistingLinkedExpense(initialItem)}
              itemType="insurance premium"
              status={form.status}
              value={form.addToMoney}
              onChange={(value) => updateField('addToMoney', value)}
            />
          </>
        )}

        {selectedType === 'vendor' && (
          <>
            <FormGroup title="Vendor details">
              <Field label="Vendor" error={showError('vendorName')}>
                <TextInput value={form.vendorName} onChange={(event) => updateField('vendorName', event.target.value)} placeholder="Rani, Mother Dairy booth..." />
              </Field>
              <TwoFields>
                <Field label="Service" error={showError('serviceType')}>
                  <SelectInput value={form.serviceType} onChange={(event) => updateField('serviceType', event.target.value)}>
                    {vendorServiceTypes.map((service) => <option key={service} value={service}>{service}</option>)}
                  </SelectInput>
                </Field>
                <Field label="Phone">
                  <TextInput type="tel" value={form.contactNumber} onChange={(event) => updateField('contactNumber', event.target.value)} />
                </Field>
              </TwoFields>
              <Field label="UPI ID">
                <TextInput value={form.upiId} onChange={(event) => updateField('upiId', event.target.value)} placeholder="name@upi" />
              </Field>
            </FormGroup>

            <FormGroup title="Payment arrangement">
              <TwoFields>
                <Field label="Usual amount">
                  <TextInput type="number" min="0" inputMode="decimal" value={form.usualAmount} onChange={(event) => updateField('usualAmount', event.target.value)} />
                </Field>
                <Field label="Frequency">
                  <SelectInput value={form.paymentFrequency} onChange={(event) => updateField('paymentFrequency', event.target.value)}>
                    {vendorFrequencyOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
                  </SelectInput>
                </Field>
              </TwoFields>
              <TwoFields>
                <Field label="Pay date" error={showError('paymentDate')}>
                  <TextInput type="date" value={form.paymentDate} onChange={(event) => updateField('paymentDate', event.target.value)} />
                </Field>
                <Field label="Auto-pay">
                  <SelectInput value={form.autoPay} onChange={(event) => updateField('autoPay', event.target.value)}>
                    <option value="no">No</option>
                    <option value="yes">Yes</option>
                  </SelectInput>
                </Field>
              </TwoFields>
            </FormGroup>

            <FormGroup title="This payment">
              <TwoFields>
                <Field label="Month">
                  <TextInput type="month" value={form.paymentMonth} onChange={(event) => updateField('paymentMonth', event.target.value)} />
                </Field>
                <Field label="Due" error={showError('vendorAmount')}>
                  <TextInput type="number" min="0" inputMode="decimal" value={form.amountDue} onChange={(event) => updateField('amountDue', event.target.value)} />
                </Field>
              </TwoFields>
              <TwoFields>
                <Field label="Adjust">
                  <TextInput type="number" min="0" inputMode="decimal" value={form.adjustmentAmount} onChange={(event) => updateField('adjustmentAmount', event.target.value)} />
                </Field>
                <Field label="Adv. adjusted">
                  <TextInput type="number" min="0" inputMode="decimal" value={form.advanceAdjusted} onChange={(event) => updateField('advanceAdjusted', event.target.value)} />
                </Field>
              </TwoFields>
              <TwoFields>
                <Field label="Advance given">
                  <TextInput type="number" min="0" inputMode="decimal" value={form.advanceGiven} onChange={(event) => updateField('advanceGiven', event.target.value)} />
                </Field>
                <Field label="Paid" error={showError('amountPaid')}>
                  <TextInput type="number" min="0" inputMode="decimal" value={form.amountPaid} onChange={(event) => updateField('amountPaid', event.target.value)} />
                </Field>
              </TwoFields>
              <TwoFields>
                <Field label="Balance">
                  <TextInput type="number" min="0" inputMode="decimal" value={form.balancePayable} onChange={(event) => updateField('balancePayable', event.target.value)} />
                </Field>
                <Field label="Status">
                  <StatusSelect value={form.status} options={statusOptions} onChange={(value) => updateField('status', value)} />
                </Field>
              </TwoFields>
              <Field label="Payment">
                <PaymentSelect value={form.paymentMode} onChange={(value) => updateField('paymentMode', value)} />
              </Field>
              <VendorSettlementSummary form={form} />
              <AddToMoneyOption
                duplicateExpense={hasExistingLinkedExpense(initialItem)}
                itemType="vendor payment"
                status={form.status}
                value={form.addToMoney}
                onChange={(value) => updateField('addToMoney', value)}
              />
            </FormGroup>
          </>
        )}

        {selectedType === 'complaint' && (
          <>
            <Field label="Title" error={showError('title')}>
              <TextInput value={form.title} onChange={(event) => updateField('title', event.target.value)} placeholder="Broadband issue" />
            </Field>
            <TwoFields>
              <Field label="Complaint ID" error={showError('complaintIdentity')}>
                <TextInput value={form.complaintId} onChange={(event) => updateField('complaintId', event.target.value)} />
              </Field>
              <Field label="Company / dept" error={showError('complaintIdentity')}>
                <TextInput value={form.companyOrDepartment} onChange={(event) => updateField('companyOrDepartment', event.target.value)} />
              </Field>
            </TwoFields>
            <TwoFields>
              <Field label="Raised" error={showError('dateRaised')}>
                <TextInput type="date" value={form.dateRaised} onChange={(event) => updateField('dateRaised', event.target.value)} />
              </Field>
              <Field label="Follow-up" error={showError('followUpDate')}>
                <TextInput type="date" value={form.followUpDate} onChange={(event) => updateField('followUpDate', event.target.value)} />
              </Field>
            </TwoFields>
            <TwoFields>
              <Field label="Expected">
                <TextInput type="date" value={form.expectedResolutionDate} onChange={(event) => updateField('expectedResolutionDate', event.target.value)} />
              </Field>
              <Field label="Phone">
                <TextInput type="tel" value={form.contactNumber} onChange={(event) => updateField('contactNumber', event.target.value)} />
              </Field>
            </TwoFields>
            <Field label="Status">
              <StatusSelect value={form.status} options={statusOptions} onChange={(value) => updateField('status', value)} />
            </Field>
          </>
        )}

        {selectedType === 'expense' && (
          <>
            <FormInfoPanel title="What is an Expense?">
              Use Expenses for money already spent, such as groceries, fuel, eating out,
              shopping or medical costs.
            </FormInfoPanel>
            <Field label="Title" error={showError('title')}>
              <TextInput value={form.title} onChange={(event) => updateField('title', event.target.value)} placeholder="Grocery run" />
            </Field>
            <TwoFields>
              <Field label="Amount" error={showError('amount')}>
                <TextInput type="number" min="0" inputMode="decimal" value={form.amount} onChange={(event) => updateField('amount', event.target.value)} />
              </Field>
              <Field label="Date" error={showError('date')}>
                <TextInput type="date" value={form.date} onChange={(event) => updateField('date', event.target.value)} />
              </Field>
            </TwoFields>
            <CommonMoneyFields
              categoryOptions={EXPENSE_CATEGORIES}
              form={form}
              updateField={updateField}
              statusOptions={statusOptions}
            />
            <Field label="Recurring">
              <SelectInput value={form.recurring} onChange={(event) => updateField('recurring', event.target.value)}>
                <option value="no">No</option>
                <option value="yes">Yes</option>
              </SelectInput>
            </Field>
          </>
        )}

        {selectedType === 'income' && (
          <>
            <Field label="Title" error={showError('title')}>
              <TextInput value={form.title} onChange={(event) => updateField('title', event.target.value)} placeholder="Salary, rent, refund..." />
            </Field>
            <TwoFields>
              <Field label="Amount" error={showError('amount')}>
                <TextInput type="number" min="0" inputMode="decimal" value={form.amount} onChange={(event) => updateField('amount', event.target.value)} />
              </Field>
              <Field label="Date received" error={showError('date')}>
                <TextInput type="date" value={form.date} onChange={(event) => updateField('date', event.target.value)} />
              </Field>
            </TwoFields>
            <TwoFields>
              <Field label="Category" error={showError('category')}>
                <CategorySelect
                  options={incomeCategories}
                  value={form.category}
                  onChange={(value) => updateField('category', value)}
                />
              </Field>
              <Field label="Status" error={showError('status')}>
                <StatusSelect value={form.status} options={statusOptions} onChange={(value) => updateField('status', value)} />
              </Field>
            </TwoFields>
            <Field label="Source">
              <TextInput value={form.sourceName} onChange={(event) => updateField('sourceName', event.target.value)} placeholder="Employer, tenant, bank..." />
            </Field>
            <TwoFields>
              <Field label="Recurring income">
                <SelectInput value={form.recurring} onChange={(event) => updateField('recurring', event.target.value)}>
                  <option value="yes">Yes</option>
                  <option value="no">No</option>
                </SelectInput>
              </Field>
              <Field label="Frequency">
                <SelectInput value={form.frequency} onChange={(event) => updateField('frequency', event.target.value)}>
                  {frequencyOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
                </SelectInput>
              </Field>
            </TwoFields>
            <Field label="Received in">
              <PaymentSelect value={form.paymentMode} onChange={(value) => updateField('paymentMode', value)} />
            </Field>
          </>
        )}

        {selectedType === 'investment' && (
          <>
            <FormInfoPanel title="What is an Investment?">
              Use Investments for SIPs, PPF, NPS, deposits and other money set
              aside for the future. Marking one invested can also include it in Money.
            </FormInfoPanel>
            <Field label="Title" error={showError('title')}>
              <TextInput value={form.title} onChange={(event) => updateField('title', event.target.value)} placeholder="Monthly SIP" />
            </Field>
            <Field label="Investment type" error={showError('investmentType')}>
              <SelectInput value={form.investmentType} onChange={(event) => updateField('investmentType', event.target.value)}>
                {investmentTypeOptions.map((option) => <option key={option} value={option}>{option}</option>)}
              </SelectInput>
            </Field>
            <TwoFields>
              <Field label="Amount" error={showError('amount')}>
                <TextInput type="number" min="0" inputMode="decimal" value={form.amount} onChange={(event) => updateField('amount', event.target.value)} />
              </Field>
              <Field label="Due date" error={showError('dueDate')}>
                <TextInput type="date" value={form.dueDate} onChange={(event) => updateField('dueDate', event.target.value)} />
              </Field>
            </TwoFields>
            <TwoFields>
              <Field label="Frequency" error={showError('frequency')}>
                <SelectInput value={form.frequency} onChange={(event) => updateField('frequency', event.target.value)}>
                  {frequencyOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
                </SelectInput>
              </Field>
              <Field label="Status" error={showError('status')}>
                <StatusSelect value={form.status} options={statusOptions} onChange={(value) => updateField('status', value)} />
              </Field>
            </TwoFields>
            <TwoFields>
              <Field label="Payment">
                <PaymentSelect value={form.paymentMode} onChange={(value) => updateField('paymentMode', value)} />
              </Field>
              <Field label="Auto-pay">
                <SelectInput value={form.autoPay} onChange={(event) => updateField('autoPay', event.target.value)}>
                  <option value="no">No</option>
                  <option value="yes">Yes</option>
                </SelectInput>
              </Field>
            </TwoFields>
            <TwoFields>
              <Field label="Institution">
                <TextInput value={form.institutionName} onChange={(event) => updateField('institutionName', event.target.value)} placeholder="Bank, broker or fund house" />
              </Field>
              <Field label="Account / folio">
                <TextInput value={form.accountOrFolio} onChange={(event) => updateField('accountOrFolio', event.target.value)} />
              </Field>
            </TwoFields>
            <AddToMoneyOption
              duplicateExpense={hasExistingLinkedExpense(initialItem)}
              itemType="investment"
              status={form.status}
              value={form.addToMoney}
              onChange={(value) => updateField('addToMoney', value)}
            />
          </>
        )}

        {selectedType === 'reminder' && (
          <>
            <FormInfoPanel title="What is a Reminder?">
              Use Reminders for tasks and deadlines such as filing ITR,
              completing APAR, applying leave or paying someone by a date.
            </FormInfoPanel>
            <Field label="What needs to be done?" error={showError('title')}>
              <TextInput value={form.title} onChange={(event) => updateField('title', event.target.value)} placeholder="File ITR" />
            </Field>
            <Field label="Due date" error={showError('dueDate')}>
              <TextInput type="date" value={form.dueDate} onChange={(event) => updateField('dueDate', event.target.value)} />
            </Field>
            <TwoFields>
              <Field label="Category" error={showError('category')}>
                <SelectInput value={form.category} onChange={(event) => updateField('category', event.target.value)}>
                  {reminderCategories.map((option) => <option key={option} value={option}>{option}</option>)}
                </SelectInput>
              </Field>
              <Field label="Priority">
                <SelectInput value={form.priority} onChange={(event) => updateField('priority', event.target.value)}>
                  <option value="low">Low</option>
                  <option value="normal">Normal</option>
                  <option value="high">High</option>
                </SelectInput>
              </Field>
            </TwoFields>
            <TwoFields>
              <Field label="Status" error={showError('status')}>
                <StatusSelect value={form.status} options={statusOptions} onChange={(value) => updateField('status', value)} />
              </Field>
              <Field label="Recurring">
                <SelectInput value={form.recurring} onChange={(event) => updateField('recurring', event.target.value)}>
                  <option value="no">No</option>
                  <option value="yes">Yes</option>
                </SelectInput>
              </Field>
            </TwoFields>
            <Field label="Frequency">
              <SelectInput value={form.frequency} onChange={(event) => updateField('frequency', event.target.value)}>
                {reminderFrequencyOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
              </SelectInput>
            </Field>
            <Field label="Related person">
              <TextInput value={form.relatedPerson} onChange={(event) => updateField('relatedPerson', event.target.value)} placeholder="Friend, colleague, bank contact..." />
            </Field>
          </>
        )}

        {selectedType === 'document' && (
          <>
            <FormGroup title="Record details">
              <Field label="Title" error={showError('title')}>
                <TextInput value={form.title} onChange={(event) => updateField('title', event.target.value)} placeholder="RO filter changed" />
              </Field>
              <Field label="Record type">
                <SelectInput value={form.recordType} onChange={(event) => updateField('recordType', event.target.value)}>
                  {recordTypeOptions.map((option) => <option key={option} value={option}>{option}</option>)}
                </SelectInput>
              </Field>
              <Field label="Related to">
                <TextInput value={form.relatedTo} onChange={(event) => updateField('relatedTo', event.target.value)} placeholder="Aquaguard RO, Bedroom AC" />
              </Field>
              <Field label="Category">
                <CategorySelect value={form.category} onChange={(value) => updateField('category', value)} />
              </Field>
              <Field label="Reference number">
                <TextInput value={form.referenceNumber} onChange={(event) => updateField('referenceNumber', event.target.value)} placeholder="Invoice, job card, complaint no." />
              </Field>
              <Field label="Status">
                <StatusSelect value={form.status} options={statusOptions} onChange={(value) => updateField('status', value)} />
              </Field>
            </FormGroup>

            <FormGroup title="Dates & reminders">
              <TwoFields>
                <Field label="Document date" error={showError('documentDateGroup')}>
                  <TextInput type="date" value={form.documentDate} onChange={(event) => updateField('documentDate', event.target.value)} />
                </Field>
                <Field label="Service date" error={showError('documentDateGroup')}>
                  <TextInput type="date" value={form.serviceDate} onChange={(event) => updateField('serviceDate', event.target.value)} />
                </Field>
              </TwoFields>
              <ReminderIntervalControl
                date={form.nextServiceDate}
                interval={form.nextServiceInterval}
                label="Next service due"
                previewLabel="Due"
                onChange={(value) => updateField('nextServiceInterval', value)}
              />
              <ReminderIntervalControl
                date={form.warrantyTill}
                interval={form.warrantyInterval}
                label="Warranty expires"
                previewLabel="Expires"
                onChange={(value) => updateField('warrantyInterval', value)}
              />
              <ReminderIntervalControl
                date={form.expiryDate}
                interval={form.expiryInterval}
                label="Expiry / next due"
                previewLabel="Date"
                onChange={(value) => updateField('expiryInterval', value)}
              />
            </FormGroup>

            <FormGroup title="Service / vendor details">
              <Field label="Vendor / service person">
                <TextInput value={form.vendorName} onChange={(event) => updateField('vendorName', event.target.value)} />
              </Field>
              <Field label="Contact number">
                <TextInput type="tel" value={form.contactNumber} onChange={(event) => updateField('contactNumber', event.target.value)} />
              </Field>
              <Field label="Service interval">
                <SelectInput value={form.serviceInterval} onChange={(event) => updateField('serviceInterval', event.target.value)}>
                  {serviceIntervalOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
                </SelectInput>
              </Field>
              <Field label="Parts replaced">
                <TextInput value={form.partsReplaced} onChange={(event) => updateField('partsReplaced', event.target.value)} placeholder="RO filter kit, AC capacitor" />
              </Field>
            </FormGroup>

            <FormGroup title="Payment details">
              <Field label="Amount">
                <TextInput type="number" min="0" inputMode="decimal" value={form.amount} onChange={(event) => updateField('amount', event.target.value)} />
              </Field>
              <Field label="Payment">
                <PaymentSelect value={form.paymentMode} onChange={(value) => updateField('paymentMode', value)} />
              </Field>
              <Field label="Attachment note" className="md:col-span-2">
                <TextInput value={form.attachmentNote} onChange={(event) => updateField('attachmentNote', event.target.value)} placeholder="WhatsApp, Google Photos, email PDF" />
              </Field>
              <AddToMoneyOption
                amount={form.amount}
                duplicateExpense={hasExistingLinkedExpense(initialItem)}
                itemType="record"
                status={form.status}
                value={form.addToMoney}
                onChange={(value) => updateField('addToMoney', value)}
              />
            </FormGroup>
          </>
        )}

        <Field label="Notes" className="md:col-span-2">
          <TextInput as="textarea" rows="3" value={form.notes} onChange={(event) => updateField('notes', event.target.value)} placeholder="Anything useful to remember" />
        </Field>

        {duplicateWarningItems.length > 0 && (
          <DuplicateWarning items={duplicateWarningItems} />
        )}

        <button
          type="submit"
          className="mt-1 rounded-2xl bg-teal-700 px-4 py-3 text-sm font-bold text-white shadow-sm shadow-teal-900/20 disabled:bg-stone-300 md:col-span-2 md:justify-self-end md:px-8"
        >
          {mode === 'edit' ? 'Save changes' : 'Save item'}
        </button>
      </div>
    </form>
  )
}

function TwoFields({ children }) {
  return <div className="grid gap-2 sm:grid-cols-2 md:contents">{children}</div>
}

function FormGroup({ children, title }) {
  return (
    <section className="grid gap-3 rounded-xl bg-stone-50 px-3 py-3 md:col-span-2 md:grid-cols-2">
      <h3 className="text-xs font-bold uppercase tracking-[0.1em] text-stone-500 md:col-span-2">
        {title}
      </h3>
      {children}
    </section>
  )
}

function DuplicateWarning({ items }) {
  return (
    <section className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-3 md:col-span-2">
      <p className="text-sm font-bold text-amber-900">Similar item already exists</p>
      <div className="mt-2 grid gap-1">
        {items.map((item) => (
          <p key={item.id} className="text-xs font-semibold text-stone-700">
            {item.title || item.vendorName || item.relatedTo || 'Saved item'} -{' '}
            {formatDisplayDate(getDuplicateWarningDate(item))}
          </p>
        ))}
      </div>
    </section>
  )
}

function getDuplicateWarningDate(item) {
  const dateValue =
    item.dueDate ||
    item.paymentDate ||
    item.renewalDate ||
    item.serviceDate ||
    item.documentDate ||
    item.date ||
    item.createdAt ||
    ''

  return String(dateValue).slice(0, 10)
}

function ReminderIntervalControl({
  date,
  interval,
  label,
  onChange,
  previewLabel,
}) {
  return (
    <div className="md:col-span-2">
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs font-semibold text-stone-700">{label}</p>
        {date && (
          <p className="shrink-0 text-xs font-semibold text-teal-700">
            {previewLabel}: {formatDatePreview(date)}
          </p>
        )}
      </div>
      <div className="mt-2 flex flex-wrap gap-2">
        {reminderIntervalOptions.map((option) => {
          const isActive = interval === option.value

          return (
            <button
              key={option.value}
              type="button"
              onClick={() => onChange(option.value)}
              className={`min-w-0 rounded-full px-3 py-2 text-xs font-bold ${
                isActive
                  ? 'bg-teal-700 text-white'
                  : 'bg-white text-stone-600 ring-1 ring-stone-200'
              }`}
            >
              {option.label}
            </button>
          )
        })}
      </div>
      {!date && (
        <p className="mt-1 text-xs leading-5 text-stone-500">
          No reminder date selected.
        </p>
      )}
    </div>
  )
}

function CommonMoneyFields({
  categoryOptions = indiaFirstCategories,
  form,
  statusOptions,
  updateField,
}) {
  return (
    <>
      <TwoFields>
        <Field label="Status">
          <StatusSelect value={form.status} options={statusOptions} onChange={(value) => updateField('status', value)} />
        </Field>
        <Field label="Payment">
          <PaymentSelect value={form.paymentMode} onChange={(value) => updateField('paymentMode', value)} />
        </Field>
      </TwoFields>
      <Field label="Category">
        <CategorySelect
          options={categoryOptions}
          value={form.category}
          onChange={(value) => updateField('category', value)}
        />
      </Field>
    </>
  )
}

function recalculateDocumentReminderDates(form, changedField) {
  const shouldRecalculate =
    [
      'documentDate',
      'serviceDate',
      'nextServiceInterval',
      'warrantyInterval',
      'expiryInterval',
    ].includes(changedField)

  if (!shouldRecalculate) {
    return form
  }

  return {
    ...form,
    nextServiceDate: calculateReminderDate(
      form.serviceDate || form.documentDate || today(),
      form.nextServiceInterval,
    ),
    warrantyTill: calculateReminderDate(
      form.serviceDate || form.documentDate || today(),
      form.warrantyInterval,
    ),
    expiryDate: calculateReminderDate(
      form.documentDate || form.serviceDate || today(),
      form.expiryInterval,
    ),
  }
}

function calculateReminderDate(baseDate, interval) {
  if (!baseDate || !interval || interval === 'none') {
    return ''
  }

  return addIntervalToDate(baseDate, interval)
}

function addIntervalToDate(dateString, interval) {
  const date = new Date(`${dateString}T00:00:00`)

  if (Number.isNaN(date.getTime())) {
    return ''
  }

  const intervalMatch = /^(\d+)([my])$/.exec(interval)

  if (!intervalMatch) {
    return ''
  }

  const amount = Number(intervalMatch[1])
  const unit = intervalMatch[2]
  const originalDay = date.getDate()

  if (unit === 'm') {
    const targetMonth = date.getMonth() + amount
    date.setDate(1)
    date.setMonth(targetMonth)
    const lastDayOfTargetMonth = new Date(
      date.getFullYear(),
      date.getMonth() + 1,
      0,
    ).getDate()
    date.setDate(Math.min(originalDay, lastDayOfTargetMonth))
  }

  if (unit === 'y') {
    date.setFullYear(date.getFullYear() + amount)
  }

  return getDateInputValue(date)
}

function formatDatePreview(dateString) {
  return new Intl.DateTimeFormat('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date(`${dateString}T00:00:00`))
}

function CategorySelect({ onChange, options = indiaFirstCategories, value }) {
  const hasLegacyValue = Boolean(value && !options.includes(value))
  const renderedOptions = hasLegacyValue ? [value, ...options] : options

  return (
    <SelectInput value={value} onChange={(event) => onChange(event.target.value)}>
      {renderedOptions.map((category) => (
        <option key={category} value={category}>
          {hasLegacyValue && category === value
            ? `${category} (Legacy category)`
            : category}
        </option>
      ))}
    </SelectInput>
  )
}

function PaymentSelect({ onChange, value }) {
  return (
    <SelectInput value={value} onChange={(event) => onChange(event.target.value)}>
      {paymentModes.map((mode) => (
        <option key={mode} value={mode}>
          {mode}
        </option>
      ))}
    </SelectInput>
  )
}

function StatusSelect({ onChange, options, value }) {
  return (
    <SelectInput value={value} onChange={(event) => onChange(event.target.value)}>
      {options.map((status) => (
        <option key={status} value={status}>
          {getStatusMeta(status).label ?? labelize(status)}
        </option>
      ))}
    </SelectInput>
  )
}

function AddToMoneyOption({
  amount,
  duplicateExpense,
  itemType,
  onChange,
  status,
  value,
}) {
  if (
    !['paid', 'completed'].includes(status) ||
    (amount !== undefined && Number(amount || 0) <= 0)
  ) {
    return null
  }

  if (duplicateExpense) {
    return (
      <p className="rounded-xl bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-800">
        Expense already recorded in Money.
      </p>
    )
  }

  return (
    <label className="flex items-start gap-3 rounded-xl bg-teal-50 px-3 py-3">
      <input
        type="checkbox"
        checked={value !== 'no'}
        onChange={(event) => onChange(event.target.checked ? 'yes' : 'no')}
        className="mt-1 h-4 w-4 rounded border-stone-300 text-teal-700 focus:ring-teal-600"
      />
      <span>
        <span className="block text-sm font-bold text-stone-900">
          Add this payment to Money
        </span>
        <span className="mt-1 block text-xs leading-5 text-stone-500">
          Creates a linked paid expense for this {itemType}.
        </span>
      </span>
    </label>
  )
}

function VendorSettlementSummary({ form }) {
  const settlement = calculateVendorSettlement(form)

  return (
    <div className="grid grid-cols-3 gap-2 rounded-xl bg-white px-2 py-2 ring-1 ring-stone-200">
      <MiniMetric label="Net due" value={settlement.netDue} />
      <MiniMetric label="Paid" value={settlement.amountPaid} />
      <MiniMetric label="Balance" value={settlement.balancePayable} />
    </div>
  )
}

function MiniMetric({ label, value }) {
  return (
    <div>
      <p className="text-[10px] font-bold uppercase tracking-[0.08em] text-stone-500">
        {label}
      </p>
      <p className="mt-1 text-xs font-bold text-stone-950">
        {Number(value || 0).toLocaleString('en-IN')}
      </p>
    </div>
  )
}

function validateForm(type, form) {
  const errors = {}
  const positiveAmount = (field, label = 'Amount') => {
    if (!form[field] || Number(form[field]) <= 0) {
      errors[field] = `${label} must be positive.`
    }
  }

  if (type === 'subscription') {
    if (!form.title.trim()) errors.title = 'Title is required.'
    positiveAmount('amount')
    if (!form.renewalDate) errors.renewalDate = 'Renewal date is required.'
  }

  if (type === 'bill') {
    if (!form.title.trim()) errors.title = 'Title is required.'
    positiveAmount('amount')
    if (!form.dueDate) errors.dueDate = 'Due date is required.'
  }

  if (type === 'insurance') {
    if (!form.title.trim()) errors.title = 'Title is required.'
    positiveAmount('premiumAmount', 'Premium')
    if (!form.dueDate) errors.dueDate = 'Due date is required.'
  }

  if (type === 'vendor') {
    if (!form.vendorName.trim()) errors.vendorName = 'Vendor is required.'
    if (!form.serviceType.trim()) errors.serviceType = 'Service is required.'
    if (!form.paymentDate) errors.paymentDate = 'Payment date is required.'
    if (!form.status) errors.status = 'Status is required.'

    const amountFields = [
      'usualAmount',
      'amountDue',
      'adjustmentAmount',
      'advanceGiven',
      'advanceAdjusted',
      'balancePayable',
      'amountPaid',
    ]
    amountFields.forEach((field) => {
      if (form[field] !== '' && Number(form[field]) < 0) {
        errors[field] = 'Amount cannot be negative.'
      }
    })

    if (form.status === 'paid' && Number(form.amountPaid || 0) <= 0) {
      errors.amountPaid = 'Paid amount must be positive.'
    }

    if (
      form.status === 'unpaid' &&
      Number(form.amountDue || form.usualAmount || form.monthlyAmount || 0) <= 0
    ) {
      errors.vendorAmount = 'Add due or usual amount.'
    }
  }

  if (type === 'complaint') {
    if (!form.title.trim()) errors.title = 'Title is required.'
    if (!form.complaintId.trim() && !form.companyOrDepartment.trim()) {
      errors.complaintIdentity = 'Add complaint ID or company.'
    }
    if (!form.dateRaised) errors.dateRaised = 'Raised date is required.'
    if (!form.followUpDate) errors.followUpDate = 'Follow-up date is required.'
  }

  if (type === 'expense') {
    if (!form.title.trim()) errors.title = 'Title is required.'
    positiveAmount('amount')
    if (!form.date) errors.date = 'Date is required.'
    if (!form.category) errors.category = 'Category is required.'
    if (!form.status) errors.status = 'Status is required.'
  }

  if (type === 'income') {
    if (!form.title.trim()) errors.title = 'Title is required.'
    positiveAmount('amount')
    if (!form.date) errors.date = 'Date is required.'
    if (!form.category) errors.category = 'Category is required.'
    if (!form.status) errors.status = 'Status is required.'
  }

  if (type === 'investment') {
    if (!form.title.trim()) errors.title = 'Title is required.'
    if (!form.investmentType) errors.investmentType = 'Investment type is required.'
    positiveAmount('amount')
    if (!form.dueDate) errors.dueDate = 'Due date is required.'
    if (!form.frequency) errors.frequency = 'Frequency is required.'
    if (!form.status) errors.status = 'Status is required.'
  }

  if (type === 'reminder') {
    if (!form.title.trim()) errors.title = 'Title is required.'
    if (!form.dueDate) errors.dueDate = 'Due date is required.'
    if (!form.category) errors.category = 'Category is required.'
    if (!form.status) errors.status = 'Status is required.'
  }

  if (type === 'document') {
    if (!form.title.trim()) errors.title = 'Title is required.'
    if (
      !form.documentDate &&
      !form.serviceDate &&
      !form.nextServiceDate &&
      !form.expiryDate &&
      !form.warrantyTill
    ) {
      errors.documentDateGroup = 'Add at least one date.'
    }
    if (form.amount !== '' && Number(form.amount) < 0) {
      errors.amount = 'Amount cannot be negative.'
    }
  }

  return errors
}

function getSaveOptions(type, form) {
  return {
    recordExpense:
      ((['bill', 'vendor', 'subscription', 'insurance', 'investment'].includes(type) &&
        form.status === 'paid') ||
        (type === 'document' &&
          ['paid', 'completed'].includes(form.status) &&
          Number(form.amount || 0) > 0)) &&
      form.addToMoney !== 'no',
  }
}

function buildLifeItem(type, form) {
  if (type === 'subscription') {
    const itemForm = { ...form }
    delete itemForm.addToMoney

    return {
      ...itemForm,
      type,
      amount: toNumber(form.amount),
      autoRenewal: form.autoRenewal === 'yes',
      billingCycle: form.billingCycle,
      dueDate: form.renewalDate,
    }
  }

  if (type === 'bill') {
    const itemForm = { ...form }
    delete itemForm.addToMoney

    return {
      ...itemForm,
      type,
      amount: toNumber(form.amount),
      frequency: form.frequency,
      nextReminderMode: form.nextReminderMode,
    }
  }

  if (type === 'insurance') {
    const itemForm = { ...form }
    delete itemForm.addToMoney

    return {
      ...itemForm,
      type,
      amount: toNumber(form.premiumAmount),
      premiumAmount: toNumber(form.premiumAmount),
      category: 'Insurance',
    }
  }

  if (type === 'vendor') {
    const amountDue = toNumber(form.amountDue || form.usualAmount || form.monthlyAmount)
    const amountPaid = toNumber(form.amountPaid)
    const settlement = calculateVendorSettlement({
      ...form,
      amountDue,
      amountPaid,
    })
    const balancePayable = settlement.balancePayable

    return {
      ...form,
      type,
      title: `${form.vendorName} - ${form.serviceType}`,
      amount: form.status === 'paid' ? amountPaid : amountDue,
      usualAmount: toNumber(form.usualAmount || form.monthlyAmount),
      monthlyAmount: toNumber(form.usualAmount || form.monthlyAmount),
      paymentFrequency: form.paymentFrequency,
      autoPay: form.autoPay === 'yes',
      amountDue,
      adjustmentAmount: toNumber(form.adjustmentAmount),
      advanceAdjusted: toNumber(form.advanceAdjusted),
      amountPaid,
      dueDate: form.paymentDate,
      advanceGiven: toNumber(form.advanceGiven),
      balancePayable,
      category: form.serviceType || 'Local Vendors',
    }
  }

  if (type === 'complaint') {
    return {
      ...form,
      type,
      amount: 0,
      category: 'Complaint',
    }
  }

  if (type === 'expense') {
    return {
      ...form,
      type,
      amount: toNumber(form.amount),
      recurring: form.recurring === 'yes',
    }
  }

  if (type === 'income') {
    return {
      ...form,
      type,
      amount: toNumber(form.amount),
      recurring: form.recurring === 'yes',
    }
  }

  if (type === 'investment') {
    const itemForm = { ...form }
    delete itemForm.addToMoney

    return {
      ...itemForm,
      type,
      amount: toNumber(form.amount),
      category: form.investmentType,
      autoPay: form.autoPay === 'yes',
    }
  }

  if (type === 'reminder') {
    return {
      ...form,
      type,
      amount: 0,
      recurring: form.recurring === 'yes',
    }
  }

  if (type === 'document') {
    const recordType = form.recordType || form.documentType || 'Receipt'

    return {
      ...form,
      type,
      recordType,
      documentType: recordType,
      amount: toNumber(form.amount),
      dueDate:
        form.nextServiceDate ||
        form.expiryDate ||
        form.warrantyTill ||
        form.documentDate ||
        form.serviceDate ||
        '',
    }
  }

  return {
    ...form,
    type,
    amount: 0,
    dueDate: form.expiryDate || '',
  }
}

function getInitialForm(type, initialItem, mode = 'add') {
  if (!initialItem) {
    return getDefaultForm(type)
  }

  const baseForm = {
    ...defaultValuesByType[type],
    ...initialItem,
    amount: initialItem.amount || '',
  }

  if (type === 'subscription') {
    const duplicateExpense = hasExistingLinkedExpense(initialItem)

    return {
      ...baseForm,
      addToMoney: getInitialAddToMoneyValue(
        baseForm,
        mode,
        initialItem.status === 'paid',
        duplicateExpense,
      ),
      autoRenewal: initialItem.autoRenewal ? 'yes' : 'no',
      billingCycle: normalizeOption(initialItem.billingCycle, 'monthly'),
    }
  }

  if (type === 'bill') {
    const duplicateExpense = hasExistingLinkedExpense(initialItem)

    return {
      ...baseForm,
      addToMoney: getInitialAddToMoneyValue(
        baseForm,
        mode,
        initialItem.status === 'paid',
        duplicateExpense,
      ),
      frequency: normalizeOption(initialItem.frequency, 'monthly'),
      nextReminderMode: normalizeOption(initialItem.nextReminderMode, 'auto'),
    }
  }

  if (type === 'insurance') {
    const duplicateExpense = hasExistingLinkedExpense(initialItem)

    return {
      ...baseForm,
      addToMoney: getInitialAddToMoneyValue(
        baseForm,
        mode,
        initialItem.status === 'paid',
        duplicateExpense,
      ),
      premiumAmount: initialItem.premiumAmount || initialItem.amount || '',
      frequency: normalizeOption(initialItem.frequency, 'yearly'),
    }
  }

  if (type === 'vendor') {
    const usualAmount = initialItem.usualAmount || initialItem.monthlyAmount || ''
    const amountDue = initialItem.amountDue || initialItem.amount || initialItem.monthlyAmount || ''
    const amountPaid =
      initialItem.amountPaid || (initialItem.status === 'paid' ? initialItem.amount : '') || ''
    const duplicateExpense = hasExistingLinkedExpense(initialItem)

    return {
      ...baseForm,
      usualAmount,
      monthlyAmount: initialItem.monthlyAmount || initialItem.amount || '',
      paymentFrequency: normalizeOption(initialItem.paymentFrequency, 'monthly'),
      paymentMonth:
        initialItem.paymentMonth ||
        String(initialItem.paymentDate || initialItem.dueDate || today()).slice(0, 7),
      paymentDate: initialItem.paymentDate || initialItem.dueDate || today(),
      amountDue,
      adjustmentAmount: initialItem.adjustmentAmount || '',
      advanceGiven: initialItem.advanceGiven || '',
      advanceAdjusted: initialItem.advanceAdjusted || '',
      amountPaid,
      balancePayable: initialItem.balancePayable || '',
      autoPay: initialItem.autoPay ? 'yes' : 'no',
      addToMoney: getInitialAddToMoneyValue(
        baseForm,
        mode,
        initialItem.status === 'paid',
        duplicateExpense,
      ),
    }
  }

  if (type === 'expense') {
    return {
      ...baseForm,
      recurring: initialItem.recurring ? 'yes' : 'no',
    }
  }

  if (type === 'income') {
    return {
      ...baseForm,
      recurring: initialItem.recurring ? 'yes' : 'no',
      frequency: normalizeOption(initialItem.frequency, 'monthly'),
    }
  }

  if (type === 'investment') {
    const duplicateExpense = hasExistingLinkedExpense(initialItem)

    return {
      ...baseForm,
      investmentType: initialItem.investmentType || initialItem.category || 'SIP / Mutual Fund',
      frequency: normalizeOption(initialItem.frequency, 'monthly'),
      autoPay: initialItem.autoPay ? 'yes' : 'no',
      addToMoney: getInitialAddToMoneyValue(
        baseForm,
        mode,
        initialItem.status === 'paid',
        duplicateExpense,
      ),
    }
  }

  if (type === 'reminder') {
    return {
      ...baseForm,
      recurring: initialItem.recurring ? 'yes' : 'no',
      frequency: normalizeOption(initialItem.frequency, 'one_time'),
      priority: normalizeOption(initialItem.priority, 'normal'),
    }
  }

  if (type === 'document') {
    const recordType = initialItem.recordType || initialItem.documentType || 'Receipt'
    const duplicateExpense = hasExistingLinkedExpense(initialItem)

    return {
      ...baseForm,
      recordType,
      documentType: recordType,
      amount: initialItem.amount || '',
      documentDate: initialItem.documentDate || '',
      serviceDate: initialItem.serviceDate || '',
      nextServiceInterval: initialItem.nextServiceInterval || 'none',
      nextServiceDate: initialItem.nextServiceDate || '',
      expiryInterval: initialItem.expiryInterval || 'none',
      expiryDate: initialItem.expiryDate || '',
      warrantyInterval: initialItem.warrantyInterval || 'none',
      warrantyTill: initialItem.warrantyTill || '',
      serviceInterval: normalizeOption(initialItem.serviceInterval, 'one_time'),
      addToMoney: getInitialAddToMoneyValue(
        baseForm,
        mode,
        ['paid', 'completed'].includes(initialItem.status),
        duplicateExpense,
      ),
    }
  }

  return baseForm
}

function getInitialAddToMoneyValue(
  baseForm,
  mode,
  statusAllowsExpense,
  duplicateExpense,
) {
  if (mode !== 'edit') {
    return baseForm.addToMoney || 'yes'
  }

  return statusAllowsExpense && !duplicateExpense ? 'yes' : 'no'
}

function getDefaultForm(type) {
  const defaults = {
    ...defaultValuesByType[type],
  }

  if (type === 'bill') {
    return {
      ...defaults,
      dueDate: today(),
    }
  }

  if (type === 'expense') {
    return {
      ...defaults,
      date: today(),
    }
  }

  if (type === 'income') {
    return {
      ...defaults,
      date: today(),
    }
  }

  if (type === 'vendor') {
    return {
      ...defaults,
      paymentDate: today(),
      paymentMonth: today().slice(0, 7),
    }
  }

  return defaults
}

function hasExistingLinkedExpense(item) {
  return item ? hasLinkedExpense(getLifeItems(), item) : false
}

function normalizeOption(value, fallback) {
  return String(value || fallback)
    .toLowerCase()
    .replaceAll(' ', '_')
    .replaceAll('-', '_')
}

function labelize(value) {
  if (value === 'six_monthly') {
    return 'Six-monthly'
  }

  if (value === 'one_time') {
    return 'One-time'
  }

  return String(value)
    .split(/[-_]/)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')
}

export default AddItemForm
