import { useEffect, useState } from 'react'
import { getLifeItems, saveLifeItems } from '../../features/lifeItems/lifeItemStorage'
import { cloudClient, cloudConfigured } from '../../features/cloud/cloudClient'
import {
  getCloudSnapshot,
  getSnapshotItems,
  uploadCloudSnapshot,
} from '../../features/cloud/cloudSync'
import ConfirmDialog from '../common/ConfirmDialog'
import SectionCard from '../common/SectionCard'

export default function CloudSync({ onDataChanged }) {
  if (!cloudConfigured) {
    return (
      <SectionCard eyebrow="Optional" title="Cloud sync">
        <p className="text-sm leading-6 text-stone-600">
          Cloud sync is not configured for this build. Your records remain on
          this device and JSON backup continues to work normally.
        </p>
      </SectionCard>
    )
  }

  return <ConfiguredCloudSync onDataChanged={onDataChanged} />
}

function ConfiguredCloudSync({ onDataChanged }) {
  const session = cloudClient.auth.useSession()
  const user = session.data?.user

  if (session.isPending) {
    return <CloudMessage message="Checking cloud account..." />
  }

  if (!user) {
    return <CloudAccountForm />
  }

  return <CloudActions user={user} onDataChanged={onDataChanged} />
}

function CloudAccountForm() {
  const [mode, setMode] = useState('sign-in')
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [state, setState] = useState({ busy: false, error: '' })

  const update = (field, value) => setForm((current) => ({ ...current, [field]: value }))

  async function submit(event) {
    event.preventDefault()
    setState({ busy: true, error: '' })

    try {
      const result = mode === 'sign-up'
        ? await cloudClient.auth.signUp.email(form)
        : await cloudClient.auth.signIn.email({ email: form.email, password: form.password })

      if (result?.error) {
        throw new Error(result.error.message || 'Authentication failed.')
      }

      window.location.reload()
    } catch (error) {
      setState({ busy: false, error: error.message || 'Authentication failed.' })
    }
  }

  return (
    <SectionCard eyebrow="Optional" title="Cloud sync">
      <p className="text-sm leading-6 text-stone-600">
        Sign in to keep a private copy in your Minutiae cloud account. Nothing
        is uploaded automatically.
      </p>
      <form onSubmit={submit} className="mt-3 grid gap-3">
        {mode === 'sign-up' && (
          <Field label="Name">
            <input required value={form.name} onChange={(event) => update('name', event.target.value)} className="h-11 w-full rounded-xl border border-stone-200 bg-white px-3 text-sm" />
          </Field>
        )}
        <Field label="Email">
          <input required type="email" autoComplete="email" value={form.email} onChange={(event) => update('email', event.target.value)} className="h-11 w-full rounded-xl border border-stone-200 bg-white px-3 text-sm" />
        </Field>
        <Field label="Password">
          <input required minLength={8} type="password" autoComplete={mode === 'sign-up' ? 'new-password' : 'current-password'} value={form.password} onChange={(event) => update('password', event.target.value)} className="h-11 w-full rounded-xl border border-stone-200 bg-white px-3 text-sm" />
        </Field>
        {state.error && <p className="rounded-xl bg-rose-50 px-3 py-2 text-sm font-semibold text-rose-700">{state.error}</p>}
        <button type="submit" disabled={state.busy} className="rounded-xl bg-teal-700 px-4 py-3 text-sm font-bold text-white disabled:bg-stone-400">
          {state.busy ? 'Please wait...' : mode === 'sign-up' ? 'Create cloud account' : 'Sign in'}
        </button>
        <button type="button" onClick={() => { setMode((current) => current === 'sign-in' ? 'sign-up' : 'sign-in'); setState({ busy: false, error: '' }) }} className="text-sm font-semibold text-teal-800">
          {mode === 'sign-in' ? 'Create an account' : 'Use an existing account'}
        </button>
      </form>
    </SectionCard>
  )
}

function CloudActions({ user, onDataChanged }) {
  const [snapshot, setSnapshot] = useState(null)
  const [status, setStatus] = useState({ busy: true, error: '', message: '' })
  const [confirmAction, setConfirmAction] = useState('')

  useEffect(() => {
    let active = true

    getCloudSnapshot(user.id)
      .then((result) => {
        if (!active) return
        setSnapshot(result)
        setStatus({ busy: false, error: '', message: '' })
      })
      .catch((error) => {
        if (!active) return
        setStatus({ busy: false, error: error.message || 'Unable to read cloud data.', message: '' })
      })

    return () => {
      active = false
    }
  }, [user.id])

  async function upload() {
    setConfirmAction('')
    setStatus({ busy: true, error: '', message: '' })
    try {
      const saved = await uploadCloudSnapshot({
        userId: user.id,
        items: getLifeItems(),
        expectedRevision: snapshot?.revision || 0,
      })
      setSnapshot(saved)
      setStatus({ busy: false, error: '', message: 'This device was saved to the cloud.' })
    } catch (error) {
      setStatus({ busy: false, error: error.message || 'Cloud save failed.', message: '' })
    }
  }

  function restore() {
    setConfirmAction('')
    try {
      const items = getSnapshotItems(snapshot)
      saveLifeItems(items)
      onDataChanged()
      setStatus({ busy: false, error: '', message: `Restored ${items.length} items to this device.` })
    } catch (error) {
      setStatus({ busy: false, error: error.message || 'Cloud restore failed.', message: '' })
    }
  }

  return (
    <SectionCard eyebrow="Private account" title="Cloud sync">
      <div className="flex flex-wrap items-start justify-between gap-3 rounded-xl bg-stone-50 px-3 py-3">
        <div className="min-w-0">
          <p className="truncate text-sm font-bold text-stone-900">{user.name || user.email}</p>
          <p className="truncate text-xs text-stone-500">{user.email}</p>
        </div>
        <button type="button" onClick={() => cloudClient.auth.signOut()} className="text-xs font-bold text-stone-600">Sign out</button>
      </div>

      <dl className="mt-3 grid grid-cols-2 gap-2">
        <Metric label="Cloud copy" value={snapshot ? `${snapshot.payload?.items?.length || 0} items` : 'Not created'} />
        <Metric label="Last saved" value={snapshot?.updated_at ? formatDateTime(snapshot.updated_at) : '-'} />
      </dl>

      <p className="mt-3 text-sm leading-6 text-stone-600">
        Cloud actions are manual. Saving replaces the cloud copy; restoring
        replaces records on this device. Neither action runs in the background.
      </p>

      {status.error && <p className="mt-3 rounded-xl bg-rose-50 px-3 py-2 text-sm font-semibold text-rose-700">{status.error}</p>}
      {status.message && <p className="mt-3 rounded-xl bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-700">{status.message}</p>}

      <div className="mt-3 grid gap-2 sm:grid-cols-2">
        <button type="button" disabled={status.busy} onClick={() => setConfirmAction('upload')} className="rounded-xl bg-teal-700 px-4 py-3 text-sm font-bold text-white disabled:bg-stone-400">{status.busy ? 'Checking...' : 'Save this device to cloud'}</button>
        <button type="button" disabled={status.busy || !snapshot} onClick={() => setConfirmAction('restore')} className="rounded-xl bg-stone-100 px-4 py-3 text-sm font-bold text-stone-800 disabled:text-stone-400">Restore cloud to this device</button>
      </div>

      {confirmAction === 'upload' && (
        <ConfirmDialog title="Replace the cloud copy?" message={`The cloud copy will be replaced with ${getLifeItems().length} items from this device.`} confirmLabel="Save to cloud" tone="primary" onCancel={() => setConfirmAction('')} onConfirm={upload} />
      )}
      {confirmAction === 'restore' && (
        <ConfirmDialog title="Replace records on this device?" message={`This device will be replaced with ${snapshot.payload?.items?.length || 0} items from the cloud.`} confirmLabel="Restore" tone="primary" onCancel={() => setConfirmAction('')} onConfirm={restore} />
      )}
    </SectionCard>
  )
}

function CloudMessage({ message }) {
  return <SectionCard eyebrow="Optional" title="Cloud sync"><p className="text-sm text-stone-600">{message}</p></SectionCard>
}

function Field({ label, children }) {
  return <label className="block"><span className="mb-1 block text-xs font-bold uppercase tracking-[0.1em] text-stone-500">{label}</span>{children}</label>
}

function Metric({ label, value }) {
  return <div className="rounded-xl bg-stone-50 px-3 py-2"><dt className="text-[11px] font-bold uppercase tracking-[0.1em] text-stone-500">{label}</dt><dd className="mt-1 text-sm font-bold text-stone-950">{value}</dd></div>
}

function formatDateTime(value) {
  return new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value))
}
