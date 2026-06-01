import { useState, useCallback } from 'react';
import PropTypes from 'prop-types';
import { FormField } from '../common/FormField.jsx';
import { validateName, validateEmail, validatePhone, validateRequired } from '../../utils/validators.js';

const RELATIONSHIP_OPTIONS = [
  { value: 'Spouse', label: 'Spouse' },
  { value: 'Parent', label: 'Parent' },
  { value: 'Child', label: 'Child' },
  { value: 'Legal Guardian', label: 'Legal Guardian' },
  { value: 'Power of Attorney', label: 'Power of Attorney' },
  { value: 'Other', label: 'Other' },
];

/**
 * Form component for adding or editing an authorized representative.
 * Fields: name (required), relationship (required dropdown), phone, email.
 * Uses FormField components with validation. Validates required fields before submission.
 *
 * @param {Object} props
 * @param {{ name?: string, relationship?: string, phone?: string, email?: string }|null} props.initialData - Null for add mode, object for edit mode.
 * @param {function} props.onSubmit - Callback invoked with form data on valid submission.
 * @param {function} props.onCancel - Callback invoked when the cancel button is clicked.
 * @returns {JSX.Element}
 *
 * @see SCRUM-9276
 * @see SCRUM-9281
 */
export function RepresentativeForm({ initialData = null, onSubmit, onCancel }) {
  const isEditMode = initialData !== null && initialData !== undefined;

  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    relationship: initialData?.relationship || '',
    phone: initialData?.phone || '',
    email: initialData?.email || '',
  });

  const [errors, setErrors] = useState({
    name: null,
    relationship: null,
    phone: null,
    email: null,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = useCallback((field) => (e) => {
    setFormData((prev) => ({ ...prev, [field]: e.target.value }));
    setErrors((prev) => ({ ...prev, [field]: null }));
  }, []);

  const validateForm = useCallback(() => {
    const nameResult = validateName(formData.name);
    const relationshipResult = validateRequired(formData.relationship, 'Relationship');

    let phoneError = null;
    if (formData.phone && formData.phone.trim().length > 0) {
      const phoneResult = validatePhone(formData.phone);
      if (!phoneResult.valid) {
        phoneError = phoneResult.error;
      }
    }

    let emailError = null;
    if (formData.email && formData.email.trim().length > 0) {
      const emailResult = validateEmail(formData.email);
      if (!emailResult.valid) {
        emailError = emailResult.error;
      }
    }

    const newErrors = {
      name: nameResult.valid ? null : nameResult.error,
      relationship: relationshipResult.valid ? null : relationshipResult.error,
      phone: phoneError,
      email: emailError,
    };

    setErrors(newErrors);

    return (
      nameResult.valid &&
      relationshipResult.valid &&
      phoneError === null &&
      emailError === null
    );
  }, [formData]);

  const handleSubmit = useCallback(
    (e) => {
      e.preventDefault();

      if (!validateForm()) {
        return;
      }

      setIsSubmitting(true);

      try {
        onSubmit({
          name: formData.name.trim(),
          relationship: formData.relationship.trim(),
          phone: formData.phone.trim(),
          email: formData.email.trim(),
        });
      } finally {
        setIsSubmitting(false);
      }
    },
    [formData, onSubmit, validateForm]
  );

  return (
    <form onSubmit={handleSubmit} noValidate>
      <FormField
        id="rep-name"
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
        id="rep-relationship"
        label="Relationship"
        type="select"
        value={formData.relationship}
        onChange={handleChange('relationship')}
        error={errors.relationship}
        required
        disabled={isSubmitting}
        options={RELATIONSHIP_OPTIONS}
        placeholder="Select relationship"
      />

      <FormField
        id="rep-phone"
        label="Phone"
        type="tel"
        value={formData.phone}
        onChange={handleChange('phone')}
        error={errors.phone}
        disabled={isSubmitting}
        placeholder="555-123-4567"
      />

      <FormField
        id="rep-email"
        label="Email"
        type="email"
        value={formData.email}
        onChange={handleChange('email')}
        error={errors.email}
        disabled={isSubmitting}
        placeholder="you@example.com"
      />

      <div className="flex items-center justify-end gap-3 pt-2">
        <button
          type="button"
          className="btn-outline"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          Cancel
        </button>
        <button
          type="submit"
          className="btn-primary"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Saving…' : isEditMode ? 'Save Changes' : 'Add Representative'}
        </button>
      </div>
    </form>
  );
}

RepresentativeForm.propTypes = {
  initialData: PropTypes.shape({
    name: PropTypes.string,
    relationship: PropTypes.string,
    phone: PropTypes.string,
    email: PropTypes.string,
  }),
  onSubmit: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
};

export default RepresentativeForm;