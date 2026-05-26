import { NavLink, Outlet } from 'react-router-dom';
import SecurityBanner from './SecurityBanner.jsx';
import ModelLoaderStatus from './ModelLoaderStatus.jsx';

const navItems = [
  { to: '/', label: 'Dashboard', end: true },
  { to: '/detection', label: 'Detection' },
  { to: '/matching', label: 'Matching' },
  { to: '/liveness', label: 'Liveness' },
  { to: '/verification', label: 'Verification' },
  { to: '/diagnostics', label: 'Diagnostics' },
];

export default function Layout() {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="sticky top-0 z-50 border-b border-surface-border/80 bg-surface/90 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-14 sm:h-16">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-accent to-purple-600 flex items-center justify-center text-sm font-bold">
                FV
              </div>
              <div>
                <h1 className="text-sm sm:text-base font-semibold tracking-tight">
                  Face Verification Playground
                </h1>
                <p className="text-[10px] sm:text-xs text-gray-500 hidden sm:block">
                  face-api.js evaluation suite
                </p>
              </div>
            </div>
            <ModelLoaderStatus />
          </div>
          <nav className="flex gap-1 overflow-x-auto pb-3 -mx-1 scrollbar-none">
            {navItems.map(({ to, label, end }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                className={({ isActive }) =>
                  `px-3 py-1.5 rounded-lg text-xs sm:text-sm whitespace-nowrap transition-all duration-200 ${
                    isActive
                      ? 'bg-accent/20 text-accent-glow font-medium'
                      : 'text-gray-400 hover:text-gray-200 hover:bg-surface-raised'
                  }`
                }
              >
                {label}
              </NavLink>
            ))}
          </nav>
        </div>
      </header>

      <SecurityBanner />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6">
        <Outlet />
      </main>

      <footer className="border-t border-surface-border py-4 text-center text-xs text-gray-600">
        Internal QA tool — not for production KYC · Manual review required
      </footer>
    </div>
  );
}
