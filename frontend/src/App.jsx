
import { useState } from 'react'
import Login from './pages/Login'
import Overview from './pages/Overview'
import Departments from './pages/Departments'
import Employees from './pages/Employees'
import PoultryHouses from './pages/PoultryHouses'
import FlockManagement from './pages/FlockManagement'
import UserManagement from './pages/UserManagement'

const navigation = [
  { label: 'Overview', icon: '▦' },
  { label: 'Poultry Houses', icon: '⌂' },
  { label: 'Flock Management', icon: '◉' },
  { label: 'Employees', icon: '♙' },
  { label: 'Departments', icon: '☷' },
  { label: 'Tasks & Cleaning', icon: '✓' },
  { label: 'Inventory', icon: '▤' },
  { label: 'Drivers & Vehicles', icon: '↗' },
  { label: 'Sales & Deliveries', icon: '▣' },
  { label: 'Reports', icon: '▥' },
  { label: 'User Management', icon: '♙' },
]

function App() {
  const [user, setUser] = useState(() => {
    try {
      const token = sessionStorage.getItem('khensani_token')
      const savedUser = sessionStorage.getItem('khensani_user')

      return token && savedUser
        ? JSON.parse(savedUser)
        : null
    } catch {
      sessionStorage.removeItem('khensani_token')
      sessionStorage.removeItem('khensani_user')
      return null
    }
  })

  const [activePage, setActivePage] = useState('Overview')
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const handleLogin = (data) => {
    sessionStorage.setItem('khensani_token', data.token)
    sessionStorage.setItem(
      'khensani_user',
      JSON.stringify({
        username: data.username,
        fullName: data.fullName,
        role: data.role,
      })
    )
    setUser(data)
  }

  const handleLogout = () => {
    sessionStorage.removeItem('khensani_token')
    sessionStorage.removeItem('khensani_user')
    setUser(null)
    setActivePage('Overview')
  }

  const renderPage = () => {
    if (activePage === 'Overview') {
      return <Overview onNavigate={setActivePage} />
    }

    if (activePage === 'Poultry Houses') {
      return <PoultryHouses />
    }

    if (activePage === 'Flock Management') {
      return <FlockManagement />
    }

    if (activePage === 'Departments') {
      return <Departments />
    }

    if (activePage === 'Employees') {
      return <Employees />
    }

    if (activePage === 'User Management') {
      return <UserManagement />
    }

    return (
      <section className="rounded-2xl border border-[#e5e9df] bg-white p-8">
        <h3 className="text-xl font-bold">{activePage}</h3>
        <p className="mt-2 text-sm text-[#849082]">
          This module will be built in a later development step.
        </p>
      </section>
    )
  }

  if (!user) {
    return <Login onLogin={handleLogin} />
  }

  return (
    <div className="min-h-screen bg-[#f6f7f2] text-[#20392d]">
      {mobileMenuOpen && (
        <button
          type="button"
          aria-label="Close navigation"
          className="fixed inset-0 z-40 bg-black/30 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex h-screen w-64 flex-col overflow-hidden border-r border-[#e4e9df] bg-white transition-transform lg:translate-x-0 ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
      >
        <div className="flex shrink-0 items-center gap-3 border-b border-[#edf0e9] px-5 py-6">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#174a35] text-xl font-bold text-white">
            K
          </div>
          <div>
            <h1 className="font-bold tracking-wide">KHENSANI</h1>
            <p className="text-xs tracking-[0.18em] text-[#8b967f]">
              POULTRY
            </p>
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5">
          <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-[#929b8e]">
            Main menu
          </p>
          <nav className="space-y-1">
            {navigation.map((item) => (
              <button
                type="button"
                key={item.label}
                onClick={() => {
                  setActivePage(item.label)
                  setMobileMenuOpen(false)
                }}
                className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition ${activePage === item.label
                  ? 'bg-[#e9f2e8] font-semibold text-[#174a35]'
                  : 'text-[#667267] hover:bg-[#f5f7f2]'
                  }`}
              >
                <span className="w-5 text-center text-lg">
                  {item.icon}
                </span>
                {item.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="mt-auto shrink-0 border-t border-[#edf0e9] p-5">
          <p className="text-sm font-semibold">Growing Today.</p>
          <p className="text-sm text-[#849082]">Building Tomorrow.</p>
          <p className="mt-3 text-xs text-[#9ba396]">
            Internal Operations v1.0
          </p>
        </div>
      </aside>

      <div className="min-h-screen lg:pl-64">
        <header className="sticky top-0 z-30 flex h-[76px] items-center justify-between border-b border-[#e4e9df] bg-white/95 px-4 backdrop-blur sm:px-8">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              aria-label="Open navigation"
              className="rounded-lg p-2 hover:bg-[#f0f3ed] lg:hidden"
            >
              ☰
            </button>
            <div>
              <p className="text-xs text-[#859082]">
                Khensani Poultry / {activePage}
              </p>
              <h2 className="text-lg font-bold sm:text-xl">
                {activePage}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden text-right sm:block">
              <p className="text-sm font-semibold">
                {user.fullName || user.username}
              </p>
              <p className="text-xs text-[#8b9687]">
                {user.role.replaceAll('_', ' ')}
              </p>
            </div>

            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#dcebd9] font-bold text-[#174a35]">
              {(user.fullName || user.username)
                .split(' ')
                .map((part) => part[0])
                .join('')
                .slice(0, 2)
                .toUpperCase()}
            </div>

            <button
              type="button"
              onClick={handleLogout}
              className="rounded-lg border border-[#dce3d7] px-3 py-2 text-sm font-semibold hover:bg-[#f5f7f2]"
            >
              Sign out
            </button>
          </div>
        </header>

        <main className="mx-auto max-w-[1500px] space-y-7 p-4 sm:p-8">
          {renderPage()}
        </main>
      </div>
    </div>
  )
}

export default App
