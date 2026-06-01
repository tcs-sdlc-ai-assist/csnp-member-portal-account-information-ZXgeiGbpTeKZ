import { useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';

/**
 * Accessible toast notification component for success/error/info messages.
 * Auto-dismisses after 5 seconds. Uses role='alert' and aria-live='polite'
 * for screen reader accessibility.
 *
 * @param {Object} props
 * @param {string} props.message - The notification message to display.
 * @param {'success'|'error'|'info'} [props.type='info'] - The type of notification.
 * @param {boolean} props.isVisible - Whether the toast is currently visible.
 * @param {function} props.onDismiss - Callback invoked when the toast should be dismissed.
 * @returns {JSX.Element|null}
 */
export function Toast({ message, type = 'info', isVisible, onDismiss }) {
  const handleDismiss = useCallback(() => {
    onDismiss();
  }, [onDismiss]);

  useEffect(() => {
    if (!isVisible) {
      return;
    }

    const timer = setTimeout(() => {
      handleDismiss();
    }, 5000);

    return () => {
      clearTimeout(timer);
    };
  }, [isVisible, handleDismiss]);

  if (!isVisible) {
    return null;
  }

  const typeClasses = {
    success: 'border-green-500 bg-green-50 text-green-800',
    error: 'border-red-500 bg-red-50 text-red-800',
    info: 'border-primary-500 bg-primary-50 text-primary-800',
  };

  const iconByType = {
    success: (
      <svg className="h-5 w-5 text-green-500" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    error: (
      <svg className="h-5 w-5 text-red-500" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
      </svg>
    ),
    info: (
      <svg className="h-5 w-5 text-primary-500" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
      </svg>
    ),
  };

  const dismissButtonClasses = {
    success: 'text-green-500 hover:bg-green-100 focus-visible:outline-green-500',
    error: 'text-red-500 hover:bg-red-100 focus-visible:outline-red-500',
    info: 'text-primary-500 hover:bg-primary-100 focus-visible:outline-primary-500',
  };

  const containerClasses = typeClasses[type] || typeClasses.info;
  const icon = iconByType[type] || iconByType.info;
  const dismissClasses = dismissButtonClasses[type] || dismissButtonClasses.info;

  return (
    <div
      role="alert"
      aria-live="polite"
      className={`fixed right-4 top-20 z-50 flex w-full max-w-sm items-start gap-3 rounded-lg border p-4 shadow-md transition-all ${containerClasses}`}
    >
      <div className="flex-shrink-0">{icon}</div>
      <p className="flex-1 text-sm font-medium">{message}</p>
      <button
        type="button"
        className={`inline-flex flex-shrink-0 items-center justify-center rounded-md p-1 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 ${dismissClasses}`}
        onClick={handleDismiss}
        aria-label="Dismiss notification"
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}

Toast.propTypes = {
  message: PropTypes.string.isRequired,
  type: PropTypes.oneOf(['success', 'error', 'info']),
  isVisible: PropTypes.bool.isRequired,
  onDismiss: PropTypes.func.isRequired,
};

export default Toast;