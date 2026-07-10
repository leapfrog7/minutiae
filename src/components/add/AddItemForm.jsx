import { useEffect, useMemo, useState } from 'react'
import { getStatusMeta, indiaFirstCategories, paymentModes } from '../../data/lifeAdminConstants'
import { getItemTypeMeta } from '../../data/itemTypes'

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
    dueDate: '',
    frequency: 'monthly',
    status: 'unpaid',
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
    serviceType: '',
    monthlyAmount: '',
    contactNumber: '',
    upiId: '',
    paymentDate: '',
    status: 'unpaid',
    advanceGiven: '',
    balancePayable: '',
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
  expense: ['paid', 'pending'],
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
    setForm((current) => ({ ...current, [field]: value }))
  }

  function handleSubmit(event) {
    event.preventDefault()
    setSubmitted(true)

    if (Object.keys(errors).length > 0) {
      return
    }

    onSave(buildLifeItem(selectedType, form))
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
            <CommonMoneyFields form={form} updateField={updateField} statusOptions={statusOptions} />
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
            <Field label="Vendor" error={showError('vendorName')}>
              <TextInput value={form.vendorName} onChange={(event) => updateField('vendorName', event.target.value)} placeholder="Maid, milkman, ironing person" />
            </Field>
            <TwoFields>
              <Field label="Service" error={showError('serviceType')}>
                <TextInput value={form.serviceType} onChange={(event) => updateField('serviceType', event.target.value)} placeholder="House help" />
              </Field>
              <Field label="Monthly amount" error={showError('monthlyAmount')}>
                <TextInput type="number" min="0" inputMode="decimal" value={form.monthlyAmount} onChange={(event) => updateField('monthlyAmount', event.target.value)} />
              </Field>
            </TwoFields>
            <TwoFields>
              <Field label="Payment date" error={showError('paymentDate')}>
                <TextInput type="date" value={form.paymentDate} onChange={(event) => updateField('paymentDate', event.target.value)} />
              </Field>
              <Field label="Phone">
                <TextInput type="tel" value={form.contactNumber} onChange={(event) => updateField('contactNumber', event.target.value)} />
              </Field>
            </TwoFields>
            <TwoFields>
              <Field label="Advance">
                <TextInput type="number" min="0" inputMode="decimal" value={form.advanceGiven} onChange={(event) => updateField('advanceGiven', event.target.value)} />
              </Field>
              <Field label="Balance">
                <TextInput type="number" min="0" inputMode="decimal" value={form.balancePayable} onChange={(event) => updateField('balancePayable', event.target.value)} />
              </Field>
            </TwoFields>
            <Field label="UPI ID">
              <TextInput value={form.upiId} onChange={(event) => updateField('upiId', event.target.value)} placeholder="name@upi" />
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
            <CommonMoneyFields form={form} updateField={updateField} statusOptions={statusOptions} />
            <Field label="Recurring">
              <SelectInput value={form.recurring} onChange={(event) => updateField('recurring', event.target.value)}>
                <option value="no">No</option>
                <option value="yes">Yes</option>
              </SelectInput>
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

function CommonMoneyFields({ form, statusOptions, updateField }) {
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
        <CategorySelect value={form.category} onChange={(value) => updateField('category', value)} />
      </Field>
    </>
  )
}

function CategorySelect({ onChange, value }) {
  return (
    <SelectInput value={value} onChange={(event) => onChange(event.target.value)}>
      {indiaFirstCategories.map((category) => (
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
    positiveAmount('monthlyAmount', 'Monthly amount')
    if (!form.paymentDate) errors.paymentDate = 'Payment date is required.'
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
    return {
      ...form,
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
    return {
      ...form,
      type,
      title: form.vendorName,
      amount: toNumber(form.monthlyAmount),
      monthlyAmount: toNumber(form.monthlyAmount),
      dueDate: form.paymentDate,
      advanceGiven: toNumber(form.advanceGiven),
      balancePayable: toNumber(form.balancePayable),
      category: form.serviceType,
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

  return {
    ...form,
    type,
    amount: 0,
    dueDate: form.expiryDate || '',
  }
}

function getInitialForm(type, initialItem) {
  if (!initialItem) {
    return defaultValuesByType[type]
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
    return {
      ...baseForm,
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
    return {
      ...baseForm,
      monthlyAmount: initialItem.monthlyAmount || initialItem.amount || '',
      advanceGiven: initialItem.advanceGiven || '',
      balancePayable: initialItem.balancePayable || '',
    }
  }

  if (type === 'expense') {
    return {
      ...baseForm,
      recurring: initialItem.recurring ? 'yes' : 'no',
    }
  }

  return baseForm
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
