# Minutiae App Documentation

Minutiae is a mobile-first life admin app for Indian households. It tracks small but important household records: bills, expenses, vendor payments, subscriptions, income, insurance, complaints, and maintenance records.

The app is intentionally frontend-only. It stores data in the browser, runs as a Vite React app, supports PWA-style local use, and deploys to GitHub Pages.

## Project Guardrails

- Repository: `leapfrog7/minutiae`
- Live URL: `https://leapfrog7.github.io/minutiae/`
- Vite base must remain `"/minutiae/"` in `vite.config.js`.
- Do not remove or break `.github/workflows/deploy.yml`.
- Do not add backend, authentication, database, React Router, OCR, real file upload, charts, push notifications, payment integrations, or unnecessary dependencies unless the product direction explicitly changes.
- Keep UI mobile-first, compact, and usable at narrow widths.
- Prefer existing helpers and the shared life-item model over parallel data models.
- After changes, run `npm run build`.

## High-Level Architecture

Main app areas:

- `src/pages/HomePage.jsx`: dashboard, priority items, onboarding, backup reminder, summary previews.
- `src/pages/AddPage.jsx`: item type selection and add flow.
- `src/pages/CalendarPage.jsx`: agenda-style upcoming due dates and follow-ups.
- `src/pages/MoneyPage.jsx`: income, paid expenses, balance, and monthly money overview.
- `src/pages/RecordsPage.jsx`: searchable month/date archive.
- `src/pages/SettingsPage.jsx`: backup/export/import and app settings.

Shared UI:

- `src/components/common/ItemCard.jsx`: compact reusable item card.
- `src/components/common/ItemDetailSheet.jsx`: bottom-sheet item detail, edit, delete, quick actions, vendor actions, snooze, bill history.
- `src/components/common/MarkPaidDialog.jsx`: payment confirmation and optional Money entry creation.
- `src/components/common/Toast.jsx`: transient success/error toast.
- `src/components/common/NextReminderPrompt.jsx`: prompt for manually creating the next recurring reminder.

Core data/helpers:

- `src/features/lifeItems/lifeItemStorage.js`: localStorage persistence, add/update/delete, linked expense creation, recurring next item creation, snooze writes.
- `src/features/lifeItems/lifeItemHelpers.js`: dates, status logic, stats, money logic, linked expense helpers, recurring-cycle logic, duplicate warnings, snooze updates, bill cycle history.
- `src/features/lifeItems/recordArchiveHelpers.js`: Records page month/date archive grouping and totals.
- `src/features/lifeItems/nextReminderFlow.js`: applies auto/ask/none behavior for next reminders.
- `src/features/backup/backupReminder.js`: local backup reminder/export/calendar helper logic.

## Data Model

The app uses one shared "life item" model. Every saved thing is a life item with a `type`.

Supported item types:

- `expense`
- `bill`
- `vendor`
- `subscription`
- `income`
- `insurance`
- `complaint`
- `document`

Important: `document` is the internal type for Record / Maintenance. Do not rename the stored type without a migration.

Common fields include:

- `id`
- `type`
- `title`
- `amount`
- `status`
- `category`
- `paymentMode`
- `notes`
- `createdAt`
- `updatedAt`

Each type also has specific fields:

- Bill: `dueDate`, `paidDate`, `frequency`, `nextReminderMode`, `receiptName`
- Vendor: `vendorName`, `serviceType`, `paymentDate`, `paymentFrequency`, `contactNumber`, `upiId`, settlement fields
- Subscription: `renewalDate`, `billingCycle`, `autoRenewal`, `cancelBeforeDate`
- Income: `sourceName`, `date`, `receivedDate`, `frequency`, `recurring`
- Insurance: `policyType`, `insurerName`, `policyNumber`, `premiumAmount`, `dueDate`, `frequency`
- Complaint: `complaintId`, `companyOrDepartment`, `dateRaised`, `followUpDate`, `expectedResolutionDate`
- Record / Maintenance: `recordType`, `relatedTo`, `documentDate`, `serviceDate`, `nextServiceDate`, `expiryDate`, `warrantyTill`, interval fields, parts/reference/attachment details

## Storage

Primary storage key:

- `minutiae-life-items`

Other localStorage keys:

- `minutiae-onboarding-dismissed`
- backup reminder keys in `src/features/backup/backupReminder.js`

Data is local only. Clearing browser data, storage, or device memory can wipe records unless the user exports a backup.

## Money Logic

The app is not meant to become accounting software.

Core principle:

`Monthly Balance = Received Income - Paid Expenses`

Rules:

- Direct `expense` items are Money entries.
- Only paid expenses count toward spending totals.
- Received income counts as income.
- Expected income is tracked but does not count as received income.
- Bills, vendors, subscriptions, insurance, and maintenance records are not directly counted in Money unless they create a linked expense record.

Linked expense behavior:

- Source items can create linked expense items.
- Linked expenses use `linkedItemId` and `linkedItemType`.
- Duplicate linked expenses are prevented by checking existing `linkedItemId`.
- Keep duplicate prevention in shared helpers/storage, not only in UI.

## Add Flow

Add flow lives in:

- `src/pages/AddPage.jsx`
- `src/components/add/AddItemTypeSelector.jsx`
- `src/components/add/AddItemForm.jsx`

The item type order is:

1. Expense
2. Bill
3. Vendor Payment
4. Subscription
5. Income
6. Insurance
7. Complaint
8. Record / Maintenance

After saving, the app shows a toast instead of a full saved screen.

For items saved as paid/completed/closed, recurring next-reminder logic may run immediately after save.

## Recurring Next Reminders

Recurring reminders are supported for:

- bill
- vendor
- subscription
- insurance
- eligible document/record/maintenance items

Expenses, income, and complaints do not create recurring next reminders.

For bills:

- Bill form has `nextReminderMode`.
- Options:
  - `auto`: auto-create next reminder after paid
  - `ask`: ask each time
  - `none`: do not create
- Existing bills without `nextReminderMode` default to `auto`.
- The next bill copies the same mode, so the chain continues month to month.
- Only the next cycle is created when the current cycle is marked paid. It does not create multiple future months at once.

For non-bill recurring items:

- The app asks with `Create next reminder?`
- The user can choose `Create next` or `Skip`.

Duplicate next reminders are prevented by matching type, identity, and next due/renewal/payment/service date.

## Snooze / Remind Later

Item detail sheets show `Remind later` for active reminder-like items:

- bill
- vendor
- subscription
- insurance
- complaint
- document/record/maintenance

Options:

- Tomorrow
- In 3 days
- Next week

Snooze updates the relevant date field:

- Bill/insurance: `dueDate`
- Subscription: `renewalDate` and `dueDate`
- Vendor: `paymentDate` and `dueDate`
- Complaint: `followUpDate`
- Document: `nextServiceDate`, `expiryDate`, or `warrantyTill`, depending on which date was relevant

Finished items such as paid, completed, closed, resolved, or archived items do not show snooze actions.

## Duplicate Warnings

The Add/Edit form warns when a similar item already exists.

This is a warning only. Users can still save intentionally.

Similarity is type-specific and uses practical identity fields such as:

- Bill: title + category
- Vendor: vendor name + service type
- Insurance: policy number/title + insurer
- Complaint: complaint ID/title + company
- Document: reference/relatedTo/title + record type

Date matching is conservative: exact same date or same month.

## Bill Cycle History

Bill detail sheets show `Previous cycles` when matching bill records exist.

Matching uses bill identity, not a separate parent/child table. This keeps the app simple while still making auto-created recurring bills understandable.

Each cycle row shows:

- due/paid date
- amount
- status
- paid date when present

## Records Archive

Records page is a searchable household archive.

It groups items:

`Month -> Date -> Item cards`

Record date is historical, not necessarily the next due date.

Search and type filters are applied before grouping.

Search:

- case-insensitive
- partial text
- includes practical household fields such as phone, UPI, complaint ID, policy number, relatedTo, notes, dates, payment mode, amount
- when active, shows all matching months and bypasses the load-older limit

Month summaries show:

- record count
- paid expense total out
- received income total in

Older months are progressively revealed via `Load older months`.

## Calendar

Calendar is an agenda, not a grid calendar.

It surfaces upcoming and overdue actionable items:

- dues
- renewals
- vendor payments
- complaint follow-ups
- document expiries/service reminders

Cards reuse `ActionItemCard` and item detail sheets.

Quick actions from Calendar can mark items paid/resolved/completed and may trigger next reminder behavior.

## Home

Home is the daily dashboard.

It includes:

- backup due warning
- first-time onboarding card
- priority items
- Today summary
- summary tiles with preview sheets

The onboarding card appears when there are fewer than 3 items and `minutiae-onboarding-dismissed` is not set.

Backup warning is important because data is local-only.

## Detail Sheet

`ItemDetailSheet.jsx` is the main per-item action surface.

It supports:

- view details
- edit
- delete
- quick status action
- mark paid dialog
- record expense/add to Money
- vendor UPI/call/copy actions
- record contact action
- snooze/remind later
- bill cycle history
- recurring next-reminder prompt
- toast feedback

Back gesture behavior should close nested overlays first:

1. delete confirm
2. mark paid dialog
3. edit mode
4. detail sheet

## Backup / Data Safety

Backup/export/import exists in Settings and Home reminder logic.

The product copy should stay cautionary:

- Data lives only in this browser.
- Clearing browser data/storage/device memory can wipe records.
- Export regularly.

Do not weaken this message.

## Icons

Item type emojis are centralized in:

- `src/data/itemTypes.js`

Use `getItemEmoji(typeOrItem)` rather than copying emoji strings around.

Fallback emoji:

- `+`

Avoid icon fonts, raw HTML entities, malformed Unicode, and unusual font styling on emoji spans.

Favicon:

- `public/minutiae.ico`
- linked from `index.html` with `/minutiae/minutiae.ico?v=2`

## Deployment

Vite config:

```js
base: "/minutiae/"
```

Do not change this unless GitHub Pages deployment changes.

GitHub Pages workflow:

- `.github/workflows/deploy.yml`
- builds with `npm run build`
- deploys `dist`

Validation command:

```bash
npm run build
```

If Git reports dubious ownership on this checkout, this command has worked:

```bash
git -c safe.directory=D:/Minutiae/minutiae status --short
```

## Development Notes

- Prefer `rg` for search.
- Use shared helpers/storage for cross-screen behavior.
- Avoid creating a second transaction model. Money should continue to read from the life-item model.
- Avoid large redesigns; keep app compact and mobile-first.
- Avoid horizontal overflow on mobile.
- Do not use cards inside cards unless there is a clear repeated-item or modal need.
- Preserve existing behavior when adding features:
  - Add/Edit/Delete
  - linked expenses
  - vendor UPI actions
  - income tracking
  - Calendar grouping
  - Records archive
  - Settings backup/restore
  - PWA/GitHub Pages setup

## Current Feature Summary

Minutiae currently supports:

- Add/edit/delete life items
- Type-specific forms and detail fields
- Paid/unpaid/status flows
- Linked Money expenses
- Received/expected income
- Monthly money picture
- Calendar agenda
- Records month/date archive
- Search and type filtering
- Backup reminder/export/import
- First-time onboarding
- Recurring next reminder creation
- Auto-create next bill reminders
- Snooze/remind later
- Duplicate warnings while adding
- Bill previous-cycle history
- Toast feedback
- PWA basics and GitHub Pages deployment

## Good Next Improvements

Potential future improvements that fit the current product direction:

- A compact "Upcoming digest" on Home with the next few actionable items.
- Better restore preview before importing backup data.
- More visible source/linked expense navigation between Money entries and source items.
- A simple monthly review section on Money.
- Optional export metadata showing last backup date more visibly.
