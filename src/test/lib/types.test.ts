import { describe, it, expect } from 'vitest';
import type { Class, Subject } from '@/lib/types';

describe('Class type', () => {
  it('has expected shape', () => {
    const cls: Class = {
      id: 'uuid-1',
      name: 'M5',
      created_at: '2026-01-01T00:00:00Z',
    };
    expect(cls.name).toBe('M5');
  });
});

describe('Subject type', () => {
  it('accepts class_id', () => {
    const subject: Subject = {
      id: 'uuid-2',
      name: 'Math',
      description: null,
      icon_url: null,
      class_id: 'uuid-1',
      created_at: '2026-01-01T00:00:00Z',
    };
    expect(subject.class_id).toBe('uuid-1');
  });
});
