import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import AdminSidebar from '@/components/AdminSidebar';

vi.mock('@/app/admin/actions', () => ({
  adminLogout: vi.fn(),
}));

vi.mock('next/navigation', () => ({
  usePathname: vi.fn(() => '/admin'),
  useParams: vi.fn(() => ({})),
  useRouter: vi.fn(() => ({ push: vi.fn() })),
  useSearchParams: vi.fn(() => ({ get: vi.fn(() => null) })),
}));

// The sidebar renders two navs (desktop + mobile) so each label appears twice.
// getAllByText()[0] targets the desktop nav instance.
describe('AdminSidebar', () => {
  it('renders all navigation links', () => {
    render(<AdminSidebar />);
    expect(screen.getAllByText('Overview').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Classes').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Exams').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Users').length).toBeGreaterThan(0);
    // Subjects is no longer a separate nav item
    expect(screen.queryByText('Subjects')).toBeNull();
  });

  it('renders navigation links with correct hrefs', () => {
    render(<AdminSidebar />);
    const overviewLink = screen.getAllByText('Overview')[0].closest('a');
    const classesLink  = screen.getAllByText('Classes')[0].closest('a');
    expect(overviewLink).toHaveAttribute('href', '/admin');
    expect(classesLink).toHaveAttribute('href', '/admin/classes');
  });

  it('highlights active link when on /admin', () => {
    render(<AdminSidebar />);
    const overviewLink = screen.getAllByText('Overview')[0].closest('a');
    expect(overviewLink).toHaveClass('bg-indigo-100');
  });

  it('does not highlight inactive links', () => {
    render(<AdminSidebar />);
    const classesLink = screen.getAllByText('Classes')[0].closest('a');
    expect(classesLink).not.toHaveClass('bg-indigo-100');
  });
});
