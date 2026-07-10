import { useEffect, useMemo, useState } from 'react'
import {
  billCategories,
  expenseCategories,
  getStatusMeta,
  incomeCategories,
  indiaFirstCategories,
  paymentModes,
} from '../../data/lifeAdminConstants'
import { getItemTypeMeta } from '../../data/itemTypes'
import {
  calculateVendorSettlement,
  hasLinkedExpense,
} from '../../features/lifeItems/lifeItemHelpers'
import { getLifeItems } from '../../features/lifeItems/lifeItemStorage'

const today = () => new Date().toISOString().slice(0, 10)

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
    notes: '',
  },
  bill: {
    title: '',
    amount: '',
    dueDate: today(),
    frequency: 'monthly',
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
  document: {
    title: '',
    documentType: '',
    relatedTo: '',
    documentDate: today(),
    expiryDate: '',
    category: 'Document',
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
  document: ['pending', 'closed'],
}

const frequencyOptions = [
  { value: 'monthly', label: 'Monthly' },
  { value: 'quarterly', label: 'Quarterly' },
  { value: 'six_monthly', label: 'Six-monthly' },
  { value: 'yearly', label: 'Yearly' },
  { value: 'one_time', label: 'One-time' },
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

const toNumber = (value) => (value === '' ? 0 : Number(value))

function Field({ children, error, label }) {
  return (
    <label className="block">
      <span className="text-xs font-semibold text-stone-700">{label}</span>
      <div className="mt-1">{children}</div>
      {error && <p className="mt-1 text-xs font-semibold text-rose-600">{error}</p>}
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
    () => getInitialForm(selectedType, initialItem),
    [initialItem, selectedType],
  )
  const [form, setForm] = useState(initialForm)
  const [submitted, setSubmitted] = useState(false)

  const errors = useMemo(() => validateForm(selectedType, form), [form, selectedType])
  const statusOptions = statusOptionsByType[selectedType] ?? ['pending']

  useEffect(() => {
    setForm(initialForm)
    setSubmitted(false)
  }, [initialForm])

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

      return nextForm
    })
  }

  function handleSubmit(event) {
    event.preventDefault()
    setSubmitted(true)

    if (Object.keys(errors).length > 0) {
      return
    }

    onSave(buildLifeItem(selectedType, form), getSaveOptions(selectedType, form))
    setForm(initialForm)
    setSubmitted(false)
  }

  const showError = (field) => (submitted ? errors[field] : '')

  return (
    <form onSubmit={handleSubmit} className="rounded-2xl border border-stone-200 bg-white p-3 shadow-sm shadow-stone-200/60">
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

      <div className="grid gap-3">
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
          </>
        )}

        {selectedType === 'bill' && (
          <>
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
            <CommonMoneyFields
              categoryOptions={billCategories}
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
              categoryOptions={expenseCategories}
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

        {selectedType === 'document' && (
          <>
            <Field label="Title" error={showError('title')}>
              <TextInput value={form.title} onChange={(event) => updateField('title', event.target.value)} placeholder="House tax receipt" />
            </Field>
            <Field label="Document type" error={showError('documentType')}>
              <TextInput value={form.documentType} onChange={(event) => updateField('documentType', event.target.value)} placeholder="Receipt, warranty, policy" />
            </Field>
            <Field label="Related to">
              <TextInput value={form.relatedTo} onChange={(event) => updateField('relatedTo', event.target.value)} />
            </Field>
            <TwoFields>
              <Field label="Doc date" error={showError('documentDateGroup')}>
                <TextInput type="date" value={form.documentDate} onChange={(event) => updateField('documentDate', event.target.value)} />
              </Field>
              <Field label="Expiry" error={showError('documentDateGroup')}>
                <TextInput type="date" value={form.expiryDate} onChange={(event) => updateField('expiryDate', event.target.value)} />
              </Field>
            </TwoFields>
            <TwoFields>
              <Field label="Category">
                <CategorySelect value={form.category} onChange={(value) => updateField('category', value)} />
              </Field>
              <Field label="Status">
                <StatusSelect value={form.status} options={statusOptions} onChange={(value) => updateField('status', value)} />
              </Field>
            </TwoFields>
          </>
        )}

        <Field label="Notes">
          <TextInput as="textarea" rows="3" value={form.notes} onChange={(event) => updateField('notes', event.target.value)} placeholder="Anything useful to remember" />
        </Field>

        <button
          type="submit"
          className="mt-1 rounded-2xl bg-teal-700 px-4 py-3 text-sm font-bold text-white shadow-sm shadow-teal-900/20 disabled:bg-stone-300"
        >
          {mode === 'edit' ? 'Save changes' : 'Save item'}
        </button>
      </div>
    </form>
  )
}

function TwoFields({ children }) {
  return <div className="grid grid-cols-2 gap-2">{children}</div>
}

function FormGroup({ children, title }) {
  return (
    <section className="grid gap-3 rounded-xl bg-stone-50 px-3 py-3">
      <h3 className="text-xs font-bold uppercase tracking-[0.1em] text-stone-500">
        {title}
      </h3>
      {children}
    </section>
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

function CategorySelect({ onChange, options = indiaFirstCategories, value }) {
  const renderedOptions =
    value && !options.includes(value) ? [value, ...options] : options

  return (
    <SelectInput value={value} onChange={(event) => onChange(event.target.value)}>
      {renderedOptions.map((category) => (
        <option key={category} value={category}>
          {category}
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
  duplicateExpense,
  itemType,
  onChange,
  status,
  value,
}) {
  if (status !== 'paid') {
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

  if (type === 'document') {
    if (!form.title.trim()) errors.title = 'Title is required.'
    if (!form.documentType.trim()) errors.documentType = 'Document type is required.'
    if (!form.documentDate && !form.expiryDate) {
      errors.documentDateGroup = 'Add document date or expiry.'
    }
  }

  return errors
}

function getSaveOptions(type, form) {
  return {
    recordExpense:
      ['bill', 'vendor'].includes(type) &&
      form.status === 'paid' &&
      form.addToMoney !== 'no',
  }
}

function buildLifeItem(type, form) {
  if (type === 'subscription') {
    return {
      ...form,
      type,
      amount: toNumber(form.amount),
      autoRenewal: form.autoRenewal === 'yes',
      billingCycle: form.billingCycle,
      dueDate: form.renewalDate,
    }
  }

  if (type === 'bill') {
    const { addToMoney, ...itemForm } = form

    return {
      ...itemForm,
      type,
      amount: toNumber(form.amount),
      frequency: form.frequency,
    }
  }

  if (type === 'insurance') {
    return {
      ...form,
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
    const balancePayable =
      form.balancePayable === '' ? settlement.balancePayable : toNumber(form.balancePayable)

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

  return {
    ...form,
    type,
    amount: 0,
    dueDate: form.expiryDate || '',
  }
}

function getInitialForm(type, initialItem) {
  if (!initialItem) {
    return getDefaultForm(type)
  }

  const baseForm = {
    ...defaultValuesByType[type],
    ...initialItem,
    amount: initialItem.amount || '',
  }

  if (type === 'subscription') {
    return {
      ...baseForm,
      autoRenewal: initialItem.autoRenewal ? 'yes' : 'no',
      billingCycle: normalizeOption(initialItem.billingCycle, 'monthly'),
    }
  }

  if (type === 'bill') {
    const duplicateExpense = hasExistingLinkedExpense(initialItem)

    return {
      ...baseForm,
      addToMoney:
        initialItem.status === 'paid' && !duplicateExpense ? 'yes' : 'no',
      frequency: normalizeOption(initialItem.frequency, 'monthly'),
    }
  }

  if (type === 'insurance') {
    return {
      ...baseForm,
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
      addToMoney:
        initialItem.status === 'paid' && !duplicateExpense ? 'yes' : 'no',
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

  return baseForm
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
