import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import AdminNewSubjectPage from '@/app/admin/subjects/new/page';

vi.mock('@/app/admin/actions', () => ({
  createSubject: vi.fn().mockResolvedValue({ success: true }),
}));

vi.mock('@/hooks/useClasses', () => ({
  useClasses: vi.fn(() => ({
    classes: [
      { id: 'c1', name: 'M5', created_at: '' },
      { id: 'c2', name: 'M6', created_at: '' },
    ],
    loading: false,
    error: null,
  })),
}));

vi.mock('sonner', () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

describe('AdminNewSubjectPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the subject name input', () => {
    render(<AdminNewSubjectPage />);
    expect(screen.getByLabelText(/subject name/i)).toBeInTheDocument();
  });

  it('renders the class dropdown', () => {
    render(<AdminNewSubjectPage />);
    expect(screen.getByLabelText(/class/i)).toBeInTheDocument();
  });

  it('populates the class dropdown with classes', () => {
    render(<AdminNewSubjectPage />);
    expect(screen.getByText('M5')).toBeInTheDocument();
    expect(screen.getByText('M6')).toBeInTheDocument();
  });

  it('renders a submit button', () => {
    render(<AdminNewSubjectPage />);
    expect(screen.getByRole('button', { name: /create subject/i })).toBeInTheDocument();
  });

  it('shows loading state while submitting', async () => {
    const { createSubject } = await import('@/app/admin/actions');
    (createSubject as ReturnType<typeof vi.fn>).mockImplementation(
      () => new Promise((r) => setTimeout(() => r({ success: true }), 200))
    );
    render(<AdminNewSubjectPage />);
    fireEvent.change(screen.getByLabelText(/subject name/i), { target: { value: 'Math' } });
    fireEvent.click(screen.getByRole('button', { name: /create subject/i }));
    expect(screen.getByText(/creating/i)).toBeInTheDocument();
  });

  it('shows error toast when action returns error', async () => {
    const { createSubject } = await import('@/app/admin/actions');
    (createSubject as ReturnType<typeof vi.fn>).mockResolvedValue({ success: false, error: 'Duplicate subject' });
    const { toast } = await import('sonner');
    render(<AdminNewSubjectPage />);
    fireEvent.change(screen.getByLabelText(/subject name/i), { target: { value: 'Math' } });
    fireEvent.click(screen.getByRole('button', { name: /create subject/i }));
    await waitFor(() => expect(toast.error).toHaveBeenCalledWith('Duplicate subject'));
  });

  it('shows success toast when action succeeds', async () => {
    const { createSubject } = await import('@/app/admin/actions');
    (createSubject as ReturnType<typeof vi.fn>).mockResolvedValue({ success: true });
    const { toast } = await import('sonner');
    render(<AdminNewSubjectPage />);
    fireEvent.change(screen.getByLabelText(/subject name/i), { target: { value: 'Math' } });
    fireEvent.click(screen.getByRole('button', { name: /create subject/i }));
    await waitFor(() => expect(toast.success).toHaveBeenCalledWith('Subject created!'));
  });
});
