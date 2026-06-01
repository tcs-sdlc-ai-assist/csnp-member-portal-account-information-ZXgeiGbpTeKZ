import { useState, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { FormField } from '../components/common/FormField.jsx';
import { Toast } from '../components/common/Toast.jsx';
import { validateEmail, validateRequired, validateName } from '../utils/validators.js';

/**
 * Mock signup page component.
 * Renders a centered card with name, email, password, and confirm password fields,
 * a 'Create Account' button, and a link to /login. On submit, calls signup() from
 * AuthContext, shows success toast, and navigates to /account.
 * Includes demo hint: 'This is a demo signup – no real account is created.'
 * Client-side validation for matching passwords and required fields.
 *
 * @returns {JSX.Element}
 *
 * @see SCRUM-9274
 * @see SCRUM-9279
 */
export default function SignupPage() {
  const { signup } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState({
    name: null,
    email: null,
    password: null,
    confirmPassword: null,
  });
  const [formError, setFormError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [toast, setToast] = useState({ message: '', type: 'info', isVisible: false });

  const dismissToast = useCallback(() => {
    setToast((prev) => ({ ...prev, isVisible: false }));
  }, []);

  const handleNameChange = useCallback((e) => {
    setName(e.target.value);
    setErrors((prev) => ({ ...prev, name: null }));
    setFormError(null);
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

  const handleConfirmPasswordChange = useCallback((e) => {
    setConfirmPassword(e.target.value);
    setErrors((prev) => ({ ...prev, confirmPassword: null }));
    setFormError(null);
  }, []);

  const validateForm = useCallback(() => {
    const nameResult = validateName(name);
    const emailResult = validateEmail(email);
    const passwordResult = validateRequired(password, 'Password');

    let confirmPasswordError = null;
    const confirmResult = validateRequired(confirmPassword, 'Confirm password');
    if (!confirmResult.valid) {
      confirmPasswordError = confirmResult.error;
    } else if (password.trim() !== confirmPassword.trim()) {
      confirmPasswordError = 'Passwords do not match.';
    }

    const newErrors = {
      name: nameResult.valid ? null : nameResult.error,
      email: emailResult.valid ? null : emailResult.error,
      password: passwordResult.valid ? null : passwordResult.error,
      confirmPassword: confirmPasswordError,
    };

    setErrors(newErrors);

    return (
      nameResult.valid &&
      emailResult.valid &&
      passwordResult.valid &&
      confirmPasswordError === null
    );
  }, [name, email, password, confirmPassword]);

  const handleSubmit = useCallback(
    (e) => {
      e.preventDefault();
      setFormError(null);

      if (!validateForm()) {
        return;
      }

      setIsSubmitting(true);

      try {
        const result = signup(name.trim(), email.trim(), password.trim());

        if (result.success) {
          setToast({ message: 'Account created successfully! Redirecting…', type: 'success', isVisible: true });
          setTimeout(() => {
            navigate('/account', { replace: true });
          }, 500);
        } else {
          setFormError(result.error || 'Signup failed. Please try again.');
          setIsSubmitting(false);
        }
      } catch {
        setFormError('An unexpected error occurred. Please try again.');
        setIsSubmitting(false);
      }
    },
    [name, email, password, signup, navigate, validateForm]
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
          <p className="mt-2 text-sm text-neutral-600">Create your account</p>
        </div>

        {/* Signup Card */}
        <div className="card">
          {/* Demo hint */}
          <div className="mb-6 rounded-md border border-primary-200 bg-primary-50 px-4 py-3">
            <p className="text-sm text-primary-700">
              <strong>Demo:</strong> This is a demo signup – no real account is created.
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
              id="signup-name"
              label="Full Name"
              type="text"
              value={name}
              onChange={handleNameChange}
              error={errors.name}
              required
              disabled={isSubmitting}
              placeholder="Jane Doe"
            />

            <FormField
              id="signup-email"
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
              id="signup-password"
              label="Password"
              type="password"
              value={password}
              onChange={handlePasswordChange}
              error={errors.password}
              required
              disabled={isSubmitting}
              placeholder="Enter your password"
            />

            <FormField
              id="signup-confirm-password"
              label="Confirm Password"
              type="password"
              value={confirmPassword}
              onChange={handleConfirmPasswordChange}
              error={errors.confirmPassword}
              required
              disabled={isSubmitting}
              placeholder="Re-enter your password"
            />

            <button
              type="submit"
              className="btn-primary mt-2 w-full"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Creating account…' : 'Create Account'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-neutral-600">
            Already have an account?{' '}
            <Link to="/login" className="link">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}