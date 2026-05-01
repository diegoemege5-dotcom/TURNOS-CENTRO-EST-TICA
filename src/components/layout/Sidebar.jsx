import { NavLink } from 'react-router-dom'

const PATHS = {
  home: 'M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25',
  calendar: 'M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5',
  user: 'M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z',
  sparkles: 'M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456z',
  users: 'M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z',
}

function Icon({ d }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
      className="h-5 w-5 shrink-0"
    >
      <path strokeLinecap="round" strokeLinejoin="round" d={d} />
    </svg>
  )
}

const NAV = [
  { to: '/dashboard',     label: 'Dashboard',      icon: PATHS.home },
  { to: '/turnos',        label: 'Turnos',          icon: PATHS.calendar },
  { to: '/profesionales', label: 'Profesionales',   icon: PATHS.user },
  { to: '/servicios',     label: 'Servicios',       icon: PATHS.sparkles },
  { to: '/clientes',      label: 'Clientes',        icon: PATHS.users },
]

export default function Sidebar({ open, onClose }) {
  return (
    <aside
      className={[
        'fixed inset-y-0 left-0 z-30 flex w-64 flex-col bg-slate-900',
        'transition-transform duration-200 ease-in-out',
        open ? 'translate-x-0' : '-translate-x-full',
        'md:translate-x-0',
      ].join(' ')}
    >
      {/* Brand */}
      <div className="flex h-16 shrink-0 items-center gap-3 border-b border-slate-700/60 px-5">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-500 text-sm font-bold text-white">
          S
        </div>
        <div className="leading-tight">
          <p className="text-sm font-semibold text-white">Studio Bellas</p>
          <p className="text-xs text-slate-400">Panel de gestión</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-0.5 overflow-y-auto px-3 py-4">
        {NAV.map(({ to, label, icon }) => (
          <NavLink
            key={to}
            to={to}
            onClick={onClose}
            className={({ isActive }) =>
              [
                'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-violet-600 text-white'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white',
              ].join(' ')
            }
          >
            <Icon d={icon} />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* User footer */}
      <div className="shrink-0 border-t border-slate-700/60 px-3 py-4">
        <div className="flex items-center gap-3 rounded-lg px-3 py-2">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-600 text-xs font-semibold text-slate-200">
            A
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-white">Administrador</p>
            <p className="truncate text-xs text-slate-400">admin@studiobellas.com</p>
          </div>
        </div>
      </div>
    </aside>
  )
}
