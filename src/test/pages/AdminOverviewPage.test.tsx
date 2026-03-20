import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import AdminOverviewPage from '@/app/admin/page';

vi.mock('@/hooks/useSubjects', () => ({
  useSubjects: vi.fn(() => ({ subjects: [{ id: '1' }, { id: '2' }], loading: false, error: null })),
}));
vi.mock('@/hooks/useClasses', () => ({
  useClasses: vi.fn(() => ({ classes: [{ id: 'c1', name: 'M5', created_at: '' }], loading: false, error: null })),
}));
vi.mock('@/hooks/useUsers', () => ({
  useUsers: vi.fn(() => ({ users: [{ id: 'u1' }, { id: 'u2' }, { id: 'u3' }], loading: false, error: null })),
}));

describe('AdminOverviewPage', () => {
  it('renders the page heading', () => {
    render(<AdminOverviewPage />);
    expect(screen.getByText('Overview')).toBeInTheDocument();
  });

  it('renders metric labels', () => {
    render(<AdminOverviewPage />);
    expect(screen.getByText('Classes')).toBeInTheDocument();
    expect(screen.getByText('Subjects')).toBeInTheDocument();
    expect(screen.getByText('Users')).toBeInTheDocument();
  });

  it('renders correct counts from hooks', async () => {
    render(<AdminOverviewPage />);
    await waitFor(() => {
      expect(screen.getByText('1')).toBeInTheDocument(); // classes count
      expect(screen.getByText('2')).toBeInTheDocument(); // subjects count
      expect(screen.getByText('3')).toBeInTheDocument(); // users count
    });
  });

  it('renders New Class CTA link', () => {
    render(<AdminOverviewPage />);
    const link = screen.getByText('New Class').closest('a');
    expect(link).toHaveAttribute('href', '/admin/classes/new');
  });

  it('renders New Subject CTA link', () => {
    render(<AdminOverviewPage />);
    const link = screen.getByText('New Subject').closest('a');
    expect(link).toHaveAttribute('href', '/admin/subjects/new');
  });
});
