import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import type { Exam, Question } from '@/lib/types';

const exam: Exam = {
  id: 'exam-123',
  subject_id: 's1',
  title: 'Algebra Basics',
  description: null,
  time_limit_minutes: 15,
  created_at: '',
};

const questions: Question[] = [
  {
    id: 'q1', exam_id: 'exam-123', q_num: 1, type: 'MCQ',
    stem: 'What is 2 + 2?',
    opt_a: 'Three', opt_b: 'Four', opt_c: 'Five', opt_d: null, opt_e: null,
    answer: 'B', explanation: '2+2=4', explanation_img_url: null, stem_img_url: null, created_at: '',
  },
  {
    id: 'q2', exam_id: 'exam-123', q_num: 2, type: 'TF',
    stem: 'The sky is blue.',
    opt_a: null, opt_b: null, opt_c: null, opt_d: null, opt_e: null,
    answer: 'T', explanation: null, explanation_img_url: null, stem_img_url: null, created_at: '',
  },
];

vi.mock('@/hooks/useExam', () => ({
  useExam: vi.fn(() => ({ exam, questions, loading: false, error: null })),
}));

vi.mock('@/components/LiffProvider', () => ({
  useLiff: vi.fn(() => ({
    profile: null,
    supabaseUserId: 'uuid-1',
    isInitialized: true,
    isLoggedIn: true,
    error: null,
  })),
}));

vi.mock('@/lib/supabase', () => ({
  supabase: {
    from: vi.fn(() => ({
      insert: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: { id: 'attempt-1' }, error: null }),
      update: vi.fn().mockReturnThis(),
      eq: vi.fn().mockResolvedValue({ data: null, error: null }),
    })),
  },
}));

import ExamPage from '@/app/(mobile)/exam/[id]/page';
import { useExam } from '@/hooks/useExam';

describe('ExamPage', () => {
  it('renders exam title in header', async () => {
    render(<ExamPage />);
    await waitFor(() => expect(screen.getByText('Algebra Basics')).toBeInTheDocument());
  });

  it('renders both questions', async () => {
    render(<ExamPage />);
    await waitFor(() => {
      expect(screen.getByText('What is 2 + 2?')).toBeInTheDocument();
      expect(screen.getByText('The sky is blue.')).toBeInTheDocument();
    });
  });

  it('renders Submit Exam button', async () => {
    render(<ExamPage />);
    await waitFor(() =>
      expect(screen.getByRole('button', { name: /Submit Exam/i })).toBeInTheDocument(),
    );
  });

  it('shows unanswered count before answering', async () => {
    render(<ExamPage />);
    await waitFor(() => expect(screen.getByText(/2 questions unanswered/i)).toBeInTheDocument());
  });

  it('shows timer when time_limit_minutes set', async () => {
    render(<ExamPage />);
    await waitFor(() => expect(screen.getByText(/15:00/)).toBeInTheDocument());
  });

  it('shows loading screen while exam loads', () => {
    vi.mocked(useExam).mockReturnValueOnce({ exam: null, questions: [], loading: true, error: null });
    render(<ExamPage />);
    expect(screen.getByText(/Loading exam/i)).toBeInTheDocument();
  });

  it('shows error when exam not found', () => {
    vi.mocked(useExam).mockReturnValueOnce({ exam: null, questions: [], loading: false, error: 'Not found' });
    render(<ExamPage />);
    expect(screen.getByText('Not found')).toBeInTheDocument();
  });

  it('updates progress when an answer is selected', async () => {
    render(<ExamPage />);
    await waitFor(() => expect(screen.getByText('What is 2 + 2?')).toBeInTheDocument());
    // Click option B (Four)
    fireEvent.click(screen.getByText('Four'));
    expect(screen.getByText(/1 question unanswered/i)).toBeInTheDocument();
  });

  it('does not show timer when exam has no time limit', async () => {
    vi.mocked(useExam).mockReturnValueOnce({
      exam: { ...exam, time_limit_minutes: null },
      questions,
      loading: false,
      error: null,
    });
    render(<ExamPage />);
    await waitFor(() => expect(screen.getByText('Algebra Basics')).toBeInTheDocument());
    expect(screen.queryByText(/\d+:\d+/)).not.toBeInTheDocument();
  });

  it('disables submit button while submitting', async () => {
    const { useRouter } = await import('next/navigation');
    const push = vi.fn();
    vi.mocked(useRouter).mockReturnValue({ push } as never);

    render(<ExamPage />);
    await waitFor(() => expect(screen.getByText('What is 2 + 2?')).toBeInTheDocument());

    // Answer all questions so submit is active
    fireEvent.click(screen.getByText('Four'));   // Q1 → B
    fireEvent.click(screen.getByText('True'));    // Q2 → T

    const submitBtn = screen.getByRole('button', { name: /Submit Exam/i });
    fireEvent.click(submitBtn);

    // After clicking, button should show Submitting... and navigate
    await waitFor(() => expect(push).toHaveBeenCalledWith(
      expect.stringContaining('/results'),
    ));
  });

  it('shows no unanswered warning when all answered', async () => {
    render(<ExamPage />);
    await waitFor(() => expect(screen.getByText('What is 2 + 2?')).toBeInTheDocument());
    fireEvent.click(screen.getByText('Four'));
    fireEvent.click(screen.getByText('True'));
    expect(screen.queryByText(/unanswered/i)).not.toBeInTheDocument();
  });
});
