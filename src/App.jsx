import { useState } from 'react'
import AppShell from './components/layout/AppShell'
import AddPage from './pages/AddPage'
import CalendarPage from './pages/CalendarPage'
import HomePage from './pages/HomePage'
import MoneyPage from './pages/MoneyPage'
import RecordsPage from './pages/RecordsPage'
import SettingsPage from './pages/SettingsPage'

const pages = {
  home: HomePage,
  add: AddPage,
  calendar: CalendarPage,
  money: MoneyPage,
  records: RecordsPage,
  settings: SettingsPage,
}

function App() {
  const [activePage, setActivePage] = useState('home')
  const [pendingAddType, setPendingAddType] = useState('')

  const CurrentPage = pages[activePage]

  function handleNavigate(nextPage) {
    if (typeof nextPage === 'object') {
      setPendingAddType(nextPage.type || '')
      setActivePage(nextPage.page)
      return
    }

    setPendingAddType('')
    setActivePage(nextPage)
  }

  return (
    <AppShell activePage={activePage} onNavigate={handleNavigate}>
      <CurrentPage initialType={pendingAddType} onNavigate={handleNavigate} />
    </AppShell>
  )
}

export default App
