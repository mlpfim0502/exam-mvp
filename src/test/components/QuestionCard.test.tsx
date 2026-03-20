import { render, screen, fireEvent } from '@testing-library/react';
import QuestionCard from '@/components/QuestionCard';
import type { Question } from '@/lib/types';

const mcqQuestion: Question = {
  id: 'q-1',
  exam_id: 'exam-1',
  q_num: 1,
  type: 'MCQ',
  stem: 'What is 2 + 2?',
  stem_img_url: null,
  opt_a: 'Three',
  opt_b: 'Four',
  opt_c: 'Five',
  opt_d: 'Six',
  opt_e: null,
  answer: 'B',
  explanation: 'Basic arithmetic',
  explanation_img_url: null,
  created_at: '2024-01-01T00:00:00Z',
};

const tfQuestion: Question = {
  ...mcqQuestion,
  id: 'q-2',
  q_num: 2,
  type: 'TF',
  stem: 'The sky is blue.',
  opt_a: null,
  opt_b: null,
  opt_c: null,
  opt_d: null,
  answer: 'T',
};

describe('QuestionCard — MCQ', () => {
  it('renders question stem', () => {
    render(<QuestionCard question={mcqQuestion} selected={null} onSelect={vi.fn()} />);
    expect(screen.getByText('What is 2 + 2?')).toBeInTheDocument();
  });

  it('renders question number badge', () => {
    render(<QuestionCard question={mcqQuestion} selected={null} onSelect={vi.fn()} />);
    expect(screen.getByText('Q1')).toBeInTheDocument();
  });

  it('renders MCQ type label', () => {
    render(<QuestionCard question={mcqQuestion} selected={null} onSelect={vi.fn()} />);
    expect(screen.getByText('Multiple Choice')).toBeInTheDocument();
  });

  it('renders all non-null MCQ options', () => {
    render(<QuestionCard question={mcqQuestion} selected={null} onSelect={vi.fn()} />);
    expect(screen.getByText('Three')).toBeInTheDocument();
    expect(screen.getByText('Four')).toBeInTheDocument();
    expect(screen.getByText('Five')).toBeInTheDocument();
    expect(screen.getByText('Six')).toBeInTheDocument();
  });

  it('does not render null opt_e option', () => {
    render(<QuestionCard question={mcqQuestion} selected={null} onSelect={vi.fn()} />);
    // 4 option buttons rendered (A-D), no E
    const buttons = screen.getAllByRole('button');
    expect(buttons).toHaveLength(4);
  });

  it('calls onSelect with correct key when option clicked', () => {
    const onSelect = vi.fn();
    render(<QuestionCard question={mcqQuestion} selected={null} onSelect={onSelect} />);
    fireEvent.click(screen.getByText('Four'));
    expect(onSelect).toHaveBeenCalledWith('B');
  });

  it('applies selected styles when option is selected', () => {
    const { container } = render(
      <QuestionCard question={mcqQuestion} selected="B" onSelect={vi.fn()} />,
    );
    const buttons = container.querySelectorAll('button');
    // Button B (index 1) should have selected classes
    expect(buttons[1].className).toContain('border-indigo-500');
  });

  it('renders stem image when provided', () => {
    const withImg = { ...mcqQuestion, stem_img_url: 'https://example.com/stem.png' };
    const { container } = render(
      <QuestionCard question={withImg} selected={null} onSelect={vi.fn()} />,
    );
    const img = container.querySelector('img');
    expect(img).toHaveAttribute('src', 'https://example.com/stem.png');
  });
});

describe('QuestionCard — TF', () => {
  it('renders True/False type label', () => {
    render(<QuestionCard question={tfQuestion} selected={null} onSelect={vi.fn()} />);
    expect(screen.getByText('True / False')).toBeInTheDocument();
  });

  it('renders True and False options', () => {
    render(<QuestionCard question={tfQuestion} selected={null} onSelect={vi.fn()} />);
    expect(screen.getByText('True')).toBeInTheDocument();
    expect(screen.getByText('False')).toBeInTheDocument();
  });

  it('calls onSelect with T when True clicked', () => {
    const onSelect = vi.fn();
    render(<QuestionCard question={tfQuestion} selected={null} onSelect={onSelect} />);
    fireEvent.click(screen.getByText('True'));
    expect(onSelect).toHaveBeenCalledWith('T');
  });

  it('calls onSelect with F when False clicked', () => {
    const onSelect = vi.fn();
    render(<QuestionCard question={tfQuestion} selected={null} onSelect={onSelect} />);
    fireEvent.click(screen.getByText('False'));
    expect(onSelect).toHaveBeenCalledWith('F');
  });

  it('renders exactly 2 buttons for TF', () => {
    render(<QuestionCard question={tfQuestion} selected={null} onSelect={vi.fn()} />);
    expect(screen.getAllByRole('button')).toHaveLength(2);
  });
});
