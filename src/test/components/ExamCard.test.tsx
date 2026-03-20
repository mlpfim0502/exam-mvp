import { render, screen } from '@testing-library/react';
import ExamCard from '@/components/ExamCard';
import type { Exam } from '@/lib/types';

const exam: Exam = {
  id: 'exam-1',
  subject_id: 'sub-1',
  title: 'Algebra Basics',
  description: 'Core algebra concepts',
  time_limit_minutes: 15,
  created_at: '2024-01-01T00:00:00Z',
};

describe('ExamCard', () => {
  it('renders exam title', () => {
    render(<ExamCard exam={exam} />);
    expect(screen.getByText('Algebra Basics')).toBeInTheDocument();
  });

  it('renders exam description', () => {
    render(<ExamCard exam={exam} />);
    expect(screen.getByText('Core algebra concepts')).toBeInTheDocument();
  });

  it('does not render description when null', () => {
    render(<ExamCard exam={{ ...exam, description: null }} />);
    expect(screen.queryByText('Core algebra concepts')).not.toBeInTheDocument();
  });

  it('renders time limit in minutes', () => {
    render(<ExamCard exam={exam} />);
    expect(screen.getByText('15 min')).toBeInTheDocument();
  });

  it('does not render time when null', () => {
    render(<ExamCard exam={{ ...exam, time_limit_minutes: null }} />);
    expect(screen.queryByText(/min/)).not.toBeInTheDocument();
  });

  it('renders Start link pointing to correct exam URL', () => {
    render(<ExamCard exam={exam} />);
    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', '/exam/exam-1');
  });

  it('Start link contains text', () => {
    render(<ExamCard exam={exam} />);
    expect(screen.getByRole('link')).toHaveTextContent('Start');
  });
});
