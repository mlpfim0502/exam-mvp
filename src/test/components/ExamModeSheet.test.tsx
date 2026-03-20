// src/test/components/ExamModeSheet.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';
import ExamModeSheet from '@/components/ExamModeSheet';

const exam = { id: 'e1', subject_id: 's1', title: 'B09 Midterm', description: null, time_limit_minutes: 60, created_at: '' };

describe('ExamModeSheet', () => {
  it('renders exam title and mode options', () => {
    render(<ExamModeSheet exam={exam} onClose={vi.fn()} onStart={vi.fn()} />);
    expect(screen.getByText('B09 Midterm')).toBeInTheDocument();
    expect(screen.getByText('Memory')).toBeInTheDocument();
    expect(screen.getByText('Practice')).toBeInTheDocument();
    expect(screen.getByText('Test')).toBeInTheDocument();
  });

  it('calls onStart with selected mode when Start is clicked', () => {
    const onStart = vi.fn();
    render(<ExamModeSheet exam={exam} onClose={vi.fn()} onStart={onStart} />);
    fireEvent.click(screen.getByText('Start'));
    expect(onStart).toHaveBeenCalledWith(expect.objectContaining({ mode: 'practice' }));
  });

  it('calls onClose when backdrop is clicked', () => {
    const onClose = vi.fn();
    render(<ExamModeSheet exam={exam} onClose={onClose} onStart={vi.fn()} />);
    fireEvent.click(screen.getByTestId('sheet-backdrop'));
    expect(onClose).toHaveBeenCalled();
  });
});
