import { Navigate, Outlet } from 'react-router-dom';
import PropTypes from 'prop-types';
import { useAuth } from '../../context/AuthContext.jsx';

/**
 * Route guard component that checks authentication state from AuthContext.
 * If the user is not authenticated, redirects to /login via Navigate.
 * If authenticated, renders children or an Outlet for nested routes.
 *
 * @param {{ children?: React.ReactNode }} props
 * @returns {JSX.Element}
 *
 * @see SCRUM-9274
 * @see SCRUM-9279
 */
export function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-sm text-neutral-500">Loading…</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children ? children : <Outlet />;
}

ProtectedRoute.propTypes = {
  children: PropTypes.node,
};

export default ProtectedRoute;