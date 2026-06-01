import { useEffect, useRef, useCallback } from 'react';
import PropTypes from 'prop-types';

/**
 * Reusable accessible modal dialog component.
 * Implements focus trap, Escape key to close, aria-modal, role='dialog',
 * aria-labelledby. Overlay click closes modal.
 *
 * @param {Object} props
 * @param {boolean} props.isOpen - Whether the modal is currently open.
 * @param {function} props.onClose - Callback invoked when the modal should close.
 * @param {string} props.title - The title displayed in the modal header.
 * @param {React.ReactNode} props.children - The modal body content.
 * @param {string} [props.confirmLabel='Confirm'] - Label for the confirm/primary action button.
 * @param {function} [props.onConfirm=null] - Callback invoked when the confirm button is clicked.
 * @returns {JSX.Element|null}
 */
export function Modal({
  isOpen,
  onClose,
  title,
  children,
  confirmLabel = 'Confirm',
  onConfirm = null,
}) {
  const modalRef = useRef(null);
  const previousActiveElementRef = useRef(null);

  const getFocusableElements = useCallback(() => {
    if (!modalRef.current) {
      return [];
    }
    const selectors = [
      'a[href]',
      'button:not([disabled])',
      'textarea:not([disabled])',
      'input:not([disabled])',
      'select:not([disabled])',
      '[tabindex]:not([tabindex="-1"])',
    ];
    return Array.from(modalRef.current.querySelectorAll(selectors.join(', ')));
  }, []);

  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        onClose();
        return;
      }

      if (e.key === 'Tab') {
        const focusableElements = getFocusableElements();
        if (focusableElements.length === 0) {
          e.preventDefault();
          return;
        }

        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            e.preventDefault();
            lastElement.focus();
          }
        } else {
          if (document.activeElement === lastElement) {
            e.preventDefault();
            firstElement.focus();
          }
        }
      }
    },
    [onClose, getFocusableElements]
  );

  useEffect(() => {
    if (isOpen) {
      previousActiveElementRef.current = document.activeElement;
      document.body.style.overflow = 'hidden';

      const timer = setTimeout(() => {
        const focusableElements = getFocusableElements();
        if (focusableElements.length > 0) {
          focusableElements[0].focus();
        } else if (modalRef.current) {
          modalRef.current.focus();
        }
      }, 0);

      return () => {
        clearTimeout(timer);
        document.body.style.overflow = '';
        if (previousActiveElementRef.current && typeof previousActiveElementRef.current.focus === 'function') {
          previousActiveElementRef.current.focus();
        }
      };
    }
  }, [isOpen, getFocusableElements]);

  const handleOverlayClick = useCallback(
    (e) => {
      if (e.target === e.currentTarget) {
        onClose();
      }
    },
    [onClose]
  );

  if (!isOpen) {
    return null;
  }

  const titleId = 'modal-title';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={handleOverlayClick}
      aria-hidden="false"
    >
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        onKeyDown={handleKeyDown}
        tabIndex={-1}
        className="card relative mx-auto w-full max-w-md shadow-lg focus:outline-none"
      >
        {/* Header */}
        <div className="mb-4 flex items-center justify-between">
          <h2 id={titleId} className="text-lg font-bold text-primary-800">
            {title}
          </h2>
          <button
            type="button"
            className="inline-flex items-center justify-center rounded-md p-1 text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-neutral-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500"
            onClick={onClose}
            aria-label="Close dialog"
          >
            <svg
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="1.5"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="mb-6 text-sm text-neutral-700">{children}</div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3">
          <button
            type="button"
            className="btn-outline"
            onClick={onClose}
          >
            Cancel
          </button>
          {onConfirm && (
            <button
              type="button"
              className="btn-primary"
              onClick={onConfirm}
            >
              {confirmLabel}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

Modal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  title: PropTypes.string.isRequired,
  children: PropTypes.node.isRequired,
  confirmLabel: PropTypes.string,
  onConfirm: PropTypes.func,
};

export default Modal;