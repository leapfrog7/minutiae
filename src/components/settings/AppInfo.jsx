import SectionCard from '../common/SectionCard'

function AppInfo() {
  return (
    <SectionCard eyebrow="About" title="App info">
      <div className="grid gap-2 text-sm">
        <InfoRow label="App" value="Minutiae" />
        <InfoRow label="Tagline" value="Your household command centre." />
        <InfoRow label="Storage" value="This device/browser only" />
        <InfoRow label="Version" value="0.1.0" />
        <InfoRow
          label="Live app"
          value="https://leapfrog7.github.io/minutiae/"
          isLink
        />
      </div>
    </SectionCard>
  )
}

function InfoRow({ isLink = false, label, value }) {
  return (
    <div className="flex items-start justify-between gap-3 rounded-xl bg-stone-50 px-3 py-2">
      <span className="shrink-0 text-xs font-bold uppercase tracking-[0.1em] text-stone-500">
        {label}
      </span>
      {isLink ? (
        <a
          href={value}
          className="break-all text-right text-sm font-semibold text-teal-700"
          target="_blank"
          rel="noreferrer"
        >
          {value}
        </a>
      ) : (
        <span className="text-right text-sm font-semibold text-stone-900">
          {value}
        </span>
      )}
    </div>
  )
}

export default AppInfo
