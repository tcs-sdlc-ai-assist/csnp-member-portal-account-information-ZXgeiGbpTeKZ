import { useEffect } from 'react';
import { RouterProvider } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext.jsx';
import { SettingsProvider } from './context/SettingsContext.jsx';
import { DemoBanner } from './components/common/DemoBanner.jsx';
import { initializeMockData } from './services/mockData.js';
import router from './router.jsx';

/**
 * Root application component.
 * Wraps the entire app in AuthProvider and SettingsProvider context providers.
 * Renders DemoBanner at the top and RouterProvider with the router configuration.
 * Calls initializeMockData() on mount to seed localStorage with defaults if empty.
 *
 * @returns {JSX.Element}
 */
export default function App() {
  useEffect(() => {
    initializeMockData();
  }, []);

  return (
    <AuthProvider>
      <SettingsProvider>
        <DemoBanner />
        <RouterProvider router={router} />
      </SettingsProvider>
    </AuthProvider>
  );
}