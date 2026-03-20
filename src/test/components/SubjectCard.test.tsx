import { render, screen, fireEvent } from '@testing-library/react';
import SubjectCard from '@/components/SubjectCard';
import type { Subject } from '@/lib/types';

const subject: Subject = {
  id: 'sub-1',
  name: 'Mathematics',
  description: 'Algebra and more',
  icon_url: null,
  created_at: '2024-01-01T00:00:00Z',
};

describe('SubjectCard', () => {
  it('renders subject name', () => {
    render(<SubjectCard subject={subject} isSelected={false} onClick={vi.fn()} />);
    expect(screen.getByText('Mathematics')).toBeInTheDocument();
  });

  it('renders description', () => {
    render(<SubjectCard subject={subject} isSelected={false} onClick={vi.fn()} />);
    expect(screen.getByText('Algebra and more')).toBeInTheDocument();
  });

  it('does not render description when null', () => {
    const noDesc = { ...subject, description: null };
    render(<SubjectCard subject={noDesc} isSelected={false} onClick={vi.fn()} />);
    expect(screen.queryByText('Algebra and more')).not.toBeInTheDocument();
  });

  it('calls onClick when clicked', () => {
    const onClick = vi.fn();
    render(<SubjectCard subject={subject} isSelected={false} onClick={onClick} />);
    fireEvent.click(screen.getByRole('button'));
    expect(onClick).toHaveBeenCalledOnce();
  });

  it('applies selected border when isSelected=true', () => {
    const { container } = render(
      <SubjectCard subject={subject} isSelected={true} onClick={vi.fn()} />,
    );
    const btn = container.querySelector('button');
    expect(btn?.className).toContain('border-indigo-500');
  });

  it('applies unselected border when isSelected=false', () => {
    const { container } = render(
      <SubjectCard subject={subject} isSelected={false} onClick={vi.fn()} />,
    );
    const btn = container.querySelector('button');
    expect(btn?.className).toContain('border-gray-100');
  });

  it('renders icon_url image when provided', () => {
    const withIcon = { ...subject, icon_url: 'https://example.com/icon.png' };
    const { container } = render(
      <SubjectCard subject={withIcon} isSelected={false} onClick={vi.fn()} />,
    );
    const img = container.querySelector('img');
    expect(img).toHaveAttribute('src', 'https://example.com/icon.png');
  });
});
