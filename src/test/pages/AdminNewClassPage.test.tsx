import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import AdminNewClassPage from '@/app/admin/classes/new/page';

vi.mock('@/app/admin/actions', () => ({
  createClass: vi.fn().mockResolvedValue({ success: true }),
}));

vi.mock('sonner', () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

describe('AdminNewClassPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the form with a class name input', () => {
    render(<AdminNewClassPage />);
    expect(screen.getByLabelText(/class name/i)).toBeInTheDocument();
  });

  it('renders a submit button', () => {
    render(<AdminNewClassPage />);
    expect(screen.getByRole('button', { name: /create class/i })).toBeInTheDocument();
  });

  it('shows loading state while submitting', async () => {
    const { createClass } = await import('@/app/admin/actions');
    (createClass as ReturnType<typeof vi.fn>).mockImplementation(
      () => new Promise((r) => setTimeout(() => r({ success: true }), 200))
    );
    render(<AdminNewClassPage />);
    fireEvent.change(screen.getByLabelText(/class name/i), { target: { value: 'M7' } });
    fireEvent.click(screen.getByRole('button', { name: /create class/i }));
    expect(screen.getByText(/creating/i)).toBeInTheDocument();
  });

  it('calls createClass with form data on submit', async () => {
    const { createClass } = await import('@/app/admin/actions');
    render(<AdminNewClassPage />);
    fireEvent.change(screen.getByLabelText(/class name/i), { target: { value: 'M7' } });
    fireEvent.click(screen.getByRole('button', { name: /create class/i }));
    await waitFor(() => expect(createClass).toHaveBeenCalled());
  });

  it('shows error toast when action returns error', async () => {
    const { createClass } = await import('@/app/admin/actions');
    (createClass as ReturnType<typeof vi.fn>).mockResolvedValue({ success: false, error: 'Duplicate name' });
    const { toast } = await import('sonner');
    render(<AdminNewClassPage />);
    fireEvent.change(screen.getByLabelText(/class name/i), { target: { value: 'M5' } });
    fireEvent.click(screen.getByRole('button', { name: /create class/i }));
    await waitFor(() => expect(toast.error).toHaveBeenCalledWith('Duplicate name'));
  });

  it('shows success toast when action succeeds', async () => {
    const { createClass } = await import('@/app/admin/actions');
    (createClass as ReturnType<typeof vi.fn>).mockResolvedValue({ success: true });
    const { toast } = await import('sonner');
    render(<AdminNewClassPage />);
    fireEvent.change(screen.getByLabelText(/class name/i), { target: { value: 'M7' } });
    fireEvent.click(screen.getByRole('button', { name: /create class/i }));
    await waitFor(() => expect(toast.success).toHaveBeenCalledWith('Class created!'));
  });
});
