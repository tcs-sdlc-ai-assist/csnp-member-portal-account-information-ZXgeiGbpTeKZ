import { useState, useCallback, useEffect } from 'react';
import { useSettings } from '../context/SettingsContext.jsx';
import { FormField } from '../components/common/FormField.jsx';
import { NotificationPreferenceRow } from '../components/communication/NotificationPreferenceRow.jsx';
import { Toast } from '../components/common/Toast.jsx';
import { validateEmail } from '../utils/validators.js';
import { NOTIFICATION_CATEGORIES } from '../constants.js';

/**
 * Communication preferences management page.
 * Sections:
 * (1) Paperless Delivery – toggle with verified email display and edit capability (mocked).
 * (2) Delivery Email – editable email field for paperless documents.
 * (3) Notification Preferences – table/list of categories (Coverage Info, Processed Requests,
 *     Health & Wellness) each with NotificationPreferenceRow for Text/Email/Both/None selection.
 * Save button persists all changes via updateCommunicationPrefs() from SettingsContext.
 * Shows demo hint that no real notifications are sent.
 *
 * @returns {JSX.Element}
 *
 * @see SCRUM-9273
 * @see SCRUM-9283
 */
export default function CommunicationPreferencesPage() {
  const {
    accountInfo,
    privacySettings,
    communicationPrefs,
    updateCommunicationPrefs,
    updatePrivacySettings,
    updateAccountInfo,
    loading,
  } = useSettings();

  const [notificationPrefs, setNotificationPrefs] = useState([]);
  const [deliveryEmail, setDeliveryEmail] = useState('');
  const [isEditingEmail, setIsEditingEmail] = useState(false);
  const [emailError, setEmailError] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [toast, setToast] = useState({ message: '', type: 'info', isVisible: false });

  useEffect(() => {
    if (communicationPrefs && communicationPrefs.length > 0) {
      setNotificationPrefs(communicationPrefs.map((pref) => ({ ...pref })));
    }
  }, [communicationPrefs]);

  useEffect(() => {
    if (accountInfo) {
      setDeliveryEmail(accountInfo.email || '');
    }
  }, [accountInfo]);

  const dismissToast = useCallback(() => {
    setToast((prev) => ({ ...prev, isVisible: false }));
  }, []);

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

  const handleEditEmail = useCallback(() => {
    setIsEditingEmail(true);
    setEmailError(null);
  }, []);

  const handleCancelEditEmail = useCallback(() => {
    setIsEditingEmail(false);
    setEmailError(null);
    if (accountInfo) {
      setDeliveryEmail(accountInfo.email || '');
    }
  }, [accountInfo]);

  const handleEmailChange = useCallback((e) => {
    setDeliveryEmail(e.target.value);
    setEmailError(null);
  }, []);

  const handleSaveEmail = useCallback(() => {
    const emailResult = validateEmail(deliveryEmail);
    if (!emailResult.valid) {
      setEmailError(emailResult.error);
      return;
    }

    try {
      const result = updateAccountInfo({ email: deliveryEmail.trim() });
      if (result.success) {
        setToast({ message: 'Delivery email updated successfully.', type: 'success', isVisible: true });
        setIsEditingEmail(false);
        setEmailError(null);
      } else {
        setToast({ message: result.error || 'Failed to update delivery email.', type: 'error', isVisible: true });
      }
    } catch {
      setToast({ message: 'An unexpected error occurred. Please try again.', type: 'error', isVisible: true });
    }
  }, [deliveryEmail, updateAccountInfo]);

  const handleChannelChange = useCallback((category, newChannel) => {
    setNotificationPrefs((prev) =>
      prev.map((pref) =>
        pref.category === category
          ? { ...pref, channel: newChannel, enabled: newChannel !== '' }
          : pref
      )
    );
  }, []);

  const handleSavePreferences = useCallback(() => {
    setIsSaving(true);

    try {
      const result = updateCommunicationPrefs(notificationPrefs);
      if (result.success) {
        setToast({ message: 'Notification preferences saved successfully.', type: 'success', isVisible: true });
      } else {
        setToast({ message: result.error || 'Failed to save notification preferences.', type: 'error', isVisible: true });
      }
    } catch {
      setToast({ message: 'An unexpected error occurred. Please try again.', type: 'error', isVisible: true });
    } finally {
      setIsSaving(false);
    }
  }, [notificationPrefs, updateCommunicationPrefs]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-sm text-neutral-500">Loading communication preferences…</p>
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
        <h1 className="text-2xl font-bold text-primary-800">Communication Preferences</h1>
      </div>

      {/* Demo hint */}
      <div className="mb-6 rounded-md border border-primary-200 bg-primary-50 px-4 py-3">
        <p className="text-sm text-primary-700">
          <strong>Demo:</strong> No real notifications are sent. All preferences shown are for demonstration purposes only.
        </p>
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

      {/* Delivery Email Section */}
      <div className="card mb-6">
        <h2 className="mb-4 text-lg font-bold text-primary-800">Delivery Email</h2>
        <p className="mb-4 text-sm text-neutral-600">
          This email address will be used for paperless document delivery and notification messages.
        </p>
        {isEditingEmail ? (
          <div>
            <FormField
              id="delivery-email"
              label="Email Address"
              type="email"
              value={deliveryEmail}
              onChange={handleEmailChange}
              error={emailError}
              required
              placeholder="you@example.com"
            />
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                className="btn-outline"
                onClick={handleCancelEditEmail}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn-primary"
                onClick={handleSaveEmail}
              >
                Save Email
              </button>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-neutral-700">
                {accountInfo?.email || 'No email set'}
              </p>
              <p className="mt-1 text-xs text-neutral-500">
                Verified (demo)
              </p>
            </div>
            <button
              type="button"
              className="btn-outline text-sm"
              onClick={handleEditEmail}
            >
              Edit
            </button>
          </div>
        )}
      </div>

      {/* Notification Preferences Section */}
      <div className="card">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-primary-800">Notification Preferences</h2>
        </div>
        <p className="mb-4 text-sm text-neutral-600">
          Choose how you would like to receive notifications for each category.
        </p>

        <div className="mb-6">
          {NOTIFICATION_CATEGORIES.map((category) => {
            const pref = notificationPrefs.find((p) => p.category === category);
            const selectedChannel = pref ? pref.channel : '';

            return (
              <NotificationPreferenceRow
                key={category}
                category={category}
                selectedChannel={selectedChannel}
                onChange={(newChannel) => handleChannelChange(category, newChannel)}
              />
            );
          })}
        </div>

        <div className="flex items-center justify-end pt-2">
          <button
            type="button"
            className="btn-primary"
            onClick={handleSavePreferences}
            disabled={isSaving}
          >
            {isSaving ? 'Saving…' : 'Save Preferences'}
          </button>
        </div>
      </div>
    </div>
  );
}