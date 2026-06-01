import { useState, useCallback } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { useSettings } from '../context/SettingsContext.jsx';
import { FormField } from '../components/common/FormField.jsx';
import { Toast } from '../components/common/Toast.jsx';
import { validateRequired } from '../utils/validators.js';

/**
 * Privacy and security settings page.
 * Sections:
 * (1) Change Password – form with current password, new password, confirm new password fields;
 *     submit shows success toast (mocked, no real change).
 * (2) Paperless Delivery – toggle switch with description; persists to SettingsContext.
 * (3) Account Security Info – read-only display of last login date and security tips.
 * All changes call updatePrivacySettings() from SettingsContext.
 *
 * @returns {JSX.Element}
 *
 * @see SCRUM-9275
 * @see SCRUM-9282
 */
export default function PrivacySecurityPage() {
  const { session } = useAuth();
  const { privacySettings, updatePrivacySettings, loading } = useSettings();

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmNewPassword: '',
  });
  const [passwordErrors, setPasswordErrors] = useState({
    currentPassword: null,
    newPassword: null,
    confirmNewPassword: null,
  });
  const [isSubmittingPassword, setIsSubmittingPassword] = useState(false);

  const [toast, setToast] = useState({ message: '', type: 'info', isVisible: false });

  const dismissToast = useCallback(() => {
    setToast((prev) => ({ ...prev, isVisible: false }));
  }, []);

  const handlePasswordChange = useCallback((field) => (e) => {
    setPasswordForm((prev) => ({ ...prev, [field]: e.target.value }));
    setPasswordErrors((prev) => ({ ...prev, [field]: null }));
  }, []);

  const validatePasswordForm = useCallback(() => {
    const currentResult = validateRequired(passwordForm.currentPassword, 'Current password');
    const newResult = validateRequired(passwordForm.newPassword, 'New password');

    let confirmError = null;
    const confirmResult = validateRequired(passwordForm.confirmNewPassword, 'Confirm new password');
    if (!confirmResult.valid) {
      confirmError = confirmResult.error;
    } else if (passwordForm.newPassword.trim() !== passwordForm.confirmNewPassword.trim()) {
      confirmError = 'Passwords do not match.';
    }

    const newErrors = {
      currentPassword: currentResult.valid ? null : currentResult.error,
      newPassword: newResult.valid ? null : newResult.error,
      confirmNewPassword: confirmError,
    };

    setPasswordErrors(newErrors);

    return currentResult.valid && newResult.valid && confirmError === null;
  }, [passwordForm]);

  const handlePasswordSubmit = useCallback(
    (e) => {
      e.preventDefault();

      if (!validatePasswordForm()) {
        return;
      }

      setIsSubmittingPassword(true);

      try {
        // Mock password change – no real change is performed
        setToast({ message: 'Password changed successfully (demo).', type: 'success', isVisible: true });
        setPasswordForm({
          currentPassword: '',
          newPassword: '',
          confirmNewPassword: '',
        });
        setPasswordErrors({
          currentPassword: null,
          newPassword: null,
          confirmNewPassword: null,
        });
      } catch {
        setToast({ message: 'An unexpected error occurred. Please try again.', type: 'error', isVisible: true });
      } finally {
        setIsSubmittingPassword(false);
      }
    },
    [validatePasswordForm]
  );

  const handlePaperlessToggle = useCallback(() => {
    if (!privacySettings) {
      return;
    }

    const newValue = !privacySettings.paperlessDelivery;

    try {
      const result = updatePrivacySettings({ paperlessDelivery: newValue });
      if (result.success) {
        setToast({
          message: newValue
            ? 'Paperless delivery enabled.'
            : 'Paperless delivery disabled.',
          type: 'success',
          isVisible: true,
        });
      } else {
        setToast({
          message: result.error || 'Failed to update paperless delivery setting.',
          type: 'error',
          isVisible: true,
        });
      }
    } catch {
      setToast({ message: 'An unexpected error occurred. Please try again.', type: 'error', isVisible: true });
    }
  }, [privacySettings, updatePrivacySettings]);

  const lastLoginDate = session?.loginTimestamp
    ? new Date(session.loginTimestamp).toLocaleString()
    : 'Unknown';

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-sm text-neutral-500">Loading privacy &amp; security settings…</p>
      </div>
    );
  }

  const paperlessEnabled = privacySettings?.paperlessDelivery === true;

  return (
    <div>
      <Toast
        message={toast.message}
        type={toast.type}
        isVisible={toast.isVisible}
        onDismiss={dismissToast}
      />

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-primary-800">Privacy &amp; Security</h1>
      </div>

      {/* Change Password Section */}
      <div className="card mb-6">
        <h2 className="mb-4 text-lg font-bold text-primary-800">Change Password</h2>
        <div className="mb-4 rounded-md border border-primary-200 bg-primary-50 px-4 py-3">
          <p className="text-sm text-primary-700">
            <strong>Demo:</strong> No real password change is performed. This is for demonstration only.
          </p>
        </div>
        <form onSubmit={handlePasswordSubmit} noValidate>
          <FormField
            id="current-password"
            label="Current Password"
            type="password"
            value={passwordForm.currentPassword}
            onChange={handlePasswordChange('currentPassword')}
            error={passwordErrors.currentPassword}
            required
            disabled={isSubmittingPassword}
            placeholder="Enter current password"
          />

          <FormField
            id="new-password"
            label="New Password"
            type="password"
            value={passwordForm.newPassword}
            onChange={handlePasswordChange('newPassword')}
            error={passwordErrors.newPassword}
            required
            disabled={isSubmittingPassword}
            placeholder="Enter new password"
          />

          <FormField
            id="confirm-new-password"
            label="Confirm New Password"
            type="password"
            value={passwordForm.confirmNewPassword}
            onChange={handlePasswordChange('confirmNewPassword')}
            error={passwordErrors.confirmNewPassword}
            required
            disabled={isSubmittingPassword}
            placeholder="Re-enter new password"
          />

          <div className="flex items-center justify-end pt-2">
            <button
              type="submit"
              className="btn-primary"
              disabled={isSubmittingPassword}
            >
              {isSubmittingPassword ? 'Changing…' : 'Change Password'}
            </button>
          </div>
        </form>
      </div>

      {/* Paperless Delivery Section */}
      <div className="card mb-6">
        <h2 className="mb-4 text-lg font-bold text-primary-800">Paperless Delivery</h2>
        <div className="flex items-center justify-between gap-4">
          <div className="flex-1">
            <p className="text-sm font-medium text-neutral-700">
              Enable paperless delivery
            </p>
            <p className="mt-1 text-xs text-neutral-500">
              Receive all documents, statements, and notices electronically instead of by mail.
              This helps reduce paper waste and ensures faster delivery.
            </p>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={paperlessEnabled}
            aria-label="Toggle paperless delivery"
            className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500 ${
              paperlessEnabled ? 'bg-primary-500' : 'bg-neutral-300'
            }`}
            onClick={handlePaperlessToggle}
          >
            <span
              aria-hidden="true"
              className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                paperlessEnabled ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>
      </div>

      {/* Account Security Info Section */}
      <div className="card">
        <h2 className="mb-4 text-lg font-bold text-primary-800">Account Security Info</h2>
        <dl className="divide-y divide-neutral-200">
          <div className="flex flex-col py-3 sm:flex-row sm:gap-4">
            <dt className="text-sm font-medium text-neutral-500 sm:w-40 sm:flex-shrink-0">Last Login</dt>
            <dd className="mt-1 text-sm text-neutral-900 sm:mt-0">{lastLoginDate}</dd>
          </div>
          <div className="flex flex-col py-3 sm:flex-row sm:gap-4">
            <dt className="text-sm font-medium text-neutral-500 sm:w-40 sm:flex-shrink-0">HIPAA Acknowledged</dt>
            <dd className="mt-1 text-sm text-neutral-900 sm:mt-0">
              {privacySettings?.hipaaAcknowledged ? 'Yes' : 'No'}
            </dd>
          </div>
          <div className="flex flex-col py-3 sm:flex-row sm:gap-4">
            <dt className="text-sm font-medium text-neutral-500 sm:w-40 sm:flex-shrink-0">Data Sharing</dt>
            <dd className="mt-1 text-sm text-neutral-900 sm:mt-0">
              {privacySettings?.shareDataWithProviders ? 'Enabled' : 'Disabled'}
            </dd>
          </div>
          <div className="flex flex-col py-3 sm:flex-row sm:gap-4">
            <dt className="text-sm font-medium text-neutral-500 sm:w-40 sm:flex-shrink-0">Analytics</dt>
            <dd className="mt-1 text-sm text-neutral-900 sm:mt-0">
              {privacySettings?.allowAnalytics ? 'Enabled' : 'Disabled'}
            </dd>
          </div>
        </dl>

        <div className="mt-6 rounded-md border border-primary-200 bg-primary-50 px-4 py-3">
          <h3 className="text-sm font-semibold text-primary-800">Security Tips</h3>
          <ul className="mt-2 list-inside list-disc space-y-1 text-sm text-primary-700">
            <li>Use a strong, unique password that includes letters, numbers, and symbols.</li>
            <li>Never share your login credentials with anyone.</li>
            <li>Log out of your account when using shared or public devices.</li>
            <li>Review your account activity regularly for any unauthorized access.</li>
            <li>Keep your contact information up to date for account recovery.</li>
          </ul>
        </div>
      </div>
    </div>
  );
}