import { renderHook, waitFor } from '@testing-library/react';
import { vi } from 'vitest';

vi.mock('@/lib/supabase', () => {
  const chain = {
    select: vi.fn().mockReturnThis(),
    order: vi.fn().mockResolvedValue({
      data: [
        { id: 's1', name: 'Math', description: 'Algebra', icon_url: null, created_at: '' },
        { id: 's2', name: 'Science', description: null, icon_url: null, created_at: '' },
      ],
      error: null,
    }),
  };
  return { supabase: { from: vi.fn(() => chain) } };
});

import { useSubjects } from '@/hooks/useSubjects';

describe('useSubjects', () => {
  it('starts in loading state', () => {
    const { result } = renderHook(() => useSubjects());
    expect(result.current.loading).toBe(true);
  });

  it('returns subjects on success', async () => {
    const { result } = renderHook(() => useSubjects());
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.subjects).toHaveLength(2);
    expect(result.current.subjects[0].name).toBe('Math');
    expect(result.current.error).toBeNull();
  });

  it('returns error string on failure', async () => {
    const { supabase } = await import('@/lib/supabase');
    const errorChain = {
      select: vi.fn().mockReturnThis(),
      order: vi.fn().mockResolvedValue({ data: null, error: { message: 'DB error' } }),
    };
    vi.mocked(supabase.from).mockReturnValueOnce(errorChain as never);

    const { result } = renderHook(() => useSubjects());
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.error).toBe('DB error');
    expect(result.current.subjects).toEqual([]);
  });
});
