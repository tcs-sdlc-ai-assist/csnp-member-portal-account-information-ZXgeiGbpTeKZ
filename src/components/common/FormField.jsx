import PropTypes from 'prop-types';

/**
 * Reusable accessible form field component.
 * Renders label, input (text/email/tel/password/select/textarea), error message,
 * and help text with proper accessibility attributes.
 *
 * @param {Object} props
 * @param {string} props.id - Unique identifier for the input element.
 * @param {string} props.label - Label text for the input.
 * @param {'text'|'email'|'tel'|'password'|'select'|'textarea'} [props.type='text'] - The input type.
 * @param {string} [props.value=''] - The current value of the input.
 * @param {function} props.onChange - Change handler for the input.
 * @param {string|null} [props.error=null] - Error message to display below the input.
 * @param {string} [props.helpText=''] - Help text displayed below the input.
 * @param {boolean} [props.required=false] - Whether the field is required.
 * @param {boolean} [props.disabled=false] - Whether the field is disabled.
 * @param {Array<{value: string, label: string}>} [props.options=[]] - Options for select type.
 * @param {string} [props.ariaDescribedBy=''] - Additional aria-describedby ID(s).
 * @param {string} [props.placeholder=''] - Placeholder text for the input.
 * @returns {JSX.Element}
 */
export function FormField({
  id,
  label,
  type = 'text',
  value = '',
  onChange,
  error = null,
  helpText = '',
  required = false,
  disabled = false,
  options = [],
  ariaDescribedBy = '',
  placeholder = '',
}) {
  const errorId = error ? `${id}-error` : '';
  const helpTextId = helpText ? `${id}-help` : '';

  const describedByParts = [
    errorId,
    helpTextId,
    ariaDescribedBy,
  ].filter(Boolean);

  const describedBy = describedByParts.length > 0 ? describedByParts.join(' ') : undefined;

  const hasError = Boolean(error);

  const inputClasses = hasError
    ? 'input-field border-red-500 focus:border-red-500 focus:ring-red-500'
    : 'input-field';

  const renderInput = () => {
    const sharedProps = {
      id,
      name: id,
      value,
      onChange,
      disabled,
      required,
      'aria-invalid': hasError ? true : undefined,
      'aria-describedby': describedBy,
    };

    if (type === 'select') {
      return (
        <select className={inputClasses} {...sharedProps}>
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      );
    }

    if (type === 'textarea') {
      return (
        <textarea
          className={inputClasses}
          rows={4}
          placeholder={placeholder}
          {...sharedProps}
        />
      );
    }

    return (
      <input
        type={type}
        className={inputClasses}
        placeholder={placeholder}
        {...sharedProps}
      />
    );
  };

  return (
    <div className="mb-4">
      <label htmlFor={id} className="label mb-1">
        {label}
        {required && <span className="ml-1 text-red-500" aria-hidden="true">*</span>}
      </label>
      {renderInput()}
      {hasError && (
        <p id={errorId} className="mt-1 text-sm text-red-600" role="alert">
          {error}
        </p>
      )}
      {helpText && (
        <p id={helpTextId} className="mt-1 text-xs text-neutral-500">
          {helpText}
        </p>
      )}
    </div>
  );
}

FormField.propTypes = {
  id: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  type: PropTypes.oneOf(['text', 'email', 'tel', 'password', 'select', 'textarea']),
  value: PropTypes.string,
  onChange: PropTypes.func.isRequired,
  error: PropTypes.string,
  helpText: PropTypes.string,
  required: PropTypes.bool,
  disabled: PropTypes.bool,
  options: PropTypes.arrayOf(
    PropTypes.shape({
      value: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired,
    })
  ),
  ariaDescribedBy: PropTypes.string,
  placeholder: PropTypes.string,
};

export default FormField;