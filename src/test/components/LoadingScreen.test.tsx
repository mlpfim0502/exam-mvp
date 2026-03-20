import { render, screen } from '@testing-library/react';
import LoadingScreen from '@/components/LoadingScreen';

describe('LoadingScreen', () => {
  it('renders default message', () => {
    render(<LoadingScreen />);
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('renders custom message', () => {
    render(<LoadingScreen message="Connecting to LINE..." />);
    expect(screen.getByText('Connecting to LINE...')).toBeInTheDocument();
  });

  it('renders spinner element', () => {
    const { container } = render(<LoadingScreen />);
    expect(container.querySelector('.animate-spin')).toBeInTheDocument();
  });
});
