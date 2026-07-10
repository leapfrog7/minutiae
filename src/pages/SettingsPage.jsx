import { useEffect, useState } from 'react'
import AppInfo from '../components/settings/AppInfo'
import BackupRestore from '../components/settings/BackupRestore'
import DataDangerZone from '../components/settings/DataDangerZone'
import InstallPrompt from '../components/common/InstallPrompt'
import SectionCard from '../components/common/SectionCard'
import {
  formatDisplayDate,
  getLifeItemStats,
} from '../features/lifeItems/lifeItemHelpers'
import {
  getLifeItems,
  seedLifeItemsIfEmpty,
} from '../features/lifeItems/lifeItemStorage'

const statLabels = [
  ['total', 'Total items'],
  ['subscription', 'Subscriptions'],
  ['bill', 'Bills'],
  ['vendor', 'Vendors'],
  ['complaint', 'Complaints'],
  ['expense', 'Expenses'],
  ['document', 'Documents'],
  ['actionable', 'Open/actionable'],
]

function SettingsPage({ onNavigate }) {
  const [items, setItems] = useState([])

  useEffect(() => {
    setItems(seedLifeItemsIfEmpty())
  }, [])

  function refreshItems() {
    setItems(getLifeItems())
  }

  const stats = getLifeItemStats(items)

  return (
    <>
      <header className="pb-4 pt-2">
        <button
          type="button"
          onClick={() => onNavigate('home')}
          className="mb-3 rounded-full bg-white px-3 py-2 text-xs font-bold text-stone-700 ring-1 ring-stone-200"
        >
          ← Back
        </button>
        <p className="text-sm font-semibold text-teal-700">
          Local data settings
        </p>
        <h1 className="mt-1 text-2xl font-bold text-stone-950">Settings</h1>
      </header>

      <div className="space-y-3">
        <AppInfo />
        <InstallPrompt />

        <SectionCard title="Data summary">
          <div className="grid grid-cols-2 gap-2">
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
            {stats.lastUpdated ? formatDisplayDate(stats.lastUpdated.slice(0, 10)) : 'No saved items'}
          </p>
        </SectionCard>

        <BackupRestore onDataChanged={refreshItems} />
        <DataDangerZone onDataChanged={refreshItems} />

        <SectionCard title="Local storage notice">
          <p className="text-sm leading-6 text-stone-600">
            Minutiae currently stores data only in this browser. If you clear
            browser data or switch devices, your data will not follow you unless
            you export and import a backup.
          </p>
        </SectionCard>
      </div>
    </>
  )
}

export default SettingsPage
