import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
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

  it('shows loading skeleton when loading', async () => {
    const { useUsers } = (await import('@/hooks/useUsers')) as any;
    useUsers.mockReturnValueOnce({ users: [], loading: true, error: null });
    render(<AdminUsersPage />);
    const skeletons = document.querySelectorAll('.animate-pulse');
    expect(skeletons.length).toBeGreaterThan(0);
  });
});
