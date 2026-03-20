import '@testing-library/jest-dom';
import React from 'react';
import { vi } from 'vitest';

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useParams: vi.fn(() => ({ id: 'exam-123' })),
  useRouter: vi.fn(() => ({ push: vi.fn() })),
  useSearchParams: vi.fn(() => ({ get: vi.fn(() => 'attempt-abc') })),
  usePathname: vi.fn(() => '/'),
}));

// Mock next/image — renders a plain <img> in test env
vi.mock('next/image', () => ({
  default: ({ src, alt, width, height, className }: {
    src: string;
    alt: string;
    width?: number;
    height?: number;
    className?: string;
  }) => (
    <img src={src} alt={alt} width={width} height={height} className={className} />
  ),
}));

// Mock next/link — renders a plain <a> in test env
vi.mock('next/link', () => ({
  default: ({ href, children, className }: {
    href: string;
    children: React.ReactNode;
    className?: string;
  }) => (
    <a href={href} className={className}>{children}</a>
  ),
}));
