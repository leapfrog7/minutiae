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

  const CurrentPage = pages[activePage]

  return (
    <AppShell activePage={activePage} onNavigate={setActivePage}>
      <CurrentPage onNavigate={setActivePage} />
    </AppShell>
  )
}

export default App
