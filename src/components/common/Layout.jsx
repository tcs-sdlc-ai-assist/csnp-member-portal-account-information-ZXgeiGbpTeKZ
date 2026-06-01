import { useState, useCallback } from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';

const NAV_ITEMS = [
  { to: '/account', label: 'Account Info' },
  { to: '/representatives', label: 'Representatives' },
  { to: '/privacy', label: 'Privacy & Security' },
  { to: '/communication', label: 'Communication Preferences' },
  { to: '/pcp', label: 'PCP Management' },
];

/**
 * Main application layout component.
 * Renders a responsive shell with header, sidebar navigation, main content area,
 * and footer. Sidebar collapses to a hamburger menu on mobile viewports.
 *
 * @returns {JSX.Element}
 *
 * @see SCRUM-9286
 * @see SCRUM-9287
 */
export function Layout() {
  const { session, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = useCallback(() => {
    setSidebarOpen((prev) => !prev);
  }, []);

  const closeSidebar = useCallback(() => {
    setSidebarOpen(false);
  }, []);

  const userName = session?.user?.name || 'Member';
  const appTitle = import.meta.env.VITE_APP_TITLE || 'CSNP Member Portal';

  const navLinkClasses = ({ isActive }) =>
    isActive
      ? 'block rounded-md bg-primary-50 px-3 py-2 text-sm font-semibold text-primary-700 transition-colors'
      : 'block rounded-md px-3 py-2 text-sm font-medium text-neutral-700 transition-colors hover:bg-neutral-100 hover:text-primary-600';

  return (
    <div className="flex min-h-screen flex-col bg-neutral-50">
      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-neutral-200 bg-white shadow-sm">
        <div className="container-portal flex h-16 items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Mobile hamburger button */}
            <button
              type="button"
              className="inline-flex items-center justify-center rounded-md p-2 text-neutral-600 transition-colors hover:bg-neutral-100 hover:text-neutral-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500 lg:hidden"
              onClick={toggleSidebar}
              aria-label={sidebarOpen ? 'Close navigation menu' : 'Open navigation menu'}
              aria-expanded={sidebarOpen}
              aria-controls="sidebar-nav"
            >
              {sidebarOpen ? (
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                </svg>
              )}
            </button>

            {/* Logo / Title */}
            <NavLink to="/" className="flex items-center gap-2" onClick={closeSidebar}>
              <svg className="h-8 w-8 text-primary-500" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
              </svg>
              <span className="text-lg font-bold text-primary-800">{appTitle}</span>
            </NavLink>
          </div>

          {/* User info and logout */}
          <div className="flex items-center gap-4">
            <span className="hidden text-sm font-medium text-neutral-600 sm:inline">
              {userName}
            </span>
            <button
              type="button"
              className="btn-outline text-xs sm:text-sm"
              onClick={logout}
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <div className="container-portal flex flex-1">
        {/* Mobile overlay */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 z-20 bg-black/30 lg:hidden"
            onClick={closeSidebar}
            aria-hidden="true"
          />
        )}

        {/* Sidebar */}
        <aside
          id="sidebar-nav"
          className={`fixed left-0 top-16 z-20 h-[calc(100vh-4rem)] w-64 transform border-r border-neutral-200 bg-white transition-transform duration-200 ease-in-out lg:static lg:z-auto lg:h-auto lg:translate-x-0 lg:border-r-0 ${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
          role="navigation"
          aria-label="Main navigation"
        >
          <nav className="flex flex-col gap-1 p-4">
            {NAV_ITEMS.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={navLinkClasses}
                onClick={closeSidebar}
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
        </aside>

        {/* Main content */}
        <main className="flex-1 py-6 lg:pl-6">
          <Outlet />
        </main>
      </div>

      {/* Footer */}
      <footer className="border-t border-neutral-200 bg-white">
        <div className="container-portal py-4 text-center text-xs text-neutral-500">
          <p>
            This is a demo application for illustrative purposes only. No real member data is stored or transmitted.
          </p>
          <p className="mt-1">
            &copy; {new Date().getFullYear()} {appTitle}. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}

export default Layout;