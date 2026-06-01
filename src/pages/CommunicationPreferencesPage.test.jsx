import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import CommunicationPreferencesPage from './CommunicationPreferencesPage.jsx';
import { AuthProvider } from '../context/AuthContext.jsx';
import { SettingsProvider } from '../context/SettingsContext.jsx';
import { initializeMockData } from '../services/mockData.js';
import { STORAGE_KEYS } from '../constants.js';
import { getItem, setItem } from '../services/localStorageManager.js';

function renderCommunicationPreferencesPage() {
  return render(
    <AuthProvider>
      <SettingsProvider>
        <MemoryRouter initialEntries={['/communication']}>
          <Routes>
            <Route path="/communication" element={<CommunicationPreferencesPage />} />
          </Routes>
        </MemoryRouter>
      </SettingsProvider>
    </AuthProvider>
  );
}

describe('CommunicationPreferencesPage', () => {
  beforeEach(() => {
    window.localStorage.clear();
    initializeMockData();
  });

  it('renders the page heading', () => {
    renderCommunicationPreferencesPage();

    expect(screen.getByText('Communication Preferences')).toBeInTheDocument();
  });

  it('renders demo hint text', () => {
    renderCommunicationPreferencesPage();

    expect(screen.getByText(/demo/i)).toBeInTheDocument();
    expect(screen.getByText(/no real notifications are sent/i)).toBeInTheDocument();
  });

  it('renders paperless delivery toggle section', () => {
    renderCommunicationPreferencesPage();

    expect(screen.getByText('Paperless Delivery')).toBeInTheDocument();
    expect(screen.getByText('Enable paperless delivery')).toBeInTheDocument();
    expect(screen.getByRole('switch', { name: /toggle paperless delivery/i })).toBeInTheDocument();
  });

  it('renders paperless delivery toggle with correct initial state', () => {
    renderCommunicationPreferencesPage();

    const toggle = screen.getByRole('switch', { name: /toggle paperless delivery/i });
    // Default privacy settings have no paperlessDelivery, so it should be off
    expect(toggle).toHaveAttribute('aria-checked', 'false');
  });

  it('toggles paperless delivery on click', async () => {
    const user = userEvent.setup();
    renderCommunicationPreferencesPage();

    const toggle = screen.getByRole('switch', { name: /toggle paperless delivery/i });
    expect(toggle).toHaveAttribute('aria-checked', 'false');

    await user.click(toggle);

    expect(toggle).toHaveAttribute('aria-checked', 'true');
    expect(await screen.findByText(/paperless delivery enabled/i)).toBeInTheDocument();

    // Verify localStorage was updated
    const stored = getItem(STORAGE_KEYS.PRIVACY_SETTINGS);
    expect(stored.paperlessDelivery).toBe(true);
  });

  it('toggles paperless delivery off after enabling', async () => {
    const user = userEvent.setup();
    renderCommunicationPreferencesPage();

    const toggle = screen.getByRole('switch', { name: /toggle paperless delivery/i });

    // Enable
    await user.click(toggle);
    expect(toggle).toHaveAttribute('aria-checked', 'true');

    // Disable
    await user.click(toggle);
    expect(toggle).toHaveAttribute('aria-checked', 'false');
    expect(await screen.findByText(/paperless delivery disabled/i)).toBeInTheDocument();

    const stored = getItem(STORAGE_KEYS.PRIVACY_SETTINGS);
    expect(stored.paperlessDelivery).toBe(false);
  });

  it('renders delivery email section with current email', () => {
    renderCommunicationPreferencesPage();

    expect(screen.getByText('Delivery Email')).toBeInTheDocument();
    expect(screen.getByText('jane.doe@email.com')).toBeInTheDocument();
    expect(screen.getByText('Verified (demo)')).toBeInTheDocument();
  });

  it('renders edit button for delivery email', () => {
    renderCommunicationPreferencesPage();

    // There should be an Edit button in the delivery email section
    const editButtons = screen.getAllByRole('button', { name: /edit/i });
    expect(editButtons.length).toBeGreaterThanOrEqual(1);
  });

  it('shows email edit form when Edit is clicked', async () => {
    const user = userEvent.setup();
    renderCommunicationPreferencesPage();

    const editButtons = screen.getAllByRole('button', { name: /edit/i });
    // Click the edit button in the delivery email section
    await user.click(editButtons[0]);

    expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email address/i)).toHaveValue('jane.doe@email.com');
  });

  it('cancels email edit and reverts to view mode', async () => {
    const user = userEvent.setup();
    renderCommunicationPreferencesPage();

    const editButtons = screen.getAllByRole('button', { name: /edit/i });
    await user.click(editButtons[0]);

    const emailInput = screen.getByLabelText(/email address/i);
    await user.clear(emailInput);
    await user.type(emailInput, 'changed@test.com');

    const cancelButton = screen.getByRole('button', { name: /cancel/i });
    await user.click(cancelButton);

    // Should be back in view mode with original email
    expect(screen.getByText('jane.doe@email.com')).toBeInTheDocument();
    expect(screen.queryByLabelText(/email address/i)).not.toBeInTheDocument();

    // Verify localStorage was not changed
    const stored = getItem(STORAGE_KEYS.ACCOUNT_INFO);
    expect(stored.email).toBe('jane.doe@email.com');
  });

  it('saves delivery email and shows success toast', async () => {
    const user = userEvent.setup();
    renderCommunicationPreferencesPage();

    const editButtons = screen.getAllByRole('button', { name: /edit/i });
    await user.click(editButtons[0]);

    const emailInput = screen.getByLabelText(/email address/i);
    await user.clear(emailInput);
    await user.type(emailInput, 'newemail@test.com');

    const saveButton = screen.getByRole('button', { name: /save email/i });
    await user.click(saveButton);

    expect(await screen.findByText(/delivery email updated successfully/i)).toBeInTheDocument();

    // Should be back in view mode with updated email
    expect(screen.getByText('newemail@test.com')).toBeInTheDocument();

    // Verify localStorage was updated
    const stored = getItem(STORAGE_KEYS.ACCOUNT_INFO);
    expect(stored.email).toBe('newemail@test.com');
  });

  it('shows validation error for invalid delivery email', async () => {
    const user = userEvent.setup();
    renderCommunicationPreferencesPage();

    const editButtons = screen.getAllByRole('button', { name: /edit/i });
    await user.click(editButtons[0]);

    const emailInput = screen.getByLabelText(/email address/i);
    await user.clear(emailInput);
    await user.type(emailInput, 'notanemail');

    const saveButton = screen.getByRole('button', { name: /save email/i });
    await user.click(saveButton);

    expect(await screen.findByText(/please enter a valid email address/i)).toBeInTheDocument();
  });

  it('shows validation error for empty delivery email', async () => {
    const user = userEvent.setup();
    renderCommunicationPreferencesPage();

    const editButtons = screen.getAllByRole('button', { name: /edit/i });
    await user.click(editButtons[0]);

    const emailInput = screen.getByLabelText(/email address/i);
    await user.clear(emailInput);

    const saveButton = screen.getByRole('button', { name: /save email/i });
    await user.click(saveButton);

    expect(await screen.findByText(/email is required/i)).toBeInTheDocument();
  });

  it('renders notification preferences section', () => {
    renderCommunicationPreferencesPage();

    expect(screen.getByText('Notification Preferences')).toBeInTheDocument();
    expect(screen.getByText('Coverage Info')).toBeInTheDocument();
    expect(screen.getByText('Processed Requests')).toBeInTheDocument();
    expect(screen.getByText('Health & Wellness')).toBeInTheDocument();
  });

  it('renders channel options (Text, Email, Both, None) for each category', () => {
    renderCommunicationPreferencesPage();

    // Each category should have Text, Email, Both, None radio options
    const textRadios = screen.getAllByRole('radio', { name: /text for/i });
    const emailRadios = screen.getAllByRole('radio', { name: /email for/i });
    const bothRadios = screen.getAllByRole('radio', { name: /both for/i });
    const noneRadios = screen.getAllByRole('radio', { name: /none for/i });

    expect(textRadios.length).toBe(3);
    expect(emailRadios.length).toBe(3);
    expect(bothRadios.length).toBe(3);
    expect(noneRadios.length).toBe(3);
  });

  it('renders notification preferences with default channel selections', () => {
    renderCommunicationPreferencesPage();

    // Default mock data: Coverage Info -> Text, Processed Requests -> Email, Health & Wellness -> Both
    const coverageTextRadio = screen.getByRole('radio', { name: /text for coverage info/i });
    const processedEmailRadio = screen.getByRole('radio', { name: /email for processed requests/i });
    const healthBothRadio = screen.getByRole('radio', { name: /both for health & wellness/i });

    expect(coverageTextRadio).toBeChecked();
    expect(processedEmailRadio).toBeChecked();
    expect(healthBothRadio).toBeChecked();
  });

  it('changing channel selection updates the radio state', async () => {
    const user = userEvent.setup();
    renderCommunicationPreferencesPage();

    // Coverage Info is initially Text, change to Email
    const coverageEmailRadio = screen.getByRole('radio', { name: /email for coverage info/i });
    expect(coverageEmailRadio).not.toBeChecked();

    await user.click(coverageEmailRadio);

    expect(coverageEmailRadio).toBeChecked();

    // Text should no longer be checked
    const coverageTextRadio = screen.getByRole('radio', { name: /text for coverage info/i });
    expect(coverageTextRadio).not.toBeChecked();
  });

  it('changing channel to None unchecks other options', async () => {
    const user = userEvent.setup();
    renderCommunicationPreferencesPage();

    const coverageNoneRadio = screen.getByRole('radio', { name: /none for coverage info/i });
    await user.click(coverageNoneRadio);

    expect(coverageNoneRadio).toBeChecked();

    const coverageTextRadio = screen.getByRole('radio', { name: /text for coverage info/i });
    const coverageEmailRadio = screen.getByRole('radio', { name: /email for coverage info/i });
    const coverageBothRadio = screen.getByRole('radio', { name: /both for coverage info/i });

    expect(coverageTextRadio).not.toBeChecked();
    expect(coverageEmailRadio).not.toBeChecked();
    expect(coverageBothRadio).not.toBeChecked();
  });

  it('save persists notification preferences to localStorage', async () => {
    const user = userEvent.setup();
    renderCommunicationPreferencesPage();

    // Change Coverage Info from Text to Both
    const coverageBothRadio = screen.getByRole('radio', { name: /both for coverage info/i });
    await user.click(coverageBothRadio);

    // Change Processed Requests from Email to None
    const processedNoneRadio = screen.getByRole('radio', { name: /none for processed requests/i });
    await user.click(processedNoneRadio);

    // Click Save Preferences
    const saveButton = screen.getByRole('button', { name: /save preferences/i });
    await user.click(saveButton);

    expect(await screen.findByText(/notification preferences saved successfully/i)).toBeInTheDocument();

    // Verify localStorage was updated
    const stored = getItem(STORAGE_KEYS.COMMUNICATION_PREFS);
    expect(stored.length).toBe(3);

    const coveragePref = stored.find((p) => p.category === 'Coverage Info');
    expect(coveragePref.channel).toBe('Both');
    expect(coveragePref.enabled).toBe(true);

    const processedPref = stored.find((p) => p.category === 'Processed Requests');
    expect(processedPref.channel).toBe('');
    expect(processedPref.enabled).toBe(false);

    const healthPref = stored.find((p) => p.category === 'Health & Wellness');
    expect(healthPref.channel).toBe('Both');
    expect(healthPref.enabled).toBe(true);
  });

  it('renders Save Preferences button', () => {
    renderCommunicationPreferencesPage();

    expect(screen.getByRole('button', { name: /save preferences/i })).toBeInTheDocument();
  });

  it('renders description text for notification preferences', () => {
    renderCommunicationPreferencesPage();

    expect(screen.getByText(/choose how you would like to receive notifications/i)).toBeInTheDocument();
  });

  it('renders description text for delivery email', () => {
    renderCommunicationPreferencesPage();

    expect(screen.getByText(/this email address will be used for paperless document delivery/i)).toBeInTheDocument();
  });

  it('renders description text for paperless delivery', () => {
    renderCommunicationPreferencesPage();

    expect(screen.getByText(/receive all documents, statements, and notices electronically/i)).toBeInTheDocument();
  });

  it('saves preferences with all channels set to None', async () => {
    const user = userEvent.setup();
    renderCommunicationPreferencesPage();

    // Set all to None
    const coverageNone = screen.getByRole('radio', { name: /none for coverage info/i });
    const processedNone = screen.getByRole('radio', { name: /none for processed requests/i });
    const healthNone = screen.getByRole('radio', { name: /none for health & wellness/i });

    await user.click(coverageNone);
    await user.click(processedNone);
    await user.click(healthNone);

    const saveButton = screen.getByRole('button', { name: /save preferences/i });
    await user.click(saveButton);

    expect(await screen.findByText(/notification preferences saved successfully/i)).toBeInTheDocument();

    const stored = getItem(STORAGE_KEYS.COMMUNICATION_PREFS);
    stored.forEach((pref) => {
      expect(pref.channel).toBe('');
      expect(pref.enabled).toBe(false);
    });
  });

  it('paperless delivery toggle reflects pre-set enabled state', () => {
    // Set paperlessDelivery to true before rendering
    const privacySettings = getItem(STORAGE_KEYS.PRIVACY_SETTINGS);
    setItem(STORAGE_KEYS.PRIVACY_SETTINGS, { ...privacySettings, paperlessDelivery: true });

    renderCommunicationPreferencesPage();

    const toggle = screen.getByRole('switch', { name: /toggle paperless delivery/i });
    expect(toggle).toHaveAttribute('aria-checked', 'true');
  });
});