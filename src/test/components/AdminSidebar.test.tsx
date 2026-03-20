import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import AdminSidebar from '@/components/AdminSidebar';

vi.mock('next/navigation', () => ({
  usePathname: vi.fn(() => '/admin'),
  useParams: vi.fn(() => ({})),
  useRouter: vi.fn(() => ({ push: vi.fn() })),
  useSearchParams: vi.fn(() => ({ get: vi.fn(() => null) })),
}));

describe('AdminSidebar', () => {
  it('renders all navigation links', () => {
    render(<AdminSidebar />);
    expect(screen.getByText('Overview')).toBeInTheDocument();
    expect(screen.getByText('Classes')).toBeInTheDocument();
    expect(screen.getByText('Subjects')).toBeInTheDocument();
    expect(screen.getByText('Users')).toBeInTheDocument();
  });

  it('renders navigation links with correct hrefs', () => {
    render(<AdminSidebar />);
    const overviewLink = screen.getByText('Overview').closest('a');
    const classesLink = screen.getByText('Classes').closest('a');
    expect(overviewLink).toHaveAttribute('href', '/admin');
    expect(classesLink).toHaveAttribute('href', '/admin/classes');
  });

  it('highlights active link when on /admin', () => {
    render(<AdminSidebar />);
    const overviewLink = screen.getByText('Overview').closest('a');
    expect(overviewLink).toHaveClass('bg-indigo-100');
  });

  it('does not highlight inactive links', () => {
    render(<AdminSidebar />);
    const classesLink = screen.getByText('Classes').closest('a');
    expect(classesLink).not.toHaveClass('bg-indigo-100');
  });
});
