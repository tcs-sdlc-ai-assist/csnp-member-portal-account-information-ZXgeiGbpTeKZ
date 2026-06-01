import { useState, useCallback, useMemo } from 'react';
import PropTypes from 'prop-types';
import { Modal } from '../common/Modal.jsx';

const MOCK_DOCTORS = [
  {
    providerName: 'Dr. Emily Chen',
    specialty: 'Family Medicine',
    address: '100 Wellness Blvd, Springfield, IL 62701',
    providerPhone: '555-2001',
    clinic: 'Springfield Family Health Center',
  },
  {
    providerName: 'Dr. Michael Rivera',
    specialty: 'Internal Medicine',
    address: '250 Oak Park Dr, Springfield, IL 62702',
    providerPhone: '555-2002',
    clinic: 'Midwest Internal Medicine Group',
  },
  {
    providerName: 'Dr. Aisha Patel',
    specialty: 'General Practice',
    address: '789 Elm St, Suite 200, Springfield, IL 62703',
    providerPhone: '555-2003',
    clinic: 'Elm Street Medical Associates',
  },
  {
    providerName: 'Dr. James O\'Brien',
    specialty: 'Family Medicine',
    address: '432 Maple Ave, Springfield, IL 62704',
    providerPhone: '555-2004',
    clinic: 'Maple Avenue Family Clinic',
  },
  {
    providerName: 'Dr. Linda Nakamura',
    specialty: 'Primary Care',
    address: '55 Health Plaza, Springfield, IL 62705',
    providerPhone: '555-2005',
    clinic: 'Health Plaza Primary Care',
  },
];

/**
 * Mock Doctor/Hospital Finder modal component.
 * Displays a simulated search interface with a search input and a list of
 * 5 mock PCP results (name, specialty, address, phone). User can select a
 * PCP from the list. Selected PCP is passed back via onSelectPCP callback.
 *
 * @param {Object} props
 * @param {boolean} props.isOpen - Whether the modal is currently open.
 * @param {function} props.onClose - Callback invoked when the modal should close.
 * @param {function} props.onSelectPCP - Callback invoked with the selected PCP object.
 * @returns {JSX.Element|null}
 *
 * @see SCRUM-9278
 * @see SCRUM-9284
 */
export function DoctorFinderModal({ isOpen, onClose, onSelectPCP }) {
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearchChange = useCallback((e) => {
    setSearchQuery(e.target.value);
  }, []);

  const filteredDoctors = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (query.length === 0) {
      return MOCK_DOCTORS;
    }
    return MOCK_DOCTORS.filter(
      (doc) =>
        doc.providerName.toLowerCase().includes(query) ||
        doc.specialty.toLowerCase().includes(query) ||
        doc.clinic.toLowerCase().includes(query) ||
        doc.address.toLowerCase().includes(query)
    );
  }, [searchQuery]);

  const handleSelect = useCallback(
    (doctor) => {
      onSelectPCP({
        providerName: doctor.providerName,
        providerPhone: doctor.providerPhone,
        clinic: doctor.clinic,
        address: doctor.address,
      });
      setSearchQuery('');
    },
    [onSelectPCP]
  );

  const handleClose = useCallback(() => {
    setSearchQuery('');
    onClose();
  }, [onClose]);

  if (!isOpen) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          handleClose();
        }
      }}
      aria-hidden="false"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="doctor-finder-title"
        className="card relative mx-auto w-full max-w-lg shadow-lg focus:outline-none"
      >
        {/* Header */}
        <div className="mb-4 flex items-center justify-between">
          <h2 id="doctor-finder-title" className="text-lg font-bold text-primary-800">
            Find a Doctor
          </h2>
          <button
            type="button"
            className="inline-flex items-center justify-center rounded-md p-1 text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-neutral-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500"
            onClick={handleClose}
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

        {/* Demo disclaimer */}
        <div className="mb-4 rounded-md border border-primary-200 bg-primary-50 px-4 py-3">
          <p className="text-sm text-primary-700">
            <strong>Demo:</strong> This is a simulated doctor finder. All providers listed are fictitious and for demonstration purposes only.
          </p>
        </div>

        {/* Search input */}
        <div className="mb-4">
          <label htmlFor="doctor-search" className="label mb-1">
            Search by name, specialty, or location
          </label>
          <input
            id="doctor-search"
            type="text"
            className="input-field"
            placeholder="e.g., Family Medicine, Chen, Springfield"
            value={searchQuery}
            onChange={handleSearchChange}
          />
        </div>

        {/* Results list */}
        <div className="max-h-72 overflow-y-auto">
          {filteredDoctors.length === 0 ? (
            <p className="py-4 text-center text-sm text-neutral-500">
              No providers found matching your search.
            </p>
          ) : (
            <ul className="divide-y divide-neutral-200" role="list">
              {filteredDoctors.map((doctor) => (
                <li key={doctor.providerName} className="py-3">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-neutral-900">
                        {doctor.providerName}
                      </p>
                      <p className="mt-0.5 text-xs text-primary-600">
                        {doctor.specialty}
                      </p>
                      <p className="mt-0.5 text-xs text-neutral-500">
                        {doctor.clinic}
                      </p>
                      <p className="mt-0.5 text-xs text-neutral-500">
                        {doctor.address}
                      </p>
                      <p className="mt-0.5 text-xs text-neutral-500">
                        Phone: {doctor.providerPhone}
                      </p>
                    </div>
                    <button
                      type="button"
                      className="btn-primary flex-shrink-0 text-xs"
                      onClick={() => handleSelect(doctor)}
                    >
                      Select
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Footer */}
        <div className="mt-4 flex items-center justify-end">
          <button
            type="button"
            className="btn-outline"
            onClick={handleClose}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

DoctorFinderModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSelectPCP: PropTypes.func.isRequired,
};

export default DoctorFinderModal;