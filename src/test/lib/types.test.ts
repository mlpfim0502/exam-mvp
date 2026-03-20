// src/test/lib/types.test.ts
// Compile-time contract tests: these verify TypeScript interfaces compile correctly.
// The runtime assertions are intentionally simple; the real value is that TypeScript
// will error at compile time if the interface contracts change incompatibly.
import { describe, it, expect } from 'vitest';
import type { Class, Subject } from '@/lib/types';

describe('Class interface', () => {
  it('satisfies the expected contract', () => {
    const cls: Class = {
      id: 'uuid-1',
      name: 'M5',
      created_at: '2026-01-01T00:00:00Z',
    };
    expect(cls.id).toBe('uuid-1');
    expect(cls.name).toBe('M5');
    expect(cls.created_at).toBe('2026-01-01T00:00:00Z');
  });
});

describe('Subject interface', () => {
  it('accepts a null class_id', () => {
    const subject: Subject = {
      id: 'uuid-2',
      name: 'Math',
      description: null,
      icon_url: null,
      class_id: null,
      created_at: '2026-01-01T00:00:00Z',
    };
    expect(subject.class_id).toBeNull();
  });

  it('accepts a non-null class_id', () => {
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
