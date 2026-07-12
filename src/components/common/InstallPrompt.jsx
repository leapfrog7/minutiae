import { useEffect, useState } from 'react'
import SectionCard from './SectionCard'

function isStandalone() {
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    window.navigator.standalone === true
  )
}

function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null)
  const [isInstalled, setIsInstalled] = useState(isStandalone)
  const [message, setMessage] = useState('')

  useEffect(() => {
    function handleBeforeInstallPrompt(event) {
      event.preventDefault()

      if (!isStandalone()) {
        setDeferredPrompt(event)
      }
    }

    function handleAppInstalled() {
      setDeferredPrompt(null)
      setIsInstalled(true)
      setMessage('Minutiae is installed.')
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    window.addEventListener('appinstalled', handleAppInstalled)

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
      window.removeEventListener('appinstalled', handleAppInstalled)
    }
  }, [])

  async function handleInstall() {
    if (!deferredPrompt) {
      return
    }

    deferredPrompt.prompt()
    const result = await deferredPrompt.userChoice

    setDeferredPrompt(null)
    setMessage(
      result.outcome === 'accepted'
        ? 'Install started.'
        : 'Install dismissed for now.',
    )
  }

  return (
    <SectionCard title="Install app">
      <div className="grid gap-2">
        <p className="rounded-xl bg-stone-50 px-3 py-2 text-sm font-semibold text-stone-700">
          Running as: {isInstalled ? 'Installed app' : 'Browser tab'}
        </p>
        {deferredPrompt && !isInstalled && (
          <button
            type="button"
            onClick={handleInstall}
            className="rounded-2xl bg-teal-700 px-4 py-3 text-sm font-bold text-white"
          >
            Install Minutiae
          </button>
        )}
        {message && (
          <p className="rounded-xl bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-700">
            {message}
          </p>
        )}
        <p className="text-sm leading-6 text-stone-600">
          Installing Minutiae keeps it handy on your phone. Your data still
          remains stored only in this browser/device unless you export a backup.
        </p>
      </div>
    </SectionCard>
  )
}

export default InstallPrompt
