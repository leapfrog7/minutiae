import { getStatusMeta } from '../../data/lifeAdminConstants'
import { getItemTypeMeta } from '../../data/itemTypes'
import {
  formatAmount,
  formatCycleLabel,
  formatDisplayDate,
  getItemAmount,
  getRelevantDate,
} from './lifeItemHelpers'

export function getLifeItemShareTitle(item) {
  const typeLabel = getItemTypeMeta(item?.type).label
  const title = item?.title || item?.vendorName || typeLabel
  return `${title} - ${typeLabel}`
}

export function getLifeItemShareSummary(item) {
  if (!item?.type) {
    return ''
  }

  const typeMeta = getItemTypeMeta(item.type)
  const statusMeta = getStatusMeta(item.status)
  const title = item.title || item.vendorName || typeMeta.label
  const lines = [
    `${typeMeta.emoji} ${typeMeta.label}: ${title}`,
    item.status ? `Status: ${statusMeta.label}` : '',
    getRelevantDate(item)
      ? `Date: ${formatDisplayDate(getRelevantDate(item))}`
      : '',
    getItemAmount(item) > 0
      ? `Amount: ${formatAmount(getItemAmount(item))}`
      : '',
    item.category ? `Category: ${item.category}` : '',
    ...getTypeSpecificShareLines(item),
    item.notes ? `Notes: ${item.notes}` : '',
    'Shared from Minutiae',
  ]

  return lines.filter(Boolean).join('\n')
}

function getTypeSpecificShareLines(item) {
  const linesByType = {
    bill: [
      item.frequency ? `Frequency: ${formatCycleLabel(item.frequency)}` : '',
      item.paymentMode ? `Payment: ${item.paymentMode}` : '',
    ],
    complaint: [
      item.companyOrDepartment
        ? `Company / department: ${item.companyOrDepartment}`
        : '',
      item.complaintId ? `Complaint ID: ${item.complaintId}` : '',
      item.contactNumber ? `Contact: ${item.contactNumber}` : '',
    ],
    document: [
      item.recordType || item.documentType
        ? `Record type: ${item.recordType || item.documentType}`
        : '',
      item.relatedTo ? `Related to: ${item.relatedTo}` : '',
      item.vendorName ? `Vendor: ${item.vendorName}` : '',
      item.contactNumber ? `Contact: ${item.contactNumber}` : '',
    ],
    expense: [
      item.paymentMode ? `Payment: ${item.paymentMode}` : '',
      item.recurring ? 'Recurring: Yes' : '',
    ],
    income: [
      item.sourceName ? `Source: ${item.sourceName}` : '',
      item.frequency ? `Frequency: ${formatCycleLabel(item.frequency)}` : '',
    ],
    insurance: [
      item.policyType ? `Policy type: ${item.policyType}` : '',
      item.insurerName ? `Insurer: ${item.insurerName}` : '',
      item.frequency ? `Frequency: ${formatCycleLabel(item.frequency)}` : '',
    ],
    investment: [
      item.investmentType ? `Investment type: ${item.investmentType}` : '',
      item.institutionName ? `Institution: ${item.institutionName}` : '',
      item.frequency ? `Frequency: ${formatCycleLabel(item.frequency)}` : '',
    ],
    reminder: [
      item.priority ? `Priority: ${capitalize(item.priority)}` : '',
      item.relatedPerson ? `Related person: ${item.relatedPerson}` : '',
      item.recurring && item.frequency
        ? `Repeats: ${formatCycleLabel(item.frequency)}`
        : '',
    ],
    subscription: [
      item.billingCycle
        ? `Billing cycle: ${formatCycleLabel(item.billingCycle)}`
        : '',
      item.autoRenewal === true ? 'Auto-renewal: Yes' : '',
    ],
    vendor: [
      item.serviceType ? `Service: ${item.serviceType}` : '',
      item.contactNumber ? `Contact: ${item.contactNumber}` : '',
      item.paymentFrequency
        ? `Frequency: ${formatCycleLabel(item.paymentFrequency)}`
        : '',
    ],
  }

  return linesByType[item.type] ?? []
}

function capitalize(value) {
  const text = String(value || '')
  return text ? `${text[0].toUpperCase()}${text.slice(1)}` : ''
}
