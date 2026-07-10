function SettingRow({ label, value }) {
  return (
    <div className="flex items-center justify-between border-b border-slate-200 py-4 last:border-b-0">
      <p className="font-semibold text-slate-950">{label}</p>
      <p className="text-sm text-slate-500">{value}</p>
    </div>
  )
}

export default SettingRow
