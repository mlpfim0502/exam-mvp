import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import { useRouter } from 'next/navigation';
import ClassPage from '@/app/(mobile)/page';

vi.mock('next/navigation', () => ({
  useRouter: vi.fn(() => ({ push: vi.fn(), back: vi.fn(), forward: vi.fn(), refresh: vi.fn(), replace: vi.fn(), prefetch: vi.fn() })),
  usePathname: vi.fn(() => '/'),
}));

vi.mock('@/components/LiffProvider', () => ({
  useLiff: () => ({ profile: { displayName: 'Test User', pictureUrl: null } }),
}));
vi.mock('@/hooks/useSubjects', () => ({
  useSubjects: () => ({
    subjects: [{ id: 's1', name: 'Math', description: null, icon_url: null, class_id: null, created_at: '' }],
    loading: false,
  }),
}));

describe('ClassPage', () => {
  it('clicking a subject navigates to /qbank/[subjectId]', async () => {
    const user = userEvent.setup();
    const push = vi.fn();
    vi.mocked(useRouter).mockReturnValue({ push, back: vi.fn(), forward: vi.fn(), refresh: vi.fn(), replace: vi.fn(), prefetch: vi.fn() });
    render(<ClassPage />);
    await user.click(screen.getByText('Math'));
    expect(push).toHaveBeenCalledWith('/qbank/s1');
  });

  it('shows welcome message when profile is loaded', () => {
    render(<ClassPage />);
    expect(screen.getByText('Test User')).toBeInTheDocument();
  });
});
