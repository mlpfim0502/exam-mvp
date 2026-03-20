import { renderHook, waitFor } from '@testing-library/react';
import { vi } from 'vitest';

vi.mock('@/lib/supabase', () => {
  const chain = {
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    order: vi.fn().mockResolvedValue({
      data: [
        { id: 'e1', subject_id: 's1', title: 'Algebra', description: null, time_limit_minutes: 15, created_at: '' },
      ],
      error: null,
    }),
  };
  return { supabase: { from: vi.fn(() => chain) } };
});

import { useExams } from '@/hooks/useExams';

describe('useExams', () => {
  it('returns empty array and not loading when subjectId is null', () => {
    const { result } = renderHook(() => useExams(null));
    expect(result.current.exams).toEqual([]);
    expect(result.current.loading).toBe(false);
  });

  it('starts loading when subjectId is provided', () => {
    const { result } = renderHook(() => useExams('s1'));
    expect(result.current.loading).toBe(true);
  });

  it('fetches and returns exams when subjectId provided', async () => {
    const { result } = renderHook(() => useExams('s1'));
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.exams).toHaveLength(1);
    expect(result.current.exams[0].title).toBe('Algebra');
    expect(result.current.error).toBeNull();
  });

  it('returns error on failure', async () => {
    const { supabase } = await import('@/lib/supabase');
    const errorChain = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockResolvedValue({ data: null, error: { message: 'fetch failed' } }),
    };
    vi.mocked(supabase.from).mockReturnValueOnce(errorChain as never);

    const { result } = renderHook(() => useExams('s1'));
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.error).toBe('fetch failed');
  });
});
