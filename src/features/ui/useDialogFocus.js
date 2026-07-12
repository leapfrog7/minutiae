import { useEffect, useRef } from 'react'

const focusableSelector = [
  'button:not([disabled])',
  'a[href]',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',')

export function useDialogFocus(onDismiss, active = true) {
  const dialogRef = useRef(null)
  const dismissRef = useRef(onDismiss)

  useEffect(() => {
    dismissRef.current = onDismiss
  }, [onDismiss])

  useEffect(() => {
    const dialog = dialogRef.current

    if (!active || !dialog) {
      return undefined
    }

    const previousFocus = document.activeElement
    const focusableElements = () =>
      Array.from(dialog.querySelectorAll(focusableSelector))
    const initialFocus =
      dialog.querySelector('[data-dialog-initial-focus]') ||
      focusableElements()[0]

    initialFocus?.focus()

    function handleKeyDown(event) {
      if (event.key === 'Escape') {
        event.preventDefault()
        dismissRef.current?.()
        return
      }

      if (event.key !== 'Tab') {
        return
      }

      const elements = focusableElements()

      if (elements.length === 0) {
        event.preventDefault()
        return
      }

      const first = elements[0]
      const last = elements[elements.length - 1]

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }

    dialog.addEventListener('keydown', handleKeyDown)
    return () => {
      dialog.removeEventListener('keydown', handleKeyDown)
      if (previousFocus instanceof HTMLElement) {
        previousFocus.focus()
      }
    }
  }, [active])

  return dialogRef
}
