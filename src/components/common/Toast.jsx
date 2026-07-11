import { useEffect, useState } from 'react'

function Toast({ message, onDismiss, tone = 'success' }) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    if (!message) {
      return undefined
    }

    const showFrame = window.requestAnimationFrame(() => {
      setIsVisible(true)
    })
    const hideTimeoutId = window.setTimeout(() => {
      setIsVisible(false)
    }, 2200)
    const dismissTimeoutId = window.setTimeout(onDismiss, 2600)

    return () => {
      window.cancelAnimationFrame(showFrame)
      window.clearTimeout(hideTimeoutId)
      window.clearTimeout(dismissTimeoutId)
      setIsVisible(false)
    }
  }, [message, onDismiss])

  if (!message) {
    return null
  }

  const isError = tone === 'error'
  const toneClass = isError
    ? 'border-rose-200 bg-rose-50 text-rose-800'
    : 'border-emerald-200 bg-emerald-50 text-emerald-800'
  const iconClass = isError
    ? 'bg-rose-100 text-rose-700 ring-rose-200'
    : 'bg-emerald-100 text-emerald-700 ring-emerald-200'

  return (
    <div className="pointer-events-none fixed inset-x-4 bottom-24 z-40 flex justify-center lg:bottom-8">
      <div
        className={`pointer-events-auto flex w-full max-w-sm items-center gap-3 rounded-2xl border px-4 py-3 text-sm font-bold shadow-xl shadow-stone-950/10 transition-all duration-300 ease-out ${
          isVisible
            ? 'translate-y-0 scale-100 opacity-100'
            : 'translate-y-5 scale-95 opacity-0'
        } ${toneClass}`}
        role="status"
      >
        <span
          aria-hidden="true"
          className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-base leading-none ring-1 ${iconClass}`}
        >
          {isError ? '!' : '\u2713'}
        </span>
        <span className="min-w-0 flex-1 leading-5">{message}</span>
      </div>
    </div>
  )
}

export default Toast
