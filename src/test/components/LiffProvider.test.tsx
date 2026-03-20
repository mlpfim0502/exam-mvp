import { render, screen, waitFor } from '@testing-library/react';
import { vi } from 'vitest';

// Mock LIFF — dynamic import inside the component
vi.mock('@line/liff', () => ({
  default: {
    init: vi.fn().mockResolvedValue(undefined),
    isLoggedIn: vi.fn().mockReturnValue(true),
    getProfile: vi.fn().mockResolvedValue({
      userId: 'line-user-1',
      displayName: 'Test User',
      pictureUrl: 'https://example.com/pic.jpg',
    }),
    login: vi.fn(),
  },
}));

// Mock Supabase
vi.mock('@/lib/supabase', () => ({
  supabase: {
    from: vi.fn(() => ({
      upsert: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: { id: 'uuid-123' }, error: null }),
    })),
  },
}));

vi.stubEnv('NEXT_PUBLIC_LIFF_ID', 'test-liff-id');

import { LiffProvider, useLiff } from '@/components/LiffProvider';

function TestConsumer() {
  const { isInitialized, isLoggedIn, profile, supabaseUserId, error } = useLiff();
  return (
    <div>
      <span data-testid="initialized">{String(isInitialized)}</span>
      <span data-testid="logged-in">{String(isLoggedIn)}</span>
      <span data-testid="name">{profile?.displayName ?? 'none'}</span>
      <span data-testid="user-id">{supabaseUserId ?? 'none'}</span>
      <span data-testid="error">{error ?? 'none'}</span>
    </div>
  );
}

describe('LiffProvider', () => {
  it('shows loading screen during LIFF init', () => {
    render(
      <LiffProvider>
        <TestConsumer />
      </LiffProvider>,
    );
    expect(screen.getByText(/Connecting/i)).toBeInTheDocument();
  });

  it('provides profile and supabaseUserId after successful init', async () => {
    render(
      <LiffProvider>
        <TestConsumer />
      </LiffProvider>,
    );
    await waitFor(() =>
      expect(screen.getByTestId('initialized').textContent).toBe('true'),
    );
    expect(screen.getByTestId('logged-in').textContent).toBe('true');
    expect(screen.getByTestId('name').textContent).toBe('Test User');
    expect(screen.getByTestId('user-id').textContent).toBe('uuid-123');
    expect(screen.getByTestId('error').textContent).toBe('none');
  });

  it('renders children after init', async () => {
    render(
      <LiffProvider>
        <span data-testid="child">Hello</span>
      </LiffProvider>,
    );
    await waitFor(() => expect(screen.getByTestId('child')).toBeInTheDocument());
  });

  it('shows error UI when LIFF_ID is missing', async () => {
    vi.stubEnv('NEXT_PUBLIC_LIFF_ID', '');

    render(
      <LiffProvider>
        <TestConsumer />
      </LiffProvider>,
    );
    await waitFor(() =>
      expect(screen.getByText(/Initialization Error/i)).toBeInTheDocument(),
    );
    expect(screen.getByText(/NEXT_PUBLIC_LIFF_ID/)).toBeInTheDocument();

    vi.stubEnv('NEXT_PUBLIC_LIFF_ID', 'test-liff-id');
  });

  it('redirects to LINE login when not logged in', async () => {
    const liff = (await import('@line/liff')).default;
    vi.mocked(liff.isLoggedIn).mockReturnValueOnce(false);

    render(
      <LiffProvider>
        <TestConsumer />
      </LiffProvider>,
    );
    await waitFor(() => expect(liff.login).toHaveBeenCalled());
  });
});
