import SettingRow from '../components/settings/SettingRow'

function Settings() {
  return (
    <section className="rounded-lg border border-slate-200 bg-white px-4">
      <SettingRow label="Currency" value="USD" />
      <SettingRow label="Storage" value="localStorage" />
      <SettingRow label="Theme" value="System default" />
    </section>
  )
}

export default Settings
