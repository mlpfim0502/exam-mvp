import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import AdminUsersPage from '@/app/admin/users/page';

vi.mock('@/hooks/useUsers', () => ({
  useUsers: vi.fn(() => ({
    users: [
      { id: 'u1', display_name: 'Alice', role: 'student', avatar_url: null, line_id: 'l1', created_at: '' },
      { id: 'u2', display_name: 'Bob', role: 'admin', avatar_url: null, line_id: 'l2', created_at: '' },
    ],
    loading: false,
    error: null,
  })),
}));

vi.mock('@/app/admin/actions', () => ({
  toggleUserRole: vi.fn().mockResolvedValue({ success: true }),
}));

vi.mock('sonner', () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

// Mock window.confirm
const originalConfirm = window.confirm;
beforeEach(() => {
  vi.clearAllMocks();
  Object.defineProperty(window, 'confirm', {
    writable: true,
    value: vi.fn(() => true),
  });
});

afterEach(() => {
  Object.defineProperty(window, 'confirm', {
    writable: true,
    value: originalConfirm,
  });
});

describe('AdminUsersPage', () => {
  it('renders the page heading', () => {
    render(<AdminUsersPage />);
    expect(screen.getByText('Users')).toBeInTheDocument();
  });

  it('renders all users in the list', () => {
    render(<AdminUsersPage />);
    expect(screen.getByText('Alice')).toBeInTheDocument();
    expect(screen.getByText('Bob')).toBeInTheDocument();
  });

  it('shows role badges for each user', () => {
    render(<AdminUsersPage />);
    expect(screen.getByText('student')).toBeInTheDocument();
    expect(screen.getByText('admin')).toBeInTheDocument();
  });

  it('renders a toggle role button for each user', () => {
    render(<AdminUsersPage />);
    const buttons = screen.getAllByRole('button', { name: /toggle role/i });
    expect(buttons).toHaveLength(2);
  });

  it('calls window.confirm before toggling role', () => {
    render(<AdminUsersPage />);
    const buttons = screen.getAllByRole('button', { name: /toggle role/i });
    fireEvent.click(buttons[0]);
    expect(window.confirm).toHaveBeenCalled();
  });

  it('calls toggleUserRole when user confirms', async () => {
    const { toggleUserRole } = await import('@/app/admin/actions');
    render(<AdminUsersPage />);
    const buttons = screen.getAllByRole('button', { name: /toggle role/i });
    fireEvent.click(buttons[0]);
    await waitFor(() => expect(toggleUserRole).toHaveBeenCalledWith('u1', 'student'));
  });

  it('does not call toggleUserRole when user cancels', async () => {
    (window.confirm as ReturnType<typeof vi.fn>).mockReturnValueOnce(false);
    const { toggleUserRole } = await import('@/app/admin/actions');
    render(<AdminUsersPage />);
    const buttons = screen.getAllByRole('button', { name: /toggle role/i });
    fireEvent.click(buttons[0]);
    expect(toggleUserRole).not.toHaveBeenCalled();
  });

  it('shows success toast after successful toggle', async () => {
    const { toast } = await import('sonner');
    render(<AdminUsersPage />);
    const buttons = screen.getAllByRole('button', { name: /toggle role/i });
    fireEvent.click(buttons[0]);
    await waitFor(() => expect(toast.success).toHaveBeenCalled());
  });

  it('shows error toast when toggle fails', async () => {
    const { toggleUserRole } = await import('@/app/admin/actions');
    (toggleUserRole as ReturnType<typeof vi.fn>).mockResolvedValue({ success: false, error: 'Forbidden' });
    const { toast } = await import('sonner');
    render(<AdminUsersPage />);
    const buttons = screen.getAllByRole('button', { name: /toggle role/i });
    fireEvent.click(buttons[0]);
    await waitFor(() => expect(toast.error).toHaveBeenCalledWith('Forbidden'));
  });
});
