import { useEffect, useRef, useState } from 'react'
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
  const activePageRef = useRef(activePage)

  const CurrentPage = pages[activePage]

  useEffect(() => {
    activePageRef.current = activePage
  }, [activePage])

  useEffect(() => {
    window.history.replaceState({ minutiaePage: 'home' }, '')

    function handlePopState() {
      const backEvent = new CustomEvent('minutiae:back', {
        cancelable: true,
      })
      window.dispatchEvent(backEvent)

      if (backEvent.defaultPrevented) {
        window.history.pushState(
          { minutiaePage: activePageRef.current },
          '',
        )
        return
      }

      if (activePageRef.current !== 'home') {
        setPendingAddType('')
        setActivePage('home')
        window.history.replaceState({ minutiaePage: 'home' }, '')
      }
    }

    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [])

  function syncHistory(nextPage) {
    if (nextPage === 'home') {
      window.history.replaceState({ minutiaePage: 'home' }, '')
      return
    }

    const method = activePageRef.current === 'home' ? 'pushState' : 'replaceState'
    window.history[method]({ minutiaePage: nextPage }, '')
  }

  function handleNavigate(nextPage) {
    if (typeof nextPage === 'object') {
      setPendingAddType(nextPage.type || '')
      setActivePage(nextPage.page)
      syncHistory(nextPage.page)
      return
    }

    setPendingAddType('')
    setActivePage(nextPage)
    syncHistory(nextPage)
  }

  return (
    <AppShell activePage={activePage} onNavigate={handleNavigate}>
      <CurrentPage initialType={pendingAddType} onNavigate={handleNavigate} />
    </AppShell>
  )
}

export default App
