import { render, screen, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import type { Question } from '@/lib/types';

const attempt = {
  id: 'attempt-abc',
  user_id: 'uuid-1',
  exam_id: 'exam-123',
  score: 80,
  is_completed: true,
  started_at: '',
  completed_at: '',
};

const q1: Question = {
  id: 'q1', exam_id: 'exam-123', q_num: 1, type: 'MCQ',
  stem: 'What is 2 + 2?',
  opt_a: 'Three', opt_b: 'Four', opt_c: null, opt_d: null, opt_e: null,
  answer: 'B', explanation: '2+2 equals 4', explanation_img_url: null, stem_img_url: null, created_at: '',
};

const q2: Question = {
  id: 'q2', exam_id: 'exam-123', q_num: 2, type: 'TF',
  stem: 'The sky is blue.',
  opt_a: null, opt_b: null, opt_c: null, opt_d: null, opt_e: null,
  answer: 'T', explanation: null, explanation_img_url: null, stem_img_url: null, created_at: '',
};

vi.mock('@/lib/supabase', () => ({
  supabase: {
    from: vi.fn((table: string) => {
      if (table === 'exam_attempts') {
        return {
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          single: vi.fn().mockResolvedValue({ data: attempt, error: null }),
        };
      }
      // attempt_answers
      return {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockResolvedValue({
          data: [
            { attempt_id: 'attempt-abc', question_id: 'q1', user_response: 'B', is_correct: true, questions: q1 },
            { attempt_id: 'attempt-abc', question_id: 'q2', user_response: 'T', is_correct: true, questions: q2 },
          ],
          error: null,
        }),
      };
    }),
  },
}));

import ResultsPage from '@/app/exam/[id]/results/page';
import { supabase } from '@/lib/supabase';
import { useSearchParams } from 'next/navigation';

describe('ResultsPage', () => {
  it('shows loading screen initially', () => {
    render(<ResultsPage />);
    expect(screen.getByText(/Loading results/i)).toBeInTheDocument();
  });

  it('renders score after loading', async () => {
    render(<ResultsPage />);
    await waitFor(() => expect(screen.getByText('80')).toBeInTheDocument());
  });

  it('renders pass message for score ≥ 60', async () => {
    render(<ResultsPage />);
    await waitFor(() => expect(screen.getByText(/Well done/i)).toBeInTheDocument());
  });

  it('renders correct count', async () => {
    render(<ResultsPage />);
    await waitFor(() => expect(screen.getByText('2 / 2 correct')).toBeInTheDocument());
  });

  it('renders question stems in review', async () => {
    render(<ResultsPage />);
    await waitFor(() => {
      expect(screen.getByText('What is 2 + 2?')).toBeInTheDocument();
      expect(screen.getByText('The sky is blue.')).toBeInTheDocument();
    });
  });

  it('shows explanation when present', async () => {
    render(<ResultsPage />);
    await waitFor(() => expect(screen.getByText('2+2 equals 4')).toBeInTheDocument());
  });

  it('renders Back to Dashboard button', async () => {
    render(<ResultsPage />);
    await waitFor(() =>
      expect(screen.getByRole('button', { name: /Back to Dashboard/i })).toBeInTheDocument(),
    );
  });

  it('shows fail message for score < 60', async () => {
    vi.mocked(supabase.from).mockImplementationOnce(() => ({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({
        data: { ...attempt, score: 40 },
        error: null,
      }),
    } as never));

    render(<ResultsPage />);
    await waitFor(() => expect(screen.getByText(/Keep practicing/i)).toBeInTheDocument());
  });

  it('shows error when attemptId missing', async () => {
    vi.mocked(useSearchParams).mockReturnValueOnce({ get: vi.fn(() => null) } as never);

    render(<ResultsPage />);
    await waitFor(() => expect(screen.getByText(/No attempt ID found/i)).toBeInTheDocument());
  });

  it('shows error when attempt fetch fails', async () => {
    vi.mocked(supabase.from).mockImplementationOnce(() => ({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: null, error: { message: 'fetch error' } }),
    } as never));

    render(<ResultsPage />);
    await waitFor(() => expect(screen.getByText('Could not load results.')).toBeInTheDocument());
  });

  it('shows error when answers fetch fails', async () => {
    // First call (exam_attempts) succeeds
    vi.mocked(supabase.from).mockImplementationOnce(() => ({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: attempt, error: null }),
    } as never));
    // Second call (attempt_answers) fails
    vi.mocked(supabase.from).mockImplementationOnce(() => ({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockResolvedValue({ data: null, error: { message: 'answers error' } }),
    } as never));

    render(<ResultsPage />);
    await waitFor(() => expect(screen.getByText('answers error')).toBeInTheDocument());
  });

  it('shows "Not answered" for skipped questions', async () => {
    vi.mocked(supabase.from).mockImplementationOnce(() => ({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: attempt, error: null }),
    } as never));
    vi.mocked(supabase.from).mockImplementationOnce(() => ({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockResolvedValue({
        data: [
          // user_response is empty string = unanswered
          { attempt_id: 'attempt-abc', question_id: 'q1', user_response: '', is_correct: false, questions: q1 },
        ],
        error: null,
      }),
    } as never));

    render(<ResultsPage />);
    await waitFor(() => expect(screen.getByText('Not answered')).toBeInTheDocument());
  });
});
