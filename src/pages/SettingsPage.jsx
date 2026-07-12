import { useEffect, useState } from 'react'
import AppInfo from '../components/settings/AppInfo'
import BackupRestore from '../components/settings/BackupRestore'
import DataDangerZone from '../components/settings/DataDangerZone'
import InstallPrompt from '../components/common/InstallPrompt'
import SectionCard from '../components/common/SectionCard'
import {
  downloadBackupReminderCalendar,
  exportLifeItemsBackup,
  getBackupReminderState,
} from '../features/backup/backupReminder'
import {
  formatDisplayDate,
  getLifeItemStats,
} from '../features/lifeItems/lifeItemHelpers'
import {
  getLifeItems,
} from '../features/lifeItems/lifeItemStorage'

const statLabels = [
  ['total', 'Total items'],
  ['subscription', 'Subscriptions'],
  ['bill', 'Bills'],
  ['vendor', 'Vendors'],
  ['insurance', 'Insurance'],
  ['complaint', 'Complaints'],
  ['expense', 'Expenses'],
  ['income', 'Income'],
  ['document', 'Documents'],
  ['actionable', 'Open/actionable'],
]

function SettingsPage({ onNavigate }) {
  const [items, setItems] = useState([])
  const [backupMessage, setBackupMessage] = useState('')
  const [backupRefreshKey, setBackupRefreshKey] = useState(0)

  useEffect(() => {
    setItems(getLifeItems())
  }, [])

  function refreshItems() {
    setItems(getLifeItems())
  }

  function refreshBackupState(message = '') {
    setBackupRefreshKey((current) => current + 1)
    setBackupMessage(message)
  }

  const stats = getLifeItemStats(items)
  const backupState = getBackupReminderState(items.length)

  return (
    <>
      <header className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-teal-800 via-teal-700 to-emerald-700 px-4 py-5 text-white shadow-lg shadow-teal-900/15 md:px-6 md:py-6">
        <div className="absolute -right-10 -top-12 h-36 w-36 rounded-full bg-white/10" />
        <div className="absolute -bottom-16 right-16 h-28 w-28 rounded-full bg-emerald-300/10" />
        <button
          type="button"
          onClick={() => onNavigate('home')}
          className="relative mb-4 rounded-full bg-white/15 px-3 py-2 text-xs font-bold text-white ring-1 ring-white/25 backdrop-blur transition hover:bg-white/20"
        >
          Back to Home
        </button>
        <p className="relative text-xs font-bold uppercase tracking-[0.14em] text-teal-100">
          Your app and data
        </p>
        <h1 className="relative mt-1 text-2xl font-bold md:text-3xl">Settings</h1>
        <p className="relative mt-2 max-w-xl text-sm leading-6 text-teal-50/90">
          Keep your local records safe, manage this device, and review what
          Minutiae stores.
        </p>
      </header>

      <div className="mt-4 grid gap-4">
        <BackupHealth
          key={backupRefreshKey}
          backupMessage={backupMessage}
          state={backupState}
          onBackupExported={() =>
            refreshBackupState('Backup exported. Next reminder in 15 days.')
          }
        />

        <div className="grid gap-4 lg:grid-cols-2 lg:items-start">
          <SectionCard eyebrow="On this device" title="Data summary">
            {items.length === 0 ? (
              <p className="rounded-xl bg-stone-50 px-3 py-3 text-sm font-semibold text-stone-600">
                No local items stored yet.
              </p>
            ) : (
              <>
                <div className="grid grid-cols-2 gap-2 md:grid-cols-3 lg:grid-cols-2 xl:grid-cols-3">
                  {statLabels.map(([key, label]) => (
                    <div key={key} className="rounded-xl bg-stone-50 px-3 py-2">
                      <p className="text-[11px] font-bold uppercase tracking-[0.1em] text-stone-500">
                        {label}
                      </p>
                      <p className="mt-1 text-lg font-bold text-stone-950">
                        {stats[key] || 0}
                      </p>
                    </div>
                  ))}
                </div>
                <p className="mt-2 rounded-xl bg-stone-50 px-3 py-2 text-xs font-semibold text-stone-600">
                  Last updated:{' '}
                  {stats.lastUpdated
                    ? formatDisplayDate(stats.lastUpdated.slice(0, 10))
                    : 'No saved items'}
                </p>
              </>
            )}
          </SectionCard>

          <BackupRestore onDataChanged={refreshItems} />
        </div>

        <div className="grid gap-4 lg:grid-cols-2 lg:items-start">
          <AppInfo />
          <InstallPrompt />
        </div>

        <SectionCard
          className="border-amber-200 bg-amber-50/60"
          eyebrow="Good to know"
          title="Local storage notice"
        >
          <p className="text-sm leading-6 text-stone-700">
            Minutiae currently stores data only in this browser. If you clear
            browser data or switch devices, your data will not follow you unless
            you export and import a backup.
          </p>
        </SectionCard>

        <DataDangerZone onDataChanged={refreshItems} />
      </div>
    </>
  )
}

function BackupHealth({ backupMessage, onBackupExported, state }) {
  function handleExport() {
    exportLifeItemsBackup()
    onBackupExported()
  }

  return (
    <SectionCard
      className="border-teal-200 bg-gradient-to-br from-white to-teal-50/70"
      eyebrow="Data safety"
      title="Backup health"
    >
      {state.hasItems ? (
        <div className="grid gap-3">
          <div className="grid grid-cols-2 gap-2">
            <BackupHealthMetric
              label="Last backup"
              value={state.lastBackupAt ? formatDate(state.lastBackupAt) : 'Never'}
            />
            <BackupHealthMetric
              label="Next reminder"
              value={state.due ? 'Due now' : formatDate(state.nextBackupDueAt)}
            />
            <BackupHealthMetric
              label="Backup frequency"
              value={`Every ${state.frequencyDays} days`}
            />
            <BackupHealthMetric
              label="Data storage"
              value="This device/browser only"
            />
          </div>
          <p className="rounded-xl border border-teal-100 bg-white/80 px-3 py-3 text-sm leading-6 text-stone-600">
            Minutiae stores data on this device. Export a backup periodically to
            avoid losing records.
          </p>
          <div className="grid gap-2 sm:grid-cols-2">
            <button
              type="button"
              onClick={handleExport}
              className="rounded-2xl bg-teal-700 px-4 py-3 text-sm font-bold text-white shadow-sm shadow-teal-900/20 transition hover:bg-teal-800"
            >
              Export backup
            </button>
            <button
              type="button"
              onClick={downloadBackupReminderCalendar}
              className="rounded-2xl bg-stone-100 px-4 py-3 text-sm font-bold text-stone-800"
            >
              Create calendar reminder
            </button>
          </div>
          {backupMessage && (
            <p className="rounded-xl bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-700">
              {backupMessage}
            </p>
          )}
        </div>
      ) : (
        <p className="rounded-xl bg-stone-50 px-3 py-3 text-sm font-semibold text-stone-600">
          No records yet. Backup reminders will start after you add data.
        </p>
      )}
    </SectionCard>
  )
}

function BackupHealthMetric({ label, value }) {
  return (
    <div className="rounded-xl bg-stone-50 px-3 py-2">
      <p className="text-[11px] font-bold uppercase tracking-[0.1em] text-stone-500">
        {label}
      </p>
      <p className="mt-1 text-sm font-bold text-stone-950">{value || '-'}</p>
    </div>
  )
}

function formatDate(dateISOString) {
  return dateISOString ? formatDisplayDate(dateISOString.slice(0, 10)) : ''
}

export default SettingsPage
