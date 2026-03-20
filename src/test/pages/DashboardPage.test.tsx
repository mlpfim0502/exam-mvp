import { render, screen, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';
import { useRouter } from 'next/navigation';
import type { Subject } from '@/lib/types';

const subjects: Subject[] = [
  { id: 's1', name: 'Mathematics', description: 'Algebra', icon_url: null, class_id: null, created_at: '' },
  { id: 's2', name: 'Science', description: 'Physics', icon_url: null, class_id: null, created_at: '' },
];

// Mock hooks
vi.mock('@/hooks/useSubjects', () => ({
  useSubjects: vi.fn(() => ({ subjects, loading: false, error: null })),
}));

vi.mock('@/components/LiffProvider', () => ({
  useLiff: vi.fn(() => ({
    profile: { userId: 'u1', displayName: 'Alice', pictureUrl: undefined },
    supabaseUserId: 'uuid-1',
    isInitialized: true,
    isLoggedIn: true,
    error: null,
  })),
}));

import DashboardPage from '@/app/(mobile)/page';
import { useSubjects } from '@/hooks/useSubjects';

describe('DashboardPage', () => {
  it('renders page header', () => {
    render(<DashboardPage />);
    expect(screen.getByText('Exam Practice')).toBeInTheDocument();
  });

  it('shows welcome message with user name', () => {
    render(<DashboardPage />);
    expect(screen.getByText('Alice')).toBeInTheDocument();
  });

  it('renders subject cards', () => {
    render(<DashboardPage />);
    expect(screen.getByText('Mathematics')).toBeInTheDocument();
    expect(screen.getByText('Science')).toBeInTheDocument();
  });

  it('does not show inline exams section', () => {
    render(<DashboardPage />);
    expect(screen.queryByText('Algebra Basics')).not.toBeInTheDocument();
  });

  it('clicking a subject navigates to /qbank/[subjectId]', () => {
    const push = vi.fn();
    vi.mocked(useRouter).mockReturnValue({ push, back: vi.fn(), forward: vi.fn(), refresh: vi.fn(), replace: vi.fn(), prefetch: vi.fn() });
    render(<DashboardPage />);
    fireEvent.click(screen.getByText('Mathematics'));
    expect(push).toHaveBeenCalledWith('/qbank/s1');
  });

  it('shows loading skeletons when subjects are loading', () => {
    vi.mocked(useSubjects).mockReturnValueOnce({ subjects: [], loading: true, error: null });

    const { container } = render(<DashboardPage />);
    expect(container.querySelector('.animate-pulse')).toBeInTheDocument();
  });
});
