import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import AdminUsersPage from '@/app/admin/users/page';

vi.mock('@/hooks/useUsers', () => ({
  useUsers: vi.fn(() => ({
    users: [
      { id: 'u1', display_name: 'Alice', role: 'student', avatar_url: null, line_id: 'l1', created_at: '', is_blocked: false, class_id: null },
      { id: 'u2', display_name: 'Bob', role: 'admin', avatar_url: null, line_id: 'l2', created_at: '', is_blocked: true, class_id: 'c1' },
    ],
    loading: false,
    error: null,
  })),
}));

vi.mock('@/hooks/useClasses', () => ({
  useClasses: vi.fn(() => ({
    classes: [{ id: 'c1', name: 'Math 101' }],
    loading: false,
    error: null,
  })),
}));

vi.mock('@/app/admin/actions', () => ({
  toggleUserRole: vi.fn().mockResolvedValue({ success: true }),
  updateUser: vi.fn().mockResolvedValue({ success: true }),
}));

vi.mock('sonner', () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

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
    expect(screen.getByText('Users Management')).toBeInTheDocument();
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

  it('renders a toggle role button for each user based on title', () => {
    render(<AdminUsersPage />);
    const buttons = screen.getAllByTitle(/Promote to Admin|Demote to Student/i);
    expect(buttons).toHaveLength(2);
  });

  it('calls window.confirm before toggling role', () => {
    render(<AdminUsersPage />);
    const buttons = screen.getAllByTitle(/Promote to Admin|Demote to Student/i);
    fireEvent.click(buttons[0]);
    expect(window.confirm).toHaveBeenCalled();
  });

  it('calls toggleUserRole when user confirms', async () => {
    const { toggleUserRole } = await import('@/app/admin/actions');
    render(<AdminUsersPage />);
    const buttons = screen.getAllByTitle(/Promote to Admin|Demote to Student/i);
    fireEvent.click(buttons[0]);
    await waitFor(() => expect(toggleUserRole).toHaveBeenCalledWith('u1', 'student'));
  });

  it('shows success toast after successful toggle', async () => {
    const { toast } = await import('sonner');
    render(<AdminUsersPage />);
    const buttons = screen.getAllByTitle(/Promote to Admin|Demote to Student/i);
    fireEvent.click(buttons[0]);
    await waitFor(() => expect(toast.success).toHaveBeenCalled());
  });

  it('renders a block/unblock button for each user based on title', () => {
    render(<AdminUsersPage />);
    const buttons = screen.getAllByTitle(/Block User|Unblock User/i);
    expect(buttons).toHaveLength(2);
  });
  
  it('calls updateUser to block when confirmed', async () => {
    const { updateUser } = await import('@/app/admin/actions');
    render(<AdminUsersPage />);
    const buttons = screen.getAllByTitle(/Block User|Unblock User/i);
    // u1 is not blocked, so the button should be "Block User"
    fireEvent.click(buttons[0]); // u1 (Alice)
    await waitFor(() => expect(updateUser).toHaveBeenCalledWith('u1', { is_blocked: true }));
  });
});
