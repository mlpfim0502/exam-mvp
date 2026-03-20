import { render, screen } from '@testing-library/react';
import QbankIndexPage from '@/app/(mobile)/qbank/page';

describe('QbankIndexPage', () => {
  it('renders select a subject heading', () => {
    render(<QbankIndexPage />);
    expect(screen.getByText('Select a subject')).toBeInTheDocument();
  });

  it('renders Go to Class link pointing to /', () => {
    render(<QbankIndexPage />);
    const link = screen.getByRole('link', { name: /go to class/i });
    expect(link).toHaveAttribute('href', '/');
  });
});
