import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useUsers } from '@/hooks/useUsers';

vi.mock('@/lib/supabase', () => ({
  supabase: { from: vi.fn() },
}));

import { supabase } from '@/lib/supabase';

const mockUsers = [
  { id: 'u1', line_id: 'line-1', display_name: 'Alice', avatar_url: null, role: 'student', created_at: '2026-01-01T00:00:00Z' },
  { id: 'u2', line_id: 'line-2', display_name: 'Bob', avatar_url: null, role: 'admin', created_at: '2026-01-01T00:00:00Z' },
];

beforeEach(() => {
  vi.clearAllMocks();
  (supabase.from as ReturnType<typeof vi.fn>).mockReturnValue({
    select: vi.fn().mockReturnValue({
      order: vi.fn().mockResolvedValue({ data: mockUsers, error: null }),
    }),
  });
});

describe('useUsers', () => {
  it('fetches and returns users', async () => {
    const { result } = renderHook(() => useUsers());
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.users).toEqual(mockUsers);
    expect(result.current.error).toBeNull();
  });

  it('starts in loading state', () => {
    const { result } = renderHook(() => useUsers());
    expect(result.current.loading).toBe(true);
  });

  it('sets error when fetch fails', async () => {
    (supabase.from as ReturnType<typeof vi.fn>).mockReturnValue({
      select: vi.fn().mockReturnValue({
        order: vi.fn().mockResolvedValue({ data: null, error: { message: 'DB error' } }),
      }),
    });
    const { result } = renderHook(() => useUsers());
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.error).toBe('DB error');
    expect(result.current.users).toEqual([]);
  });
});
