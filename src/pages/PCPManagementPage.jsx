import { useState, useCallback } from 'react';
import { useSettings } from '../context/SettingsContext.jsx';
import { Toast } from '../components/common/Toast.jsx';
import { DoctorFinderModal } from '../components/pcp/DoctorFinderModal.jsx';
import { PCP_CHANGE_REASONS } from '../constants.js';

/**
 * PCP management page.
 * Displays current PCP info (name, specialty, address, phone) from SettingsContext.
 * 'Change PCP' button initiates flow:
 * (1) Check VCC attestation status (mocked as completed).
 * (2) Show reason for change dropdown (from constants); if 'Other' selected, show free text input.
 * (3) Open DoctorFinderModal to select new PCP.
 * (4) On selection, call changePCP() from SettingsContext.
 * (5) Show success confirmation with simulated turnaround time (3-5 business days)
 *     or simulated error with 'email notification sent' message.
 * All flows are mocked.
 *
 * @returns {JSX.Element}
 *
 * @see SCRUM-9278
 * @see SCRUM-9284
 */
export default function PCPManagementPage() {
  const { pcpInfo, changePCP, loading } = useSettings();

  const [isChanging, setIsChanging] = useState(false);
  const [attestationChecked, setAttestationChecked] = useState(false);
  const [selectedReason, setSelectedReason] = useState('');
  const [otherReasonText, setOtherReasonText] = useState('');
  const [reasonError, setReasonError] = useState(null);
  const [otherReasonError, setOtherReasonError] = useState(null);
  const [isFinderOpen, setIsFinderOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState({ message: '', type: 'info', isVisible: false });

  const dismissToast = useCallback(() => {
    setToast((prev) => ({ ...prev, isVisible: false }));
  }, []);

  const handleStartChange = useCallback(() => {
    setIsChanging(true);
    setAttestationChecked(false);
    setSelectedReason('');
    setOtherReasonText('');
    setReasonError(null);
    setOtherReasonError(null);
  }, []);

  const handleCancelChange = useCallback(() => {
    setIsChanging(false);
    setAttestationChecked(false);
    setSelectedReason('');
    setOtherReasonText('');
    setReasonError(null);
    setOtherReasonError(null);
  }, []);

  const handleAttestationConfirm = useCallback(() => {
    setAttestationChecked(true);
  }, []);

  const handleReasonChange = useCallback((e) => {
    setSelectedReason(e.target.value);
    setReasonError(null);
    if (e.target.value !== 'Other') {
      setOtherReasonText('');
      setOtherReasonError(null);
    }
  }, []);

  const handleOtherReasonChange = useCallback((e) => {
    setOtherReasonText(e.target.value);
    setOtherReasonError(null);
  }, []);

  const handleProceedToFinder = useCallback(() => {
    let hasError = false;

    if (!selectedReason) {
      setReasonError('Please select a reason for the PCP change.');
      hasError = true;
    }

    if (selectedReason === 'Other' && otherReasonText.trim().length === 0) {
      setOtherReasonError('Please provide a reason for the PCP change.');
      hasError = true;
    }

    if (hasError) {
      return;
    }

    setIsFinderOpen(true);
  }, [selectedReason, otherReasonText]);

  const handleCloseFinder = useCallback(() => {
    setIsFinderOpen(false);
  }, []);

  const handleSelectPCP = useCallback(
    (newPCPData) => {
      setIsFinderOpen(false);
      setIsSubmitting(true);

      try {
        const reason = selectedReason === 'Other' ? otherReasonText.trim() : selectedReason;

        const result = changePCP({
          reason,
          providerName: newPCPData.providerName,
          providerPhone: newPCPData.providerPhone || '',
          clinic: newPCPData.clinic || '',
          address: newPCPData.address || '',
        });

        if (result.success) {
          setToast({
            message: result.confirmation || 'PCP change submitted successfully. Expected turnaround: 3-5 business days (demo).',
            type: 'success',
            isVisible: true,
          });
          setIsChanging(false);
          setAttestationChecked(false);
          setSelectedReason('');
          setOtherReasonText('');
          setReasonError(null);
          setOtherReasonError(null);
        } else {
          setToast({
            message: result.error || 'PCP change failed. An email notification has been sent (demo).',
            type: 'error',
            isVisible: true,
          });
        }
      } catch {
        setToast({
          message: 'An unexpected error occurred. An email notification has been sent (demo).',
          type: 'error',
          isVisible: true,
        });
      } finally {
        setIsSubmitting(false);
      }
    },
    [selectedReason, otherReasonText, changePCP]
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-sm text-neutral-500">Loading PCP information…</p>
      </div>
    );
  }

  if (!pcpInfo) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-sm text-neutral-500">No PCP information available.</p>
      </div>
    );
  }

  const reasonOptions = PCP_CHANGE_REASONS.map((reason) => ({
    value: reason,
    label: reason,
  }));

  return (
    <div>
      <Toast
        message={toast.message}
        type={toast.type}
        isVisible={toast.isVisible}
        onDismiss={dismissToast}
      />

      <DoctorFinderModal
        isOpen={isFinderOpen}
        onClose={handleCloseFinder}
        onSelectPCP={handleSelectPCP}
      />

      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-primary-800">PCP Management</h1>
        {!isChanging && (
          <button
            type="button"
            className="btn-primary"
            onClick={handleStartChange}
          >
            Change PCP
          </button>
        )}
      </div>

      {/* Demo hint */}
      <div className="mb-6 rounded-md border border-primary-200 bg-primary-50 px-4 py-3">
        <p className="text-sm text-primary-700">
          <strong>Demo:</strong> All PCP information and change requests are simulated. No real provider changes are made.
        </p>
      </div>

      {/* Current PCP Info */}
      <div className="card mb-6">
        <h2 className="mb-4 text-lg font-bold text-primary-800">Current Primary Care Provider</h2>
        <dl className="divide-y divide-neutral-200">
          <div className="flex flex-col py-3 sm:flex-row sm:gap-4">
            <dt className="text-sm font-medium text-neutral-500 sm:w-40 sm:flex-shrink-0">Provider Name</dt>
            <dd className="mt-1 text-sm text-neutral-900 sm:mt-0">{pcpInfo.providerName}</dd>
          </div>
          <div className="flex flex-col py-3 sm:flex-row sm:gap-4">
            <dt className="text-sm font-medium text-neutral-500 sm:w-40 sm:flex-shrink-0">Clinic</dt>
            <dd className="mt-1 text-sm text-neutral-900 sm:mt-0">{pcpInfo.clinic}</dd>
          </div>
          <div className="flex flex-col py-3 sm:flex-row sm:gap-4">
            <dt className="text-sm font-medium text-neutral-500 sm:w-40 sm:flex-shrink-0">Address</dt>
            <dd className="mt-1 text-sm text-neutral-900 sm:mt-0">{pcpInfo.address}</dd>
          </div>
          <div className="flex flex-col py-3 sm:flex-row sm:gap-4">
            <dt className="text-sm font-medium text-neutral-500 sm:w-40 sm:flex-shrink-0">Phone</dt>
            <dd className="mt-1 text-sm text-neutral-900 sm:mt-0">{pcpInfo.providerPhone}</dd>
          </div>
          {pcpInfo.effectiveDate && (
            <div className="flex flex-col py-3 sm:flex-row sm:gap-4">
              <dt className="text-sm font-medium text-neutral-500 sm:w-40 sm:flex-shrink-0">Effective Date</dt>
              <dd className="mt-1 text-sm text-neutral-900 sm:mt-0">{pcpInfo.effectiveDate}</dd>
            </div>
          )}
          {pcpInfo.lastVisit && (
            <div className="flex flex-col py-3 sm:flex-row sm:gap-4">
              <dt className="text-sm font-medium text-neutral-500 sm:w-40 sm:flex-shrink-0">Last Visit</dt>
              <dd className="mt-1 text-sm text-neutral-900 sm:mt-0">{pcpInfo.lastVisit}</dd>
            </div>
          )}
        </dl>
      </div>

      {/* Change PCP Flow */}
      {isChanging && (
        <div className="card">
          <h2 className="mb-4 text-lg font-bold text-primary-800">Change PCP</h2>

          {/* Step 1: VCC Attestation */}
          {!attestationChecked && (
            <div>
              <div className="mb-4 rounded-md border border-green-200 bg-green-50 px-4 py-3">
                <div className="flex items-center gap-2">
                  <svg
                    className="h-5 w-5 flex-shrink-0 text-green-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth="1.5"
                    stroke="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <p className="text-sm font-medium text-green-800">
                    VCC Attestation Status: Completed (demo)
                  </p>
                </div>
                <p className="mt-2 text-xs text-green-700">
                  Your Value-Based Care Commitment attestation has been verified. You may proceed with the PCP change request.
                </p>
              </div>
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  className="btn-outline"
                  onClick={handleCancelChange}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn-primary"
                  onClick={handleAttestationConfirm}
                >
                  Continue
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Reason for Change */}
          {attestationChecked && (
            <div>
              <div className="mb-4">
                <label htmlFor="pcp-change-reason" className="label mb-1">
                  Reason for Change
                  <span className="ml-1 text-red-500" aria-hidden="true">*</span>
                </label>
                <select
                  id="pcp-change-reason"
                  className={`input-field ${reasonError ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
                  value={selectedReason}
                  onChange={handleReasonChange}
                  disabled={isSubmitting}
                  aria-invalid={reasonError ? true : undefined}
                  aria-describedby={reasonError ? 'pcp-change-reason-error' : undefined}
                >
                  <option value="" disabled>
                    Select a reason
                  </option>
                  {reasonOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                {reasonError && (
                  <p id="pcp-change-reason-error" className="mt-1 text-sm text-red-600" role="alert">
                    {reasonError}
                  </p>
                )}
              </div>

              {selectedReason === 'Other' && (
                <div className="mb-4">
                  <label htmlFor="pcp-change-other-reason" className="label mb-1">
                    Please specify
                    <span className="ml-1 text-red-500" aria-hidden="true">*</span>
                  </label>
                  <textarea
                    id="pcp-change-other-reason"
                    className={`input-field ${otherReasonError ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
                    rows={3}
                    value={otherReasonText}
                    onChange={handleOtherReasonChange}
                    disabled={isSubmitting}
                    placeholder="Describe your reason for changing PCP"
                    aria-invalid={otherReasonError ? true : undefined}
                    aria-describedby={otherReasonError ? 'pcp-change-other-reason-error' : undefined}
                  />
                  {otherReasonError && (
                    <p id="pcp-change-other-reason-error" className="mt-1 text-sm text-red-600" role="alert">
                      {otherReasonError}
                    </p>
                  )}
                </div>
              )}

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  className="btn-outline"
                  onClick={handleCancelChange}
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn-primary"
                  onClick={handleProceedToFinder}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Processing…' : 'Find New PCP'}
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}