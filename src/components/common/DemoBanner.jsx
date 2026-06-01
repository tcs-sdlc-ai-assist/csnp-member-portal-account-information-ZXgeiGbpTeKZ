import { useCallback } from 'react';
import { useAuth } from '../../context/AuthContext.jsx';
import { useSettings } from '../../context/SettingsContext.jsx';

/**
 * Persistent demo mode banner displayed at the top of the application.
 * Indicates that the app is running in demo mode with fictitious data.
 * Includes a "Reset Demo" button that resets all data to defaults and logs out.
 *
 * @returns {JSX.Element}
 *
 * @see SCRUM-9285
 */
export function DemoBanner() {
  const { logout } = useAuth();
  const { resetAllData } = useSettings();

  const handleReset = useCallback(() => {
    resetAllData();
    logout();
  }, [resetAllData, logout]);

  return (
    <div
      className="w-full border-b border-amber-300 bg-amber-50 px-4 py-2"
      role="status"
      aria-label="Demo mode indicator"
    >
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-3 sm:px-6 lg:px-8">
        <div className="flex items-center gap-2">
          <svg
            className="h-5 w-5 flex-shrink-0 text-amber-600"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="1.5"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z"
            />
          </svg>
          <p className="text-sm font-medium text-amber-800">
            Demo Mode – No real data is stored or transmitted. All information shown is fictitious.
          </p>
        </div>
        <button
          type="button"
          className="inline-flex flex-shrink-0 items-center justify-center rounded-md border border-amber-400 bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-800 shadow-sm transition-colors hover:bg-amber-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-500"
          onClick={handleReset}
        >
          Reset Demo
        </button>
      </div>
    </div>
  );
}

export default DemoBanner;