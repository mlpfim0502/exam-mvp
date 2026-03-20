import { render, screen } from '@testing-library/react';
import { vi } from 'vitest';
import QbankPage from '@/app/(mobile)/qbank/[subjectId]/page';

vi.mock('next/navigation', () => ({
  useRouter: vi.fn(() => ({ push: vi.fn() })),
  usePathname: vi.fn(() => '/qbank/s1'),
  useParams: vi.fn(() => ({ subjectId: 's1' })),
}));

vi.mock('@/hooks/useSubjects', () => ({
  useSubjects: () => ({
    subjects: [{ id: 's1', name: 'Cardiology', description: null, icon_url: null, class_id: null, created_at: '' }],
    loading: false,
  }),
}));

vi.mock('@/hooks/useExams', () => ({
  useExams: () => ({
    exams: [
      { id: 'e1', subject_id: 's1', title: 'B09 Midterm', description: null, time_limit_minutes: 60, created_at: '2024-01-01' },
    ],
    loading: false,
  }),
}));

describe('QbankPage', () => {
  it('shows subject name in header', async () => {
    render(<QbankPage params={Promise.resolve({ subjectId: 's1' })} />);
    expect(await screen.findByText('Cardiology')).toBeInTheDocument();
  });

  it('shows exam in list', async () => {
    render(<QbankPage params={Promise.resolve({ subjectId: 's1' })} />);
    expect(await screen.findByText('B09 Midterm')).toBeInTheDocument();
  });

  it('shows filter tabs', async () => {
    render(<QbankPage params={Promise.resolve({ subjectId: 's1' })} />);
    expect(await screen.findByText('Wrong')).toBeInTheDocument();
    expect(screen.getByText('Note')).toBeInTheDocument();
    expect(screen.getByText('Collection')).toBeInTheDocument();
    expect(screen.getByText('Stats')).toBeInTheDocument();
  });
});
