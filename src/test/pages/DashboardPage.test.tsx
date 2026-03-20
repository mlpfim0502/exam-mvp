import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import type { Subject, Exam } from '@/lib/types';

const subjects: Subject[] = [
  { id: 's1', name: 'Mathematics', description: 'Algebra', icon_url: null, created_at: '' },
  { id: 's2', name: 'Science', description: 'Physics', icon_url: null, created_at: '' },
];

const exams: Exam[] = [
  { id: 'e1', subject_id: 's1', title: 'Algebra Basics', description: null, time_limit_minutes: 15, created_at: '' },
];

// Mock hooks
vi.mock('@/hooks/useSubjects', () => ({
  useSubjects: vi.fn(() => ({ subjects, loading: false, error: null })),
}));

vi.mock('@/hooks/useExams', () => ({
  useExams: vi.fn(() => ({ exams: [], loading: false, error: null })),
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

import DashboardPage from '@/app/page';
import { useExams } from '@/hooks/useExams';
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

  it('does not show exams section before selecting a subject', () => {
    render(<DashboardPage />);
    expect(screen.queryByText('Algebra Basics')).not.toBeInTheDocument();
  });

  it('shows exams when a subject is selected', async () => {
    vi.mocked(useExams).mockReturnValue({ exams, loading: false, error: null });

    render(<DashboardPage />);
    fireEvent.click(screen.getByText('Mathematics'));
    await waitFor(() => expect(screen.getByText('Algebra Basics')).toBeInTheDocument());
  });

  it('toggles subject off when clicked again', () => {
    render(<DashboardPage />);
    const mathBtn = screen.getByText('Mathematics').closest('button')!;
    fireEvent.click(mathBtn);
    fireEvent.click(mathBtn);
    // exams section disappears
    expect(screen.queryByText(/Exams/)).not.toBeInTheDocument();
  });

  it('shows loading skeletons when subjects are loading', async () => {
    vi.mocked(useSubjects).mockReturnValueOnce({ subjects: [], loading: true, error: null });

    const { container } = render(<DashboardPage />);
    expect(container.querySelector('.animate-pulse')).toBeInTheDocument();
  });

  it('shows empty state when no exams in subject', async () => {
    vi.mocked(useExams).mockReturnValue({ exams: [], loading: false, error: null });

    render(<DashboardPage />);
    fireEvent.click(screen.getByText('Mathematics'));
    await waitFor(() => expect(screen.getByText('No exams available yet.')).toBeInTheDocument());
  });
});
