import { useState, useCallback } from 'react';
import { useSettings } from '../context/SettingsContext.jsx';
import { RepresentativeForm } from '../components/representatives/RepresentativeForm.jsx';
import { Modal } from '../components/common/Modal.jsx';
import { Toast } from '../components/common/Toast.jsx';

/**
 * Representatives management page.
 * Displays list of authorized representatives with edit/remove actions.
 * 'Add Representative' button shows RepresentativeForm in add mode.
 * Edit action shows RepresentativeForm in edit mode.
 * Remove action shows confirmation Modal before deleting.
 * Shows empty state message when no representatives exist.
 * Success/error toasts on all operations.
 *
 * @returns {JSX.Element}
 *
 * @see SCRUM-9276
 * @see SCRUM-9281
 */
export default function RepresentativesPage() {
  const {
    representatives,
    addRepresentative,
    editRepresentative,
    removeRepresentative,
    loading,
  } = useSettings();

  const [isAdding, setIsAdding] = useState(false);
  const [editingRep, setEditingRep] = useState(null);
  const [removingRep, setRemovingRep] = useState(null);
  const [toast, setToast] = useState({ message: '', type: 'info', isVisible: false });

  const dismissToast = useCallback(() => {
    setToast((prev) => ({ ...prev, isVisible: false }));
  }, []);

  const handleAddClick = useCallback(() => {
    setIsAdding(true);
    setEditingRep(null);
  }, []);

  const handleCancelAdd = useCallback(() => {
    setIsAdding(false);
  }, []);

  const handleAddSubmit = useCallback(
    (data) => {
      try {
        const result = addRepresentative(data);
        if (result.success) {
          setToast({ message: 'Representative added successfully.', type: 'success', isVisible: true });
          setIsAdding(false);
        } else {
          setToast({ message: result.error || 'Failed to add representative.', type: 'error', isVisible: true });
        }
      } catch {
        setToast({ message: 'An unexpected error occurred. Please try again.', type: 'error', isVisible: true });
      }
    },
    [addRepresentative]
  );

  const handleEditClick = useCallback((rep) => {
    setEditingRep(rep);
    setIsAdding(false);
  }, []);

  const handleCancelEdit = useCallback(() => {
    setEditingRep(null);
  }, []);

  const handleEditSubmit = useCallback(
    (data) => {
      if (!editingRep) {
        return;
      }

      try {
        const result = editRepresentative(editingRep.id, data);
        if (result.success) {
          setToast({ message: 'Representative updated successfully.', type: 'success', isVisible: true });
          setEditingRep(null);
        } else {
          setToast({ message: result.error || 'Failed to update representative.', type: 'error', isVisible: true });
        }
      } catch {
        setToast({ message: 'An unexpected error occurred. Please try again.', type: 'error', isVisible: true });
      }
    },
    [editingRep, editRepresentative]
  );

  const handleRemoveClick = useCallback((rep) => {
    setRemovingRep(rep);
  }, []);

  const handleCancelRemove = useCallback(() => {
    setRemovingRep(null);
  }, []);

  const handleConfirmRemove = useCallback(() => {
    if (!removingRep) {
      return;
    }

    try {
      const result = removeRepresentative(removingRep.id);
      if (result.success) {
        setToast({ message: 'Representative removed successfully.', type: 'success', isVisible: true });
        setRemovingRep(null);
      } else {
        setToast({ message: result.error || 'Failed to remove representative.', type: 'error', isVisible: true });
        setRemovingRep(null);
      }
    } catch {
      setToast({ message: 'An unexpected error occurred. Please try again.', type: 'error', isVisible: true });
      setRemovingRep(null);
    }
  }, [removingRep, removeRepresentative]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-sm text-neutral-500">Loading representatives…</p>
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

      <Modal
        isOpen={removingRep !== null}
        onClose={handleCancelRemove}
        title="Remove Representative"
        confirmLabel="Remove"
        onConfirm={handleConfirmRemove}
      >
        <p>
          Are you sure you want to remove{' '}
          <strong>{removingRep?.name}</strong> as an authorized representative?
          This action cannot be undone.
        </p>
      </Modal>

      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-primary-800">Authorized Representatives</h1>
        {!isAdding && !editingRep && (
          <button
            type="button"
            className="btn-primary"
            onClick={handleAddClick}
          >
            Add Representative
          </button>
        )}
      </div>

      {isAdding && (
        <div className="card mb-6">
          <h2 className="mb-4 text-lg font-bold text-primary-800">Add Representative</h2>
          <RepresentativeForm
            initialData={null}
            onSubmit={handleAddSubmit}
            onCancel={handleCancelAdd}
          />
        </div>
      )}

      {editingRep && (
        <div className="card mb-6">
          <h2 className="mb-4 text-lg font-bold text-primary-800">Edit Representative</h2>
          <RepresentativeForm
            initialData={editingRep}
            onSubmit={handleEditSubmit}
            onCancel={handleCancelEdit}
          />
        </div>
      )}

      {representatives.length === 0 && !isAdding ? (
        <div className="card text-center">
          <svg
            className="mx-auto h-12 w-12 text-neutral-400"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="1.5"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z"
            />
          </svg>
          <p className="mt-4 text-sm text-neutral-500">
            No authorized representatives have been added yet.
          </p>
          <button
            type="button"
            className="btn-primary mt-4"
            onClick={handleAddClick}
          >
            Add Representative
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {representatives.map((rep) => (
            <div key={rep.id} className="card">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <dl className="flex-1 divide-y divide-neutral-200">
                  <div className="flex flex-col py-2 sm:flex-row sm:gap-4">
                    <dt className="text-sm font-medium text-neutral-500 sm:w-32 sm:flex-shrink-0">Name</dt>
                    <dd className="mt-1 text-sm text-neutral-900 sm:mt-0">{rep.name}</dd>
                  </div>
                  <div className="flex flex-col py-2 sm:flex-row sm:gap-4">
                    <dt className="text-sm font-medium text-neutral-500 sm:w-32 sm:flex-shrink-0">Relationship</dt>
                    <dd className="mt-1 text-sm text-neutral-900 sm:mt-0">{rep.relationship}</dd>
                  </div>
                  {rep.phone && (
                    <div className="flex flex-col py-2 sm:flex-row sm:gap-4">
                      <dt className="text-sm font-medium text-neutral-500 sm:w-32 sm:flex-shrink-0">Phone</dt>
                      <dd className="mt-1 text-sm text-neutral-900 sm:mt-0">{rep.phone}</dd>
                    </div>
                  )}
                  {rep.email && (
                    <div className="flex flex-col py-2 sm:flex-row sm:gap-4">
                      <dt className="text-sm font-medium text-neutral-500 sm:w-32 sm:flex-shrink-0">Email</dt>
                      <dd className="mt-1 text-sm text-neutral-900 sm:mt-0">{rep.email}</dd>
                    </div>
                  )}
                </dl>
                <div className="flex flex-shrink-0 items-center gap-2">
                  <button
                    type="button"
                    className="btn-outline text-xs"
                    onClick={() => handleEditClick(rep)}
                    disabled={isAdding || editingRep !== null}
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    className="inline-flex items-center justify-center rounded-md border border-red-500 bg-transparent px-4 py-2 text-xs font-semibold text-red-500 shadow-sm transition-colors hover:bg-red-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-500 disabled:cursor-not-allowed disabled:opacity-50"
                    onClick={() => handleRemoveClick(rep)}
                    disabled={isAdding || editingRep !== null}
                  >
                    Remove
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}