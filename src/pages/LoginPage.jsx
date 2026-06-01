import { useState, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { FormField } from '../components/common/FormField.jsx';
import { Toast } from '../components/common/Toast.jsx';
import { validateEmail, validateRequired } from '../utils/validators.js';

/**
 * Mock login page component.
 * Renders a centered card with email and password fields, a Sign In button,
 * and a link to /signup. Accepts any credentials via AuthContext login().
 * Shows success toast and navigates to /account on successful login.
 *
 * @returns {JSX.Element}
 *
 * @see SCRUM-9274
 * @see SCRUM-9279
 */
export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({ email: null, password: null });
  const [formError, setFormError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [toast, setToast] = useState({ message: '', type: 'info', isVisible: false });

  const dismissToast = useCallback(() => {
    setToast((prev) => ({ ...prev, isVisible: false }));
  }, []);

  const handleEmailChange = useCallback((e) => {
    setEmail(e.target.value);
    setErrors((prev) => ({ ...prev, email: null }));
    setFormError(null);
  }, []);

  const handlePasswordChange = useCallback((e) => {
    setPassword(e.target.value);
    setErrors((prev) => ({ ...prev, password: null }));
    setFormError(null);
  }, []);

  const validateForm = useCallback(() => {
    const emailResult = validateEmail(email);
    const passwordResult = validateRequired(password, 'Password');

    const newErrors = {
      email: emailResult.valid ? null : emailResult.error,
      password: passwordResult.valid ? null : passwordResult.error,
    };

    setErrors(newErrors);

    return emailResult.valid && passwordResult.valid;
  }, [email, password]);

  const handleSubmit = useCallback(
    (e) => {
      e.preventDefault();
      setFormError(null);

      if (!validateForm()) {
        return;
      }

      setIsSubmitting(true);

      try {
        const result = login(email.trim(), password.trim());

        if (result.success) {
          setToast({ message: 'Sign in successful! Redirecting…', type: 'success', isVisible: true });
          setTimeout(() => {
            navigate('/account', { replace: true });
          }, 500);
        } else {
          setFormError(result.error || 'Login failed. Please try again.');
          setIsSubmitting(false);
        }
      } catch {
        setFormError('An unexpected error occurred. Please try again.');
        setIsSubmitting(false);
      }
    },
    [email, password, login, navigate, validateForm]
  );

  const appTitle = import.meta.env.VITE_APP_TITLE || 'CSNP Member Portal';

  return (
    <div className="flex min-h-screen items-center justify-center bg-neutral-50 px-4 py-12">
      <Toast
        message={toast.message}
        type={toast.type}
        isVisible={toast.isVisible}
        onDismiss={dismissToast}
      />

      <div className="w-full max-w-md">
        {/* Logo / Title */}
        <div className="mb-8 text-center">
          <svg
            className="mx-auto h-12 w-12 text-primary-500"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="1.5"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z"
            />
          </svg>
          <h1 className="mt-4 text-2xl font-bold text-primary-800">{appTitle}</h1>
          <p className="mt-2 text-sm text-neutral-600">Sign in to your account</p>
        </div>

        {/* Login Card */}
        <div className="card">
          {/* Demo hint */}
          <div className="mb-6 rounded-md border border-primary-200 bg-primary-50 px-4 py-3">
            <p className="text-sm text-primary-700">
              <strong>Demo:</strong> Enter any email and password to sign in.
            </p>
          </div>

          {/* Form-level error */}
          {formError && (
            <div
              className="mb-4 rounded-md border border-red-300 bg-red-50 px-4 py-3"
              role="alert"
            >
              <p className="text-sm text-red-700">{formError}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate>
            <FormField
              id="login-email"
              label="Email Address"
              type="email"
              value={email}
              onChange={handleEmailChange}
              error={errors.email}
              required
              disabled={isSubmitting}
              placeholder="you@example.com"
            />

            <FormField
              id="login-password"
              label="Password"
              type="password"
              value={password}
              onChange={handlePasswordChange}
              error={errors.password}
              required
              disabled={isSubmitting}
              placeholder="Enter your password"
            />

            <button
              type="submit"
              className="btn-primary mt-2 w-full"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Signing in…' : 'Sign In'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-neutral-600">
            Don&apos;t have an account?{' '}
            <Link to="/signup" className="link">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}