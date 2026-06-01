import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import RepresentativesPage from './RepresentativesPage.jsx';
import { AuthProvider } from '../context/AuthContext.jsx';
import { SettingsProvider } from '../context/SettingsContext.jsx';
import { initializeMockData } from '../services/mockData.js';
import { STORAGE_KEYS } from '../constants.js';
import { getItem, setItem } from '../services/localStorageManager.js';

function renderRepresentativesPage() {
  return render(
    <AuthProvider>
      <SettingsProvider>
        <MemoryRouter initialEntries={['/representatives']}>
          <Routes>
            <Route path="/representatives" element={<RepresentativesPage />} />
          </Routes>
        </MemoryRouter>
      </SettingsProvider>
    </AuthProvider>
  );
}

describe('RepresentativesPage', () => {
  beforeEach(() => {
    window.localStorage.clear();
    initializeMockData();
  });

  it('renders the page heading', () => {
    renderRepresentativesPage();

    expect(screen.getByText('Authorized Representatives')).toBeInTheDocument();
  });

  it('renders list of representatives with mock data', () => {
    renderRepresentativesPage();

    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('Spouse')).toBeInTheDocument();
    expect(screen.getByText('555-5678')).toBeInTheDocument();
    expect(screen.getByText('john.doe@email.com')).toBeInTheDocument();

    expect(screen.getByText('Mary Smith')).toBeInTheDocument();
    expect(screen.getByText('Daughter')).toBeInTheDocument();
    expect(screen.getByText('555-9012')).toBeInTheDocument();
    expect(screen.getByText('mary.smith@email.com')).toBeInTheDocument();
  });

  it('renders Add Representative button', () => {
    renderRepresentativesPage();

    expect(screen.getByRole('button', { name: /add representative/i })).toBeInTheDocument();
  });

  it('renders Edit and Remove buttons for each representative', () => {
    renderRepresentativesPage();

    const editButtons = screen.getAllByRole('button', { name: /edit/i });
    const removeButtons = screen.getAllByRole('button', { name: /remove/i });

    expect(editButtons.length).toBe(2);
    expect(removeButtons.length).toBe(2);
  });

  it('shows add representative form when Add Representative is clicked', async () => {
    const user = userEvent.setup();
    renderRepresentativesPage();

    const addButton = screen.getByRole('button', { name: /add representative/i });
    await user.click(addButton);

    expect(screen.getByText('Add Representative')).toBeInTheDocument();
    expect(screen.getByLabelText(/^name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/relationship/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/phone/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
  });

  it('hides Add Representative button when add form is visible', async () => {
    const user = userEvent.setup();
    renderRepresentativesPage();

    const addButton = screen.getByRole('button', { name: /add representative/i });
    await user.click(addButton);

    // The top-level Add Representative button should not be present
    // Only Cancel and Add Representative submit button should be visible
    expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
  });

  it('cancels add form and returns to list view', async () => {
    const user = userEvent.setup();
    renderRepresentativesPage();

    const addButton = screen.getByRole('button', { name: /add representative/i });
    await user.click(addButton);

    expect(screen.getByText('Add Representative')).toBeInTheDocument();

    const cancelButton = screen.getByRole('button', { name: /cancel/i });
    await user.click(cancelButton);

    // Should be back to list view
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('Mary Smith')).toBeInTheDocument();
  });

  it('adds a new representative and shows success toast', async () => {
    const user = userEvent.setup();
    renderRepresentativesPage();

    const addButton = screen.getByRole('button', { name: /add representative/i });
    await user.click(addButton);

    const nameInput = screen.getByLabelText(/^name/i);
    const relationshipSelect = screen.getByLabelText(/relationship/i);
    const phoneInput = screen.getByLabelText(/phone/i);
    const emailInput = screen.getByLabelText(/email/i);

    await user.type(nameInput, 'New Representative');
    await user.selectOptions(relationshipSelect, 'Child');
    await user.type(phoneInput, '555-111-2222');
    await user.type(emailInput, 'newrep@test.com');

    const submitButton = screen.getByRole('button', { name: /add representative/i });
    await user.click(submitButton);

    expect(await screen.findByText(/representative added successfully/i)).toBeInTheDocument();

    // New representative should appear in the list
    expect(screen.getByText('New Representative')).toBeInTheDocument();
    expect(screen.getByText('Child')).toBeInTheDocument();

    // Verify localStorage was updated
    const stored = getItem(STORAGE_KEYS.REPRESENTATIVES);
    expect(stored.length).toBe(3);
    const added = stored.find((r) => r.name === 'New Representative');
    expect(added).toBeDefined();
    expect(added.relationship).toBe('Child');
  });

  it('shows validation errors when adding with empty required fields', async () => {
    const user = userEvent.setup();
    renderRepresentativesPage();

    const addButton = screen.getByRole('button', { name: /add representative/i });
    await user.click(addButton);

    // Submit without filling in any fields
    const submitButton = screen.getByRole('button', { name: /add representative/i });
    await user.click(submitButton);

    expect(await screen.findByText(/name is required/i)).toBeInTheDocument();
    expect(screen.getByText(/relationship is required/i)).toBeInTheDocument();
  });

  it('shows edit representative form when Edit is clicked', async () => {
    const user = userEvent.setup();
    renderRepresentativesPage();

    const editButtons = screen.getAllByRole('button', { name: /edit/i });
    await user.click(editButtons[0]);

    expect(screen.getByText('Edit Representative')).toBeInTheDocument();
    expect(screen.getByLabelText(/^name/i)).toHaveValue('John Doe');
    expect(screen.getByLabelText(/relationship/i)).toHaveValue('Spouse');
    expect(screen.getByLabelText(/phone/i)).toHaveValue('555-5678');
    expect(screen.getByLabelText(/email/i)).toHaveValue('john.doe@email.com');
  });

  it('edits a representative and shows success toast', async () => {
    const user = userEvent.setup();
    renderRepresentativesPage();

    const editButtons = screen.getAllByRole('button', { name: /edit/i });
    await user.click(editButtons[0]);

    const nameInput = screen.getByLabelText(/^name/i);
    await user.clear(nameInput);
    await user.type(nameInput, 'John Updated');

    const phoneInput = screen.getByLabelText(/phone/i);
    await user.clear(phoneInput);
    await user.type(phoneInput, '555-999-8888');

    const saveButton = screen.getByRole('button', { name: /save changes/i });
    await user.click(saveButton);

    expect(await screen.findByText(/representative updated successfully/i)).toBeInTheDocument();

    // Updated data should appear in the list
    expect(screen.getByText('John Updated')).toBeInTheDocument();
    expect(screen.getByText('555-999-8888')).toBeInTheDocument();

    // Verify localStorage was updated
    const stored = getItem(STORAGE_KEYS.REPRESENTATIVES);
    const edited = stored.find((r) => r.id === 'rep-001');
    expect(edited.name).toBe('John Updated');
    expect(edited.phone).toBe('555-999-8888');
  });

  it('cancels edit form and returns to list view without saving', async () => {
    const user = userEvent.setup();
    renderRepresentativesPage();

    const editButtons = screen.getAllByRole('button', { name: /edit/i });
    await user.click(editButtons[0]);

    const nameInput = screen.getByLabelText(/^name/i);
    await user.clear(nameInput);
    await user.type(nameInput, 'Should Not Save');

    const cancelButton = screen.getByRole('button', { name: /cancel/i });
    await user.click(cancelButton);

    // Original data should still be displayed
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.queryByText('Should Not Save')).not.toBeInTheDocument();

    // Verify localStorage was not changed
    const stored = getItem(STORAGE_KEYS.REPRESENTATIVES);
    const rep = stored.find((r) => r.id === 'rep-001');
    expect(rep.name).toBe('John Doe');
  });

  it('shows confirmation modal when Remove is clicked', async () => {
    const user = userEvent.setup();
    renderRepresentativesPage();

    const removeButtons = screen.getAllByRole('button', { name: /remove/i });
    await user.click(removeButtons[0]);

    expect(screen.getByText('Remove Representative')).toBeInTheDocument();
    expect(screen.getByText(/are you sure you want to remove/i)).toBeInTheDocument();
    expect(screen.getByText(/john doe/i, { selector: 'strong' })).toBeInTheDocument();
  });

  it('cancels remove modal without deleting', async () => {
    const user = userEvent.setup();
    renderRepresentativesPage();

    const removeButtons = screen.getAllByRole('button', { name: /remove/i });
    await user.click(removeButtons[0]);

    expect(screen.getByText('Remove Representative')).toBeInTheDocument();

    const cancelButton = screen.getByRole('button', { name: /cancel/i });
    await user.click(cancelButton);

    // Representative should still be in the list
    expect(screen.getByText('John Doe')).toBeInTheDocument();

    // Verify localStorage was not changed
    const stored = getItem(STORAGE_KEYS.REPRESENTATIVES);
    expect(stored.length).toBe(2);
  });

  it('removes a representative after confirming and shows success toast', async () => {
    const user = userEvent.setup();
    renderRepresentativesPage();

    const removeButtons = screen.getAllByRole('button', { name: /remove/i });
    await user.click(removeButtons[0]);

    // Click the Remove button in the modal
    const confirmButton = screen.getByRole('button', { name: /^remove$/i });
    await user.click(confirmButton);

    expect(await screen.findByText(/representative removed successfully/i)).toBeInTheDocument();

    // John Doe should no longer be in the list
    expect(screen.queryByText('John Doe')).not.toBeInTheDocument();

    // Mary Smith should still be there
    expect(screen.getByText('Mary Smith')).toBeInTheDocument();

    // Verify localStorage was updated
    const stored = getItem(STORAGE_KEYS.REPRESENTATIVES);
    expect(stored.length).toBe(1);
    expect(stored[0].name).toBe('Mary Smith');
  });

  it('shows empty state message when no representatives exist', () => {
    setItem(STORAGE_KEYS.REPRESENTATIVES, []);

    renderRepresentativesPage();

    expect(screen.getByText(/no authorized representatives have been added yet/i)).toBeInTheDocument();
  });

  it('shows Add Representative button in empty state', () => {
    setItem(STORAGE_KEYS.REPRESENTATIVES, []);

    renderRepresentativesPage();

    expect(screen.getByRole('button', { name: /add representative/i })).toBeInTheDocument();
  });

  it('can add a representative from empty state', async () => {
    const user = userEvent.setup();
    setItem(STORAGE_KEYS.REPRESENTATIVES, []);

    renderRepresentativesPage();

    expect(screen.getByText(/no authorized representatives have been added yet/i)).toBeInTheDocument();

    const addButton = screen.getByRole('button', { name: /add representative/i });
    await user.click(addButton);

    const nameInput = screen.getByLabelText(/^name/i);
    const relationshipSelect = screen.getByLabelText(/relationship/i);

    await user.type(nameInput, 'First Representative');
    await user.selectOptions(relationshipSelect, 'Parent');

    const submitButton = screen.getByRole('button', { name: /add representative/i });
    await user.click(submitButton);

    expect(await screen.findByText(/representative added successfully/i)).toBeInTheDocument();
    expect(screen.getByText('First Representative')).toBeInTheDocument();
    expect(screen.getByText('Parent')).toBeInTheDocument();

    const stored = getItem(STORAGE_KEYS.REPRESENTATIVES);
    expect(stored.length).toBe(1);
    expect(stored[0].name).toBe('First Representative');
  });

  it('disables Edit and Remove buttons when add form is open', async () => {
    const user = userEvent.setup();
    renderRepresentativesPage();

    const addButton = screen.getByRole('button', { name: /add representative/i });
    await user.click(addButton);

    const editButtons = screen.getAllByRole('button', { name: /edit/i });
    const removeButtons = screen.getAllByRole('button', { name: /remove/i });

    editButtons.forEach((btn) => {
      expect(btn).toBeDisabled();
    });

    removeButtons.forEach((btn) => {
      expect(btn).toBeDisabled();
    });
  });

  it('disables Edit and Remove buttons when edit form is open', async () => {
    const user = userEvent.setup();
    renderRepresentativesPage();

    const editButtons = screen.getAllByRole('button', { name: /edit/i });
    await user.click(editButtons[0]);

    // The remaining Edit and Remove buttons in the list should be disabled
    const remainingEditButtons = screen.getAllByRole('button', { name: /edit/i });
    const remainingRemoveButtons = screen.getAllByRole('button', { name: /remove/i });

    remainingEditButtons.forEach((btn) => {
      expect(btn).toBeDisabled();
    });

    remainingRemoveButtons.forEach((btn) => {
      expect(btn).toBeDisabled();
    });
  });

  it('shows validation error for invalid email in add form', async () => {
    const user = userEvent.setup();
    renderRepresentativesPage();

    const addButton = screen.getByRole('button', { name: /add representative/i });
    await user.click(addButton);

    const nameInput = screen.getByLabelText(/^name/i);
    const relationshipSelect = screen.getByLabelText(/relationship/i);
    const emailInput = screen.getByLabelText(/email/i);

    await user.type(nameInput, 'Test Rep');
    await user.selectOptions(relationshipSelect, 'Spouse');
    await user.type(emailInput, 'notanemail');

    const submitButton = screen.getByRole('button', { name: /add representative/i });
    await user.click(submitButton);

    expect(await screen.findByText(/please enter a valid email address/i)).toBeInTheDocument();
  });

  it('shows validation error for invalid phone in add form', async () => {
    const user = userEvent.setup();
    renderRepresentativesPage();

    const addButton = screen.getByRole('button', { name: /add representative/i });
    await user.click(addButton);

    const nameInput = screen.getByLabelText(/^name/i);
    const relationshipSelect = screen.getByLabelText(/relationship/i);
    const phoneInput = screen.getByLabelText(/phone/i);

    await user.type(nameInput, 'Test Rep');
    await user.selectOptions(relationshipSelect, 'Spouse');
    await user.type(phoneInput, '123');

    const submitButton = screen.getByRole('button', { name: /add representative/i });
    await user.click(submitButton);

    expect(await screen.findByText(/phone number must contain at least 10 digits/i)).toBeInTheDocument();
  });

  it('removes all representatives and shows empty state', async () => {
    const user = userEvent.setup();
    renderRepresentativesPage();

    // Remove first representative
    let removeButtons = screen.getAllByRole('button', { name: /remove/i });
    await user.click(removeButtons[0]);

    let confirmButton = screen.getByRole('button', { name: /^remove$/i });
    await user.click(confirmButton);

    expect(await screen.findByText(/representative removed successfully/i)).toBeInTheDocument();

    // Wait for toast to dismiss or dismiss it
    // Remove second representative
    removeButtons = screen.getAllByRole('button', { name: /remove/i });
    await user.click(removeButtons[0]);

    confirmButton = screen.getByRole('button', { name: /^remove$/i });
    await user.click(confirmButton);

    await waitFor(() => {
      expect(screen.getByText(/no authorized representatives have been added yet/i)).toBeInTheDocument();
    });

    const stored = getItem(STORAGE_KEYS.REPRESENTATIVES);
    expect(stored.length).toBe(0);
  });
});