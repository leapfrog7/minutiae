import { useEffect } from 'react'

function ConfirmDialog({
  confirmLabel = 'Delete',
  message,
  onCancel,
  onConfirm,
  title,
  tone = 'danger',
}) {
  const confirmClass =
    tone === 'danger'
      ? 'bg-rose-600 text-white'
      : 'bg-teal-700 text-white'

  useEffect(() => {
    function handleInternalBack(event) {
      event.preventDefault()
      onCancel()
    }

    window.addEventListener('minutiae:back', handleInternalBack)
    return () => window.removeEventListener('minutiae:back', handleInternalBack)
  }, [onCancel])

  return (
    <div
      className="fixed inset-0 z-30 flex items-center justify-center bg-stone-950/40 px-4"
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <div className="w-full max-w-sm rounded-2xl bg-white p-4 shadow-2xl shadow-stone-950/20">
        <h2 className="text-base font-bold text-stone-950">{title}</h2>
        <p className="mt-2 text-sm text-stone-600">{message}</p>
        <div className="mt-4 grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-2xl bg-stone-100 px-4 py-3 text-sm font-bold text-stone-800"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className={`rounded-2xl px-4 py-3 text-sm font-bold ${confirmClass}`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}

export default ConfirmDialog
