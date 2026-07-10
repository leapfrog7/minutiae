import { useMemo, useState } from 'react'
import {
  paymentModes,
  transactionCategories,
  transactionTypes,
} from '../data/categories'

const initialForm = {
  type: 'expense',
  amount: '',
  category: '',
  date: new Date().toISOString().slice(0, 10),
  paymentMode: '',
  note: '',
}

function AddTransaction({ onAddTransaction }) {
  const [form, setForm] = useState(initialForm)
  const [errors, setErrors] = useState({})
  const [successMessage, setSuccessMessage] = useState('')

  const categoryOptions = useMemo(() => {
    return transactionCategories[form.type] ?? []
  }, [form.type])

  function updateField(name, value) {
    setForm((currentForm) => {
      const nextForm = { ...currentForm, [name]: value }

      if (name === 'type') {
        nextForm.category = ''
      }

      return nextForm
    })
    setErrors((currentErrors) => ({ ...currentErrors, [name]: '' }))
    setSuccessMessage('')
  }

  function validateForm() {
    const nextErrors = {}
    const amount = Number(form.amount)

    if (!form.type) {
      nextErrors.type = 'Choose income or expense.'
    }

    if (!form.amount || Number.isNaN(amount) || amount <= 0) {
      nextErrors.amount = 'Enter a positive amount.'
    }

    if (!form.category) {
      nextErrors.category = 'Choose a category.'
    }

    if (!form.date) {
      nextErrors.date = 'Choose a date.'
    }

    if (!form.paymentMode) {
      nextErrors.paymentMode = 'Choose a payment mode.'
    }

    setErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  function handleSubmit(event) {
    event.preventDefault()

    if (!validateForm()) {
      return
    }

    onAddTransaction({
      ...form,
      amount: Number(form.amount),
      note: form.note.trim(),
    })

    setForm(initialForm)
    setErrors({})
    setSuccessMessage('Transaction added successfully.')
  }

  return (
    <form className="space-y-5" onSubmit={handleSubmit}>
      {successMessage ? (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm font-semibold text-emerald-800">
          {successMessage}
        </div>
      ) : null}

      <fieldset>
        <legend className="mb-2 text-sm font-semibold text-slate-700">
          Type
        </legend>
        <div className="grid grid-cols-2 gap-2">
          {transactionTypes.map((type) => {
            const isSelected = form.type === type.value

            return (
              <button
                key={type.value}
                type="button"
                onClick={() => updateField('type', type.value)}
                className={`min-h-12 rounded-md border px-4 text-sm font-bold transition ${
                  isSelected
                    ? 'border-emerald-600 bg-emerald-50 text-emerald-800'
                    : 'border-slate-200 bg-white text-slate-600'
                }`}
              >
                {type.label}
              </button>
            )
          })}
        </div>
        {errors.type ? (
          <p className="mt-2 text-sm font-semibold text-rose-600">
            {errors.type}
          </p>
        ) : null}
      </fieldset>

      <label className="block">
        <span className="text-sm font-semibold text-slate-700">Amount</span>
        <input
          type="number"
          min="0"
          step="0.01"
          inputMode="decimal"
          value={form.amount}
          onChange={(event) => updateField('amount', event.target.value)}
          className="mt-2 h-12 w-full rounded-md border border-slate-300 bg-white px-4 text-base font-semibold text-slate-950 outline-none transition focus:border-emerald-600 focus:ring-4 focus:ring-emerald-100"
          placeholder="0.00"
        />
        {errors.amount ? (
          <span className="mt-2 block text-sm font-semibold text-rose-600">
            {errors.amount}
          </span>
        ) : null}
      </label>

      <label className="block">
        <span className="text-sm font-semibold text-slate-700">Category</span>
        <select
          value={form.category}
          onChange={(event) => updateField('category', event.target.value)}
          className="mt-2 h-12 w-full rounded-md border border-slate-300 bg-white px-4 text-base font-semibold text-slate-950 outline-none transition focus:border-emerald-600 focus:ring-4 focus:ring-emerald-100"
        >
          <option value="">Select category</option>
          {categoryOptions.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>
        {errors.category ? (
          <span className="mt-2 block text-sm font-semibold text-rose-600">
            {errors.category}
          </span>
        ) : null}
      </label>

      <label className="block">
        <span className="text-sm font-semibold text-slate-700">Date</span>
        <input
          type="date"
          value={form.date}
          onChange={(event) => updateField('date', event.target.value)}
          className="mt-2 h-12 w-full rounded-md border border-slate-300 bg-white px-4 text-base font-semibold text-slate-950 outline-none transition focus:border-emerald-600 focus:ring-4 focus:ring-emerald-100"
        />
        {errors.date ? (
          <span className="mt-2 block text-sm font-semibold text-rose-600">
            {errors.date}
          </span>
        ) : null}
      </label>

      <label className="block">
        <span className="text-sm font-semibold text-slate-700">
          Payment mode
        </span>
        <select
          value={form.paymentMode}
          onChange={(event) => updateField('paymentMode', event.target.value)}
          className="mt-2 h-12 w-full rounded-md border border-slate-300 bg-white px-4 text-base font-semibold text-slate-950 outline-none transition focus:border-emerald-600 focus:ring-4 focus:ring-emerald-100"
        >
          <option value="">Select payment mode</option>
          {paymentModes.map((paymentMode) => (
            <option key={paymentMode} value={paymentMode}>
              {paymentMode}
            </option>
          ))}
        </select>
        {errors.paymentMode ? (
          <span className="mt-2 block text-sm font-semibold text-rose-600">
            {errors.paymentMode}
          </span>
        ) : null}
      </label>

      <label className="block">
        <span className="text-sm font-semibold text-slate-700">Note</span>
        <textarea
          value={form.note}
          onChange={(event) => updateField('note', event.target.value)}
          className="mt-2 min-h-24 w-full rounded-md border border-slate-300 bg-white px-4 py-3 text-base text-slate-950 outline-none transition focus:border-emerald-600 focus:ring-4 focus:ring-emerald-100"
          placeholder="Optional note"
        />
      </label>

      <button
        type="submit"
        className="h-12 w-full rounded-md bg-slate-950 px-4 text-base font-bold text-white transition hover:bg-slate-800"
      >
        Add Transaction
      </button>
    </form>
  )
}

export default AddTransaction
