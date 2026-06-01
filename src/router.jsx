import { createBrowserRouter, Navigate } from 'react-router-dom';
import { ProtectedRoute } from './components/common/ProtectedRoute.jsx';
import { Layout } from './components/common/Layout.jsx';
import LoginPage from './pages/LoginPage.jsx';
import SignupPage from './pages/SignupPage.jsx';
import AccountInfoPage from './pages/AccountInfoPage.jsx';
import RepresentativesPage from './pages/RepresentativesPage.jsx';
import PrivacySecurityPage from './pages/PrivacySecurityPage.jsx';
import CommunicationPreferencesPage from './pages/CommunicationPreferencesPage.jsx';
import PCPManagementPage from './pages/PCPManagementPage.jsx';
import NotFoundPage from './pages/NotFoundPage.jsx';

const router = createBrowserRouter([
  {
    path: '/',
    element: <Navigate to="/login" replace />,
  },
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/signup',
    element: <SignupPage />,
  },
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <Layout />,
        children: [
          {
            path: '/account',
            element: <AccountInfoPage />,
          },
          {
            path: '/representatives',
            element: <RepresentativesPage />,
          },
          {
            path: '/privacy',
            element: <PrivacySecurityPage />,
          },
          {
            path: '/communication',
            element: <CommunicationPreferencesPage />,
          },
          {
            path: '/pcp',
            element: <PCPManagementPage />,
          },
        ],
      },
    ],
  },
  {
    path: '*',
    element: <NotFoundPage />,
  },
]);

export default router;