import PropTypes from 'prop-types';

/**
 * Row component for a single notification category preference.
 * Displays the category name and radio buttons for channel selection
 * (Text, Email, Both, None). Uses fieldset/legend for accessibility.
 * Styled as a table-like row with Tailwind.
 *
 * @param {Object} props
 * @param {string} props.category - The notification category name.
 * @param {string} props.selectedChannel - The currently selected channel ('Text', 'Email', 'Both', or '').
 * @param {function} props.onChange - Callback invoked with the new channel value when selection changes.
 * @returns {JSX.Element}
 *
 * @see SCRUM-9273
 * @see SCRUM-9283
 */
export function NotificationPreferenceRow({ category, selectedChannel, onChange }) {
  const channelOptions = [
    { value: 'Text', label: 'Text' },
    { value: 'Email', label: 'Email' },
    { value: 'Both', label: 'Both' },
    { value: '', label: 'None' },
  ];

  const groupName = `notification-channel-${category.replace(/\s+/g, '-').toLowerCase()}`;

  return (
    <fieldset className="flex flex-col gap-2 border-b border-neutral-200 py-3 last:border-b-0 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
      <legend className="sr-only">
        Notification channel for {category}
      </legend>
      <span className="text-sm font-medium text-neutral-700 sm:w-48 sm:flex-shrink-0">
        {category}
      </span>
      <div className="flex flex-wrap items-center gap-4">
        {channelOptions.map((option) => {
          const inputId = `${groupName}-${option.value || 'none'}`;
          const isSelected = selectedChannel === option.value;

          return (
            <label
              key={option.value}
              htmlFor={inputId}
              className={`inline-flex cursor-pointer items-center gap-1.5 rounded-md px-2 py-1 text-sm transition-colors ${
                isSelected
                  ? 'bg-primary-50 font-semibold text-primary-700'
                  : 'text-neutral-600 hover:bg-neutral-100'
              }`}
            >
              <input
                id={inputId}
                type="radio"
                name={groupName}
                value={option.value}
                checked={isSelected}
                onChange={() => onChange(option.value)}
                className="h-4 w-4 border-neutral-300 text-primary-500 focus:ring-2 focus:ring-primary-500"
                aria-label={`${option.label} for ${category}`}
              />
              {option.label}
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}

NotificationPreferenceRow.propTypes = {
  category: PropTypes.string.isRequired,
  selectedChannel: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
};

export default NotificationPreferenceRow;