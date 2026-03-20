import { renderHook, waitFor } from '@testing-library/react';
import { vi } from 'vitest';

const examData = {
  id: 'e1',
  title: 'Algebra Basics',
  subject_id: 's1',
  description: 'Core algebra',
  time_limit_minutes: 15,
  created_at: '',
};

const questionsData = [
  {
    id: 'q1', exam_id: 'e1', q_num: 1, type: 'MCQ', stem: 'Q1',
    opt_a: 'A', opt_b: 'B', opt_c: null, opt_d: null, opt_e: null,
    answer: 'A', explanation: null, explanation_img_url: null,
    stem_img_url: null, created_at: '',
  },
];

vi.mock('@/lib/supabase', () => ({
  supabase: {
    from: vi.fn((table: string) => {
      if (table === 'exams') {
        return {
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          single: vi.fn().mockResolvedValue({ data: examData, error: null }),
        };
      }
      // questions
      return {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({ data: questionsData, error: null }),
      };
    }),
  },
}));

import { useExam } from '@/hooks/useExam';

describe('useExam', () => {
  it('starts in loading state', () => {
    const { result } = renderHook(() => useExam('e1'));
    expect(result.current.loading).toBe(true);
  });

  it('returns exam and questions on success', async () => {
    const { result } = renderHook(() => useExam('e1'));
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.exam?.title).toBe('Algebra Basics');
    expect(result.current.questions).toHaveLength(1);
    expect(result.current.questions[0].stem).toBe('Q1');
    expect(result.current.error).toBeNull();
  });

  it('returns error when exam fetch fails', async () => {
    const { supabase } = await import('@/lib/supabase');
    vi.mocked(supabase.from).mockImplementationOnce(() => ({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: null, error: { message: 'not found' } }),
    } as never));
    // second call (questions) still works
    vi.mocked(supabase.from).mockImplementationOnce(() => ({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockResolvedValue({ data: [], error: null }),
    } as never));

    const { result } = renderHook(() => useExam('bad-id'));
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.error).toBe('not found');
    expect(result.current.exam).toBeNull();
  });
});
