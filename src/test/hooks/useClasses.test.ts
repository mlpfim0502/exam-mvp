import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useClasses } from '@/hooks/useClasses';

vi.mock('@/lib/supabase', () => ({
  supabase: {
    from: vi.fn(),
  },
}));

import { supabase } from '@/lib/supabase';

const mockClasses = [
  { id: 'c1', name: 'M5', created_at: '2026-01-01T00:00:00Z' },
  { id: 'c2', name: 'M6', created_at: '2026-01-01T00:00:00Z' },
];

beforeEach(() => {
  vi.clearAllMocks();
  (supabase.from as ReturnType<typeof vi.fn>).mockReturnValue({
    select: vi.fn().mockReturnValue({
      order: vi.fn().mockResolvedValue({ data: mockClasses, error: null }),
    }),
  });
});

describe('useClasses', () => {
  it('fetches and returns classes', async () => {
    const { result } = renderHook(() => useClasses());
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.classes).toEqual(mockClasses);
    expect(result.current.error).toBeNull();
  });

  it('starts in loading state', () => {
    const { result } = renderHook(() => useClasses());
    expect(result.current.loading).toBe(true);
  });

  it('sets error when fetch fails', async () => {
    (supabase.from as ReturnType<typeof vi.fn>).mockReturnValue({
      select: vi.fn().mockReturnValue({
        order: vi.fn().mockResolvedValue({ data: null, error: { message: 'Network error' } }),
      }),
    });
    const { result } = renderHook(() => useClasses());
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.error).toBe('Network error');
    expect(result.current.classes).toEqual([]);
  });
});
