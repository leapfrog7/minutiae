import { useEffect, useState } from 'react'

const installDismissedKey = 'minutiae-install-prompt-dismissed'

function isStandalone() {
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    window.navigator.standalone === true
  )
}

function getMobilePlatform() {
  const userAgent = window.navigator.userAgent || ''
  const isIOS =
    /iPad|iPhone|iPod/i.test(userAgent) ||
    (window.navigator.platform === 'MacIntel' &&
      window.navigator.maxTouchPoints > 1)

  if (isIOS) return 'ios'
  if (/Android/i.test(userAgent)) return 'android'
  return ''
}

function FloatingInstallPrompt() {
  const [installEvent, setInstallEvent] = useState(null)
  const [instructionsOpen, setInstructionsOpen] = useState(false)
  const [platform] = useState(getMobilePlatform)
  const [visible, setVisible] = useState(
    () =>
      !isStandalone() &&
      localStorage.getItem(installDismissedKey) !== 'yes',
  )

  useEffect(() => {
    function handleBeforeInstallPrompt(event) {
      event.preventDefault()
      setInstallEvent(event)
    }

    function handleInstalled() {
      localStorage.setItem(installDismissedKey, 'yes')
      setVisible(false)
      setInstructionsOpen(false)
      setInstallEvent(null)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    window.addEventListener('appinstalled', handleInstalled)

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
      window.removeEventListener('appinstalled', handleInstalled)
    }
  }, [])

  function dismiss() {
    localStorage.setItem(installDismissedKey, 'yes')
    setVisible(false)
    setInstructionsOpen(false)
  }

  async function handleInstall() {
    if (installEvent) {
      installEvent.prompt()
      const choice = await installEvent.userChoice

      setInstallEvent(null)
      if (choice.outcome === 'dismissed') {
        dismiss()
      } else {
        setVisible(false)
      }
      return
    }

    setInstructionsOpen(true)
  }

  if (!visible || !platform) {
    return null
  }

  return (
    <>
      <div className="fixed bottom-24 right-3 z-20 flex max-w-[calc(100vw-1.5rem)] items-center gap-1 rounded-full border border-teal-600/20 bg-teal-700 p-1.5 pl-3 text-white shadow-xl shadow-stone-950/20 lg:bottom-6 lg:right-6">
        <button
          type="button"
          onClick={handleInstall}
          className="flex items-center gap-2 px-1 py-1.5 text-sm font-bold"
        >
          <span aria-hidden="true">&#8595;</span>
          Install app
        </button>
        <button
          type="button"
          onClick={dismiss}
          className="flex h-8 w-8 items-center justify-center rounded-full bg-white/15 text-base font-bold hover:bg-white/25"
          aria-label="Dismiss install app suggestion"
        >
          &times;
        </button>
      </div>

      {instructionsOpen && (
        <div className="fixed inset-0 z-50 flex items-end bg-stone-950/40 p-3 backdrop-blur-[2px] sm:items-center sm:justify-center">
          <section
            className="w-full max-w-sm rounded-3xl bg-white p-4 shadow-2xl"
            role="dialog"
            aria-modal="true"
            aria-labelledby="install-help-title"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.12em] text-teal-700">
                  Install Minutiae
                </p>
                <h2 id="install-help-title" className="mt-1 text-lg font-bold text-stone-950">
                  Add it to your Home Screen
                </h2>
              </div>
              <button
                type="button"
                onClick={dismiss}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-stone-100 text-xl text-stone-600"
                aria-label="Dismiss install instructions"
              >
                &times;
              </button>
            </div>

            {platform === 'ios' ? (
              <ol className="mt-4 grid gap-3 text-sm leading-6 text-stone-700">
                <InstallStep number="1">Open this page in Safari.</InstallStep>
                <InstallStep number="2">Tap the Share button in the Safari toolbar.</InstallStep>
                <InstallStep number="3">Choose Add to Home Screen, then tap Add.</InstallStep>
              </ol>
            ) : (
              <ol className="mt-4 grid gap-3 text-sm leading-6 text-stone-700">
                <InstallStep number="1">Open the Chrome menu (three dots).</InstallStep>
                <InstallStep number="2">Tap Install app or Add to Home screen.</InstallStep>
                <InstallStep number="3">Confirm Install.</InstallStep>
              </ol>
            )}

            <button
              type="button"
              onClick={dismiss}
              className="mt-4 w-full rounded-2xl bg-stone-100 px-4 py-3 text-sm font-bold text-stone-700"
            >
              Not now
            </button>
          </section>
        </div>
      )}
    </>
  )
}

function InstallStep({ children, number }) {
  return (
    <li className="flex gap-3 rounded-xl bg-stone-50 px-3 py-2.5">
      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-teal-100 text-xs font-bold text-teal-800">
        {number}
      </span>
      <span>{children}</span>
    </li>
  )
}

export default FloatingInstallPrompt
