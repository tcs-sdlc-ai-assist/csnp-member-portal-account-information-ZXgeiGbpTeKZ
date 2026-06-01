import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import AccountInfoPage from './AccountInfoPage.jsx';
import { AuthProvider } from '../context/AuthContext.jsx';
import { SettingsProvider } from '../context/SettingsContext.jsx';
import { initializeMockData } from '../services/mockData.js';
import { STORAGE_KEYS } from '../constants.js';
import { setItem, getItem } from '../services/localStorageManager.js';

function renderAccountInfoPage() {
  return render(
    <AuthProvider>
      <SettingsProvider>
        <MemoryRouter initialEntries={['/account']}>
          <Routes>
            <Route path="/account" element={<AccountInfoPage />} />
          </Routes>
        </MemoryRouter>
      </SettingsProvider>
    </AuthProvider>
  );
}

describe('AccountInfoPage', () => {
  beforeEach(() => {
    window.localStorage.clear();
    initializeMockData();
  });

  it('renders account info fields with mock data', () => {
    renderAccountInfoPage();

    expect(screen.getByText('Account Information')).toBeInTheDocument();
    expect(screen.getByText('Jane Doe')).toBeInTheDocument();
    expect(screen.getByText('123 Main St, Springfield, IL 62701')).toBeInTheDocument();
    expect(screen.getByText('jane.doe@email.com')).toBeInTheDocument();
    expect(screen.getByText('555-1234')).toBeInTheDocument();
    expect(screen.getByText('M1234567')).toBeInTheDocument();
  });

  it('renders field labels in view mode', () => {
    renderAccountInfoPage();

    expect(screen.getByText('Name')).toBeInTheDocument();
    expect(screen.getByText('Address')).toBeInTheDocument();
    expect(screen.getByText('Email')).toBeInTheDocument();
    expect(screen.getByText('Phone')).toBeInTheDocument();
    expect(screen.getByText('Member ID')).toBeInTheDocument();
  });

  it('renders an Edit button in view mode', () => {
    renderAccountInfoPage();

    expect(screen.getByRole('button', { name: /edit/i })).toBeInTheDocument();
  });

  it('edit mode enables input fields when Edit is clicked', async () => {
    const user = userEvent.setup();
    renderAccountInfoPage();

    const editButton = screen.getByRole('button', { name: /edit/i });
    await user.click(editButton);

    expect(screen.getByLabelText(/^name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^name/i)).not.toBeDisabled();
    expect(screen.getByLabelText(/address/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/address/i)).not.toBeDisabled();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).not.toBeDisabled();
    expect(screen.getByLabelText(/phone/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/phone/i)).not.toBeDisabled();
  });

  it('populates form fields with current data in edit mode', async () => {
    const user = userEvent.setup();
    renderAccountInfoPage();

    const editButton = screen.getByRole('button', { name: /edit/i });
    await user.click(editButton);

    expect(screen.getByLabelText(/^name/i)).toHaveValue('Jane Doe');
    expect(screen.getByLabelText(/address/i)).toHaveValue('123 Main St, Springfield, IL 62701');
    expect(screen.getByLabelText(/email/i)).toHaveValue('jane.doe@email.com');
    expect(screen.getByLabelText(/phone/i)).toHaveValue('555-1234');
  });

  it('Member ID is always read-only in edit mode', async () => {
    const user = userEvent.setup();
    renderAccountInfoPage();

    const editButton = screen.getByRole('button', { name: /edit/i });
    await user.click(editButton);

    const memberIdInput = screen.getByLabelText(/member id/i);
    expect(memberIdInput).toBeInTheDocument();
    expect(memberIdInput).toBeDisabled();
    expect(memberIdInput).toHaveValue('M1234567');
  });

  it('cancel reverts to view mode without saving', async () => {
    const user = userEvent.setup();
    renderAccountInfoPage();

    const editButton = screen.getByRole('button', { name: /edit/i });
    await user.click(editButton);

    const nameInput = screen.getByLabelText(/^name/i);
    await user.clear(nameInput);
    await user.type(nameInput, 'Changed Name');

    const cancelButton = screen.getByRole('button', { name: /cancel/i });
    await user.click(cancelButton);

    // Should be back in view mode with original data
    expect(screen.getByText('Jane Doe')).toBeInTheDocument();
    expect(screen.queryByLabelText(/^name/i)).not.toBeInTheDocument();

    // Verify localStorage was not changed
    const stored = getItem(STORAGE_KEYS.ACCOUNT_INFO);
    expect(stored.name).toBe('Jane Doe');
  });

  it('save persists changes via SettingsContext', async () => {
    const user = userEvent.setup();
    renderAccountInfoPage();

    const editButton = screen.getByRole('button', { name: /edit/i });
    await user.click(editButton);

    const nameInput = screen.getByLabelText(/^name/i);
    await user.clear(nameInput);
    await user.type(nameInput, 'Updated Name');

    const phoneInput = screen.getByLabelText(/phone/i);
    await user.clear(phoneInput);
    await user.type(phoneInput, '555-123-4567');

    const saveButton = screen.getByRole('button', { name: /save/i });
    await user.click(saveButton);

    // Should show success toast
    expect(await screen.findByText(/account information updated successfully/i)).toBeInTheDocument();

    // Should be back in view mode with updated data
    expect(screen.getByText('Updated Name')).toBeInTheDocument();
    expect(screen.getByText('555-123-4567')).toBeInTheDocument();

    // Verify localStorage was updated
    const stored = getItem(STORAGE_KEYS.ACCOUNT_INFO);
    expect(stored.name).toBe('Updated Name');
    expect(stored.phone).toBe('555-123-4567');
    expect(stored.memberId).toBe('M1234567');
  });

  it('shows validation error for empty name', async () => {
    const user = userEvent.setup();
    renderAccountInfoPage();

    const editButton = screen.getByRole('button', { name: /edit/i });
    await user.click(editButton);

    const nameInput = screen.getByLabelText(/^name/i);
    await user.clear(nameInput);

    const saveButton = screen.getByRole('button', { name: /save/i });
    await user.click(saveButton);

    expect(await screen.findByText(/name is required/i)).toBeInTheDocument();
  });

  it('shows validation error for invalid email', async () => {
    const user = userEvent.setup();
    renderAccountInfoPage();

    const editButton = screen.getByRole('button', { name: /edit/i });
    await user.click(editButton);

    const emailInput = screen.getByLabelText(/email/i);
    await user.clear(emailInput);
    await user.type(emailInput, 'notanemail');

    const saveButton = screen.getByRole('button', { name: /save/i });
    await user.click(saveButton);

    expect(await screen.findByText(/please enter a valid email address/i)).toBeInTheDocument();
  });

  it('shows validation error for invalid phone number', async () => {
    const user = userEvent.setup();
    renderAccountInfoPage();

    const editButton = screen.getByRole('button', { name: /edit/i });
    await user.click(editButton);

    const phoneInput = screen.getByLabelText(/phone/i);
    await user.clear(phoneInput);
    await user.type(phoneInput, '123');

    const saveButton = screen.getByRole('button', { name: /save/i });
    await user.click(saveButton);

    expect(await screen.findByText(/phone number must contain at least 10 digits/i)).toBeInTheDocument();
  });

  it('shows validation error for short address', async () => {
    const user = userEvent.setup();
    renderAccountInfoPage();

    const editButton = screen.getByRole('button', { name: /edit/i });
    await user.click(editButton);

    const addressInput = screen.getByLabelText(/address/i);
    await user.clear(addressInput);
    await user.type(addressInput, 'Hi');

    const saveButton = screen.getByRole('button', { name: /save/i });
    await user.click(saveButton);

    expect(await screen.findByText(/address must be at least 5 characters long/i)).toBeInTheDocument();
  });

  it('shows validation errors for all empty fields', async () => {
    const user = userEvent.setup();
    renderAccountInfoPage();

    const editButton = screen.getByRole('button', { name: /edit/i });
    await user.click(editButton);

    const nameInput = screen.getByLabelText(/^name/i);
    const addressInput = screen.getByLabelText(/address/i);
    const emailInput = screen.getByLabelText(/email/i);
    const phoneInput = screen.getByLabelText(/phone/i);

    await user.clear(nameInput);
    await user.clear(addressInput);
    await user.clear(emailInput);
    await user.clear(phoneInput);

    const saveButton = screen.getByRole('button', { name: /save/i });
    await user.click(saveButton);

    expect(await screen.findByText(/name is required/i)).toBeInTheDocument();
    expect(screen.getByText(/address is required/i)).toBeInTheDocument();
    expect(screen.getByText(/email is required/i)).toBeInTheDocument();
    expect(screen.getByText(/phone number is required/i)).toBeInTheDocument();
  });

  it('clears validation errors when user types in a field', async () => {
    const user = userEvent.setup();
    renderAccountInfoPage();

    const editButton = screen.getByRole('button', { name: /edit/i });
    await user.click(editButton);

    const nameInput = screen.getByLabelText(/^name/i);
    await user.clear(nameInput);

    const saveButton = screen.getByRole('button', { name: /save/i });
    await user.click(saveButton);

    expect(await screen.findByText(/name is required/i)).toBeInTheDocument();

    await user.type(nameInput, 'New Name');

    expect(screen.queryByText(/name is required/i)).not.toBeInTheDocument();
  });

  it('does not show Edit button while in edit mode', async () => {
    const user = userEvent.setup();
    renderAccountInfoPage();

    const editButton = screen.getByRole('button', { name: /^edit$/i });
    await user.click(editButton);

    // The top-level Edit button should not be present in edit mode
    // Only Save and Cancel should be visible
    expect(screen.getByRole('button', { name: /save/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
  });

  it('shows Member ID cannot be changed help text in edit mode', async () => {
    const user = userEvent.setup();
    renderAccountInfoPage();

    const editButton = screen.getByRole('button', { name: /edit/i });
    await user.click(editButton);

    expect(screen.getByText(/member id cannot be changed/i)).toBeInTheDocument();
  });
});