import { getLifeItems } from '../lifeItems/lifeItemStorage'

const LAST_BACKUP_KEY = 'minutiae-last-backup-at'
const DISMISSED_AT_KEY = 'minutiae-backup-reminder-dismissed-at'
const FREQUENCY_DAYS_KEY = 'minutiae-backup-frequency-days'
const DEFAULT_FREQUENCY_DAYS = 15
const DISMISS_HOURS = 24

const dayMs = 24 * 60 * 60 * 1000

export function getLastBackupAt() {
  return localStorage.getItem(LAST_BACKUP_KEY) || ''
}

export function setLastBackupAt(dateISOString) {
  localStorage.setItem(LAST_BACKUP_KEY, dateISOString)
  localStorage.removeItem(DISMISSED_AT_KEY)
}

export function getBackupFrequencyDays() {
  const storedValue = Number(localStorage.getItem(FREQUENCY_DAYS_KEY))
  return storedValue > 0 ? storedValue : DEFAULT_FREQUENCY_DAYS
}

export function setBackupFrequencyDays(days) {
  const parsedDays = Number(days)
  localStorage.setItem(
    FREQUENCY_DAYS_KEY,
    String(parsedDays > 0 ? parsedDays : DEFAULT_FREQUENCY_DAYS),
  )
}

export function getNextBackupDueDate() {
  const lastBackupAt = getLastBackupAt()

  if (!lastBackupAt) {
    return ''
  }

  const date = new Date(lastBackupAt)

  if (Number.isNaN(date.getTime())) {
    return ''
  }

  date.setDate(date.getDate() + getBackupFrequencyDays())
  return date.toISOString()
}

export function dismissBackupReminder() {
  localStorage.setItem(DISMISSED_AT_KEY, new Date().toISOString())
}

export function isBackupDue(itemCount = getLifeItems().length) {
  if (itemCount === 0 || isDismissedTemporarily()) {
    return false
  }

  const lastBackupAt = getLastBackupAt()

  if (!lastBackupAt) {
    return true
  }

  const lastBackupDate = new Date(lastBackupAt)

  if (Number.isNaN(lastBackupDate.getTime())) {
    return true
  }

  return Date.now() - lastBackupDate.getTime() >= getBackupFrequencyDays() * dayMs
}

export function getBackupReminderState(itemCount = getLifeItems().length) {
  const lastBackupAt = getLastBackupAt()
  const nextBackupDueAt = getNextBackupDueDate()
  const due = isBackupDue(itemCount)

  return {
    due,
    frequencyDays: getBackupFrequencyDays(),
    hasItems: itemCount > 0,
    lastBackupAt,
    nextBackupDueAt,
  }
}

export function exportLifeItemsBackup() {
  const items = getLifeItems()
  const exportedAt = new Date().toISOString()
  const payload = {
    app: 'Minutiae',
    version: '0.1.0',
    exportedAt,
    itemCount: items.length,
    items,
  }
  const dateKey = exportedAt.slice(0, 10)
  const blob = new Blob([JSON.stringify(payload, null, 2)], {
    type: 'application/json',
  })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')

  link.href = url
  link.download = `minutiae-backup-${dateKey}.json`
  link.click()
  URL.revokeObjectURL(url)
  setLastBackupAt(exportedAt)

  return {
    exportedAt,
    itemCount: items.length,
  }
}

export function downloadBackupReminderCalendar() {
  const now = new Date()
  const startDate = getNextBackupDueDate()
    ? new Date(getNextBackupDueDate())
    : now
  const endDate = new Date(startDate)
  endDate.setMinutes(endDate.getMinutes() + 15)
  const ics = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Minutiae//Backup Reminder//EN',
    'BEGIN:VEVENT',
    `UID:minutiae-backup-${now.getTime()}@minutiae`,
    `DTSTAMP:${formatIcsDate(now)}`,
    `DTSTART:${formatIcsDate(startDate)}`,
    `DTEND:${formatIcsDate(endDate)}`,
    'RRULE:FREQ=DAILY;INTERVAL=15',
    'SUMMARY:Backup Minutiae data',
    'DESCRIPTION:Open Minutiae and export a JSON backup.',
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n')
  const blob = new Blob([ics], { type: 'text/calendar' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')

  link.href = url
  link.download = 'minutiae-backup-reminder.ics'
  link.click()
  URL.revokeObjectURL(url)
}

function isDismissedTemporarily() {
  const dismissedAt = localStorage.getItem(DISMISSED_AT_KEY)

  if (!dismissedAt) {
    return false
  }

  const dismissedDate = new Date(dismissedAt)

  if (Number.isNaN(dismissedDate.getTime())) {
    return false
  }

  return Date.now() - dismissedDate.getTime() < DISMISS_HOURS * 60 * 60 * 1000
}

function formatIcsDate(date) {
  return date.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}Z$/, 'Z')
}
