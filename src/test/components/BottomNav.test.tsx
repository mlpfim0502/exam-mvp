import { render, screen } from '@testing-library/react';
import { usePathname } from 'next/navigation';
import { vi } from 'vitest';
import BottomNav from '@/components/BottomNav';

it('renders Class and Qbank tabs', () => {
  render(<BottomNav />);
  expect(screen.getByText('Class')).toBeInTheDocument();
  expect(screen.getByText('Qbank')).toBeInTheDocument();
});

it('highlights Class tab when on /', () => {
  render(<BottomNav />);
  const classLink = screen.getByRole('link', { name: /class/i });
  expect(classLink).toHaveClass('text-indigo-600');
});

it('renders nothing on /exam/* routes', () => {
  vi.mocked(usePathname).mockReturnValueOnce('/exam/abc123');
  const { container } = render(<BottomNav />);
  expect(container.firstChild).toBeNull();
});
