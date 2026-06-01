import { useState, useCallback } from 'react';
import { useSettings } from '../context/SettingsContext.jsx';
import { FormField } from '../components/common/FormField.jsx';
import { Toast } from '../components/common/Toast.jsx';
import { validateName, validateEmail, validatePhone, validateAddress } from '../utils/validators.js';

/**
 * Account information management page.
 * Displays member info (Name, Address, Email, Phone, Member ID) in a card layout.
 * Toggles between view and edit modes. In view mode, shows data in read-only format.
 * In edit mode, renders FormField inputs for each editable field with validation.
 * Member ID is always read-only. Save calls updateAccountInfo() from SettingsContext.
 * Cancel reverts to view mode without saving. Shows success/error toast on save.
 *
 * @returns {JSX.Element}
 *
 * @see SCRUM-9277
 * @see SCRUM-9280
 */
export default function AccountInfoPage() {
  const { accountInfo, updateAccountInfo, loading } = useSettings();

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    email: '',
    phone: '',
  });
  const [errors, setErrors] = useState({
    name: null,
    address: null,
    email: null,
    phone: null,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState({ message: '', type: 'info', isVisible: false });

  const dismissToast = useCallback(() => {
    setToast((prev) => ({ ...prev, isVisible: false }));
  }, []);

  const handleEdit = useCallback(() => {
    if (accountInfo) {
      setFormData({
        name: accountInfo.name || '',
        address: accountInfo.address || '',
        email: accountInfo.email || '',
        phone: accountInfo.phone || '',
      });
      setErrors({ name: null, address: null, email: null, phone: null });
    }
    setIsEditing(true);
  }, [accountInfo]);

  const handleCancel = useCallback(() => {
    setIsEditing(false);
    setErrors({ name: null, address: null, email: null, phone: null });
  }, []);

  const handleChange = useCallback((field) => (e) => {
    setFormData((prev) => ({ ...prev, [field]: e.target.value }));
    setErrors((prev) => ({ ...prev, [field]: null }));
  }, []);

  const validateForm = useCallback(() => {
    const nameResult = validateName(formData.name);
    const emailResult = validateEmail(formData.email);
    const phoneResult = validatePhone(formData.phone);
    const addressResult = validateAddress(formData.address);

    const newErrors = {
      name: nameResult.valid ? null : nameResult.error,
      email: emailResult.valid ? null : emailResult.error,
      phone: phoneResult.valid ? null : phoneResult.error,
      address: addressResult.valid ? null : addressResult.error,
    };

    setErrors(newErrors);

    return nameResult.valid && emailResult.valid && phoneResult.valid && addressResult.valid;
  }, [formData]);

  const handleSave = useCallback(
    (e) => {
      e.preventDefault();

      if (!validateForm()) {
        return;
      }

      setIsSubmitting(true);

      try {
        const result = updateAccountInfo({
          name: formData.name.trim(),
          address: formData.address.trim(),
          email: formData.email.trim(),
          phone: formData.phone.trim(),
        });

        if (result.success) {
          setToast({ message: 'Account information updated successfully.', type: 'success', isVisible: true });
          setIsEditing(false);
        } else {
          setToast({ message: result.error || 'Failed to update account information.', type: 'error', isVisible: true });
        }
      } catch {
        setToast({ message: 'An unexpected error occurred. Please try again.', type: 'error', isVisible: true });
      } finally {
        setIsSubmitting(false);
      }
    },
    [formData, updateAccountInfo, validateForm]
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-sm text-neutral-500">Loading account information…</p>
      </div>
    );
  }

  if (!accountInfo) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-sm text-neutral-500">No account information available.</p>
      </div>
    );
  }

  return (
    <div>
      <Toast
        message={toast.message}
        type={toast.type}
        isVisible={toast.isVisible}
        onDismiss={dismissToast}
      />

      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-primary-800">Account Information</h1>
        {!isEditing && (
          <button
            type="button"
            className="btn-primary"
            onClick={handleEdit}
          >
            Edit
          </button>
        )}
      </div>

      <div className="card">
        {isEditing ? (
          <form onSubmit={handleSave} noValidate>
            <FormField
              id="account-name"
              label="Name"
              type="text"
              value={formData.name}
              onChange={handleChange('name')}
              error={errors.name}
              required
              disabled={isSubmitting}
              placeholder="Full name"
            />

            <FormField
              id="account-address"
              label="Address"
              type="text"
              value={formData.address}
              onChange={handleChange('address')}
              error={errors.address}
              required
              disabled={isSubmitting}
              placeholder="Street address, city, state, zip"
            />

            <FormField
              id="account-email"
              label="Email"
              type="email"
              value={formData.email}
              onChange={handleChange('email')}
              error={errors.email}
              required
              disabled={isSubmitting}
              placeholder="you@example.com"
            />

            <FormField
              id="account-phone"
              label="Phone"
              type="tel"
              value={formData.phone}
              onChange={handleChange('phone')}
              error={errors.phone}
              required
              disabled={isSubmitting}
              placeholder="555-123-4567"
            />

            <div className="mb-4">
              <label htmlFor="account-member-id" className="label mb-1">
                Member ID
              </label>
              <input
                id="account-member-id"
                type="text"
                className="input-field"
                value={accountInfo.memberId}
                disabled
                readOnly
              />
              <p className="mt-1 text-xs text-neutral-500">Member ID cannot be changed.</p>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                className="btn-outline"
                onClick={handleCancel}
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn-primary"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Saving…' : 'Save'}
              </button>
            </div>
          </form>
        ) : (
          <dl className="divide-y divide-neutral-200">
            <div className="flex flex-col py-3 sm:flex-row sm:gap-4">
              <dt className="text-sm font-medium text-neutral-500 sm:w-40 sm:flex-shrink-0">Name</dt>
              <dd className="mt-1 text-sm text-neutral-900 sm:mt-0">{accountInfo.name}</dd>
            </div>
            <div className="flex flex-col py-3 sm:flex-row sm:gap-4">
              <dt className="text-sm font-medium text-neutral-500 sm:w-40 sm:flex-shrink-0">Address</dt>
              <dd className="mt-1 text-sm text-neutral-900 sm:mt-0">{accountInfo.address}</dd>
            </div>
            <div className="flex flex-col py-3 sm:flex-row sm:gap-4">
              <dt className="text-sm font-medium text-neutral-500 sm:w-40 sm:flex-shrink-0">Email</dt>
              <dd className="mt-1 text-sm text-neutral-900 sm:mt-0">{accountInfo.email}</dd>
            </div>
            <div className="flex flex-col py-3 sm:flex-row sm:gap-4">
              <dt className="text-sm font-medium text-neutral-500 sm:w-40 sm:flex-shrink-0">Phone</dt>
              <dd className="mt-1 text-sm text-neutral-900 sm:mt-0">{accountInfo.phone}</dd>
            </div>
            <div className="flex flex-col py-3 sm:flex-row sm:gap-4">
              <dt className="text-sm font-medium text-neutral-500 sm:w-40 sm:flex-shrink-0">Member ID</dt>
              <dd className="mt-1 text-sm text-neutral-900 sm:mt-0">{accountInfo.memberId}</dd>
            </div>
          </dl>
        )}
      </div>
    </div>
  );
}